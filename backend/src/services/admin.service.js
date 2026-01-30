import prisma from '../../prisma/client.js';
import { generateInviteToken, hashInviteToken } from '../utils/token.js';

const INVITE_EXPIRY_HOURS = 24;

const adminService = {
    async getAllUniversities() {

    },
    async revokeUniversity(userId, { reason }, adminUserId) {
        const university = await prisma.university.findUnique({
            where: { userId },
            include: { revocation: true },
        });

        if (!university) {
            const err = new Error('University not found');
            err.code = 'UNIVERSITY_NOT_FOUND';
            throw err;
        }

        if (university.revocation) {
            const err = new Error('University already revoked');
            err.code = 'ALREADY_REVOKED';
            throw err;
        }

        const revocation = await prisma.universityRevocation.create({
            data: {
                universityId: university.id,
                reason: reason ?? null,
                revokedBy: adminUserId,
            },
        });

        return {
            id: revocation.id,
            universityId: revocation.universityId,
            revokedAt: revocation.revokedAt,
            reason: revocation.reason,
            revokedBy: revocation.revokedBy,
        };
    },
    async sendInvite({ name, domain, email, createdBy }) {
        if (!email.endsWith(`@${domain}`)) {
            throw new Error('Email must match university domain');
        }

        const existingUniversity = await prisma.university.findUnique({
            where: { domain },
        });

        if (existingUniversity) {
            throw new Error('University already exists');
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: '',
                role: 'UNIVERSITY',
            },
        });

        const university = await prisma.university.create({
            data: {
                name,
                domain,
                userId: user.id,
            },
        });

        const rawToken = generateInviteToken();
        const hashedToken = hashInviteToken(rawToken);

        const expiresAt = new Date(
            Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000
        );

        await prisma.universityInvitation.create({
            data: {
                universityId: university.id,
                email,
                token: hashedToken,
                expiresAt,
                createdBy
            },
        });

        //sendInviteEmail(email, rawToken)
        console.log(
            `Invite link: https://yourapp.com/universities/activate?token=${rawToken}`
        );

        return {
            message: 'University invitation sent',
        };
    },
}

export default adminService;