import prisma from '../../prisma/client.js';

const studentService = {
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