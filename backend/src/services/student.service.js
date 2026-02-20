import prisma from '../../prisma/client.js';

const studentService = {
    async getStudents(authUniversityID, query = {}) {

        const user = await prisma.university.findUnique({
            where: { userId: authUniversityID },
            select: {
                id: true,
            }
        });

        //set the university ID
        const universityId = user.id

        if (!universityId) {
            const err = new Error("User has no university context");
            err.status = 403;
            throw err;
        }

        //query params
        const {
            revoked,
            search,
            degree,
            degreeAwardedFrom,
            degreeAwardedTo,
            createdFrom,
            createdTo,
            page = "1",
            limit = "20",
            sortBy = "createdAt",
            order = "desc"
        } = query;

        //setting pagination params
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum


        //sorting param setting
        const allowedSortFields = ["createdAt", "fullName"];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
        const sortOrder = order === "asc" ? "asc" : "desc";

        let orderBy;

        if (sortField === "createdAt") {
            orderBy = { createdAt: sortOrder };
        } else if (sortField === "fullName") {
            orderBy = { fullName: sortOrder };
        }


        //to make sure each day starts from the beggining of the day
        const startOfDayUTC = (d) => new Date(`${d}T00:00:00.000Z`);
        const endOfDayUTC = (d) => new Date(`${d}T23:59:59.999Z`);

        const credentialMatch = { universityId };

        //search by degree name
        if (degree?.trim()) {
            credentialMatch.degreeName = {
                equals: degree.trim(), mode: "insensitive"
            }
        }

        //filter by degree awarded date
        if (degreeAwardedFrom || degreeAwardedTo) {
            credentialMatch.awardedDate = {
                ...(degreeAwardedFrom ? { gte: startOfDayUTC(degreeAwardedFrom) } : {}),
                ...(degreeAwardedTo ? { lte: endOfDayUTC(degreeAwardedTo) } : {}),
            };
        }

        //Field builder
        const where = { AND: [] };

        //revoked query param
        if (revoked === "true") {
            where.AND.push({
                credentials: {
                    some: { ...credentialMatch, revocation: { isNot: null } },
                },
            });
        } else if (revoked === "false") {
            where.AND.push({
                credentials: {
                    none: { ...credentialMatch, revocation: { isNot: null } },
                },
            });
        } else {
            //default: must have at least 1 credential from this university
            where.AND.push({
                credentials: { some: credentialMatch },
            });
        }

        //search by full name
        if (search?.trim()) {
            where.AND.push({
                fullName: { contains: search.trim(), mode: "insensitive" }
            })
        }

        //filter by student creation date
        if (createdFrom || createdTo) {
            where.AND.push({
                createdAt: {
                    ...(createdFrom ? { gte: startOfDayUTC(createdFrom) } : {}),
                    ...(createdTo ? { lte: endOfDayUTC(createdTo) } : {}),
                },
            });
        }

        //db query to pull all information
        const studentsPage = await prisma.student.findMany({
            where: where,
            orderBy,
            skip,
            take: limitNum,
            select: {
                id: true,
                pseudonymousId: true,
                fullName: true,
                hiddenIdentifier: true,
                createdAt: true,

                credentials: {
                    where: { universityId },
                    orderBy: { awardedDate: "desc" },
                    select: {
                        degreeName: true,
                        awardedDate: true,
                    }
                },
            }

        });

        if (studentsPage.length === 0) return [];

        const studentIds = studentsPage.map((s) => s.id);

        //count number of credentials per student
        const credCounts = await prisma.credential.groupBy({
            by: ["studentId"],
            where: {
                universityId,
                studentId: { in: studentIds },
            },
            _count: { _all: true },
        });

        //count revoked counts for each student
        const revokedCounts = await prisma.credential.groupBy({
            by: ["studentId"],
            where: {
                universityId,
                studentId: { in: studentIds },
                revocation: { isNot: null },
            },
            _count: { _all: true },
        });

        const credCountMap = new Map(credCounts.map((r) => [r.studentId, r._count._all]));
        const revokedCountMap = new Map(
            revokedCounts.map((r) => [r.studentId, r._count._all])
        );

        //format output
        return studentsPage.map((s) => {

            return {
                id: s.id,
                pseudonymousId: s.pseudonymousId,
                fullName: s.fullName,

                hiddenIdentifier: s.hiddenIdentifier,
                createdAt: s.createdAt,

                credentials: s.credentials.map((c) => ({
                    degreeName: c.degreeName,
                    awardedDate: c.awardedDate,
                })),

                credentialsCount: credCountMap.get(s.id) ?? 0,
                revokedCredentialsCount: revokedCountMap.get(s.id) ?? 0,
            };
        });
    },

    async getStudent(userId) {
        const student = await prisma.student.findUnique({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                fullName: true,
                pseudonymousId: true,
                hiddenIdentifier: true,
                createdAt: true,
            },
        });

        if (!student) {
            throw new Error("Student profile not found");
        }

        return student;
    },

    async getStudentCredential(studentId) {
        const credentials = await prisma.credential.findMany({
            where: {
                studentId: studentId,
            },
            select: {
                id: true,
                degreeName: true,
                program: true,
                awardedDate: true,
                canonicalHash: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return credentials;
    },
}

export default studentService;