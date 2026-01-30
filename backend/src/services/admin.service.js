import prisma from '../../prisma/client.js';
import { generateInviteToken, hashInviteToken } from '../utils/token.js';

const INVITE_EXPIRY_HOURS = 24;

const adminService = {
    async getAllUniversities() {
        return await prisma.university.findMany({
            select: {
              id: true,
              name: true,
              domain: true,
              domainVerified: true,
              chainEnabled: true,
              createdAt: true,
              userId: true,

              revocation: {
                select: {
                  revokedAt: true,
                  reason: true,
                  revokedBy: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
    },
    async revokeUniversity() {

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