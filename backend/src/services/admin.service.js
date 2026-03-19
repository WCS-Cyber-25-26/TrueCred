import crypto from 'crypto';
import prisma from '../../prisma/client.js';
import { generateInviteToken, hashInviteToken } from '../utils/token.js';
import { getPrivateKey } from '../utils/vault.js';
import { registerUniversityOnChain, fundWallet } from '../utils/blockchain.js';

const INVITE_EXPIRY_HOURS = 24;

const adminService = {
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
                id: crypto.randomUUID(),
                email,
                password: '',
                role: 'UNIVERSITY',
            },
        });

        const university = await prisma.university.create({
            data: {
                id: crypto.randomUUID(),
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
    async revokeUniversity(universityId, revokedBy) {
        const university = await prisma.university.findUnique({
            where: { id: universityId },
            include: { revocation: true },
        });
        if (!university) throw new Error('University not found');
        if (university.revocation) throw new Error('University already revoked');

        await prisma.universityRevocation.create({
            data: { universityId, revokedBy },
        });

        return { revoked: true };
    },
    async updateUniversity() {

    },
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
              _count: {
                select: { credentials: true },
              },
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
    async getUniversityById(universityId) {
        const university = await prisma.university.findUnique({
            where: { id: universityId },
            select: {
                id: true,
                name: true,
                domain: true,
                domainVerified: true,
                chainEnabled: true,
                blockchainId: true,
                createdAt: true,
                userId: true,
                revocation: {
                    select: { revokedAt: true, reason: true, revokedBy: true },
                },
                credentials: {
                    select: {
                        id: true,
                        txHash: true,
                        degreeName: true,
                        createdAt: true,
                        student: { select: { fullName: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!university) throw new Error('University not found');

        const [totalCredentials, onChainCredentials] = await Promise.all([
            prisma.credential.count({ where: { universityId } }),
            prisma.credential.count({ where: { universityId, txHash: { not: null } } }),
        ]);

        return {
            ...university,
            stats: { totalCredentials, onChainCredentials },
        };
    },
    async enableChainForUniversity(universityId) {
        const university = await prisma.university.findUnique({ where: { id: universityId } });
        if (!university) throw new Error('University not found');

        let privateKey;
        try {
            privateKey = await getPrivateKey(universityId);
        } catch {
            throw new Error('No wallet key found in Vault. Ask the university to log in first.');
        }

        await registerUniversityOnChain(university.blockchainId, universityId, university.name);
        await fundWallet(university.blockchainId);

        await prisma.university.update({
            where: { id: universityId },
            data: { chainEnabled: true },
        });

        return { blockchainId: university.blockchainId, chainEnabled: true };
    }
}

export default adminService;