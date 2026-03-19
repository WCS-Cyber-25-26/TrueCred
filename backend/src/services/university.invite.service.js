import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/client.js';
import { generateInviteToken, hashInviteToken} from '../utils/token.js';
import { generateWallet, registerUniversityOnChain, fundWallet } from '../utils/blockchain.js';
import { storePrivateKey } from '../utils/vault.js';

const INVITE_EXPIRY_HOURS = 24;

const rawToken = generateInviteToken();
const hashedToken = hashInviteToken(rawToken);

const universityInviteService = {
    async acceptInvite({ token, password }) {
    const hashedToken = hashInviteToken(token);

    const invite = await prisma.universityInvitation.findUnique({
      where: { token: hashedToken },
      include: { university: { include: { user: true } } },
    });

    if (!invite) throw new Error('Invalid invitation token');
    if (invite.acceptedAt) throw new Error('Invitation already used');
    if (invite.expiresAt < new Date()) throw new Error('Invitation expired');

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: invite.university.userId },
        data: { password: hashedPassword },
      }),
      prisma.university.update({
        where: { id: invite.universityId },
        data: { domainVerified: true, verifiedAt: new Date() },
      }),
      prisma.universityInvitation.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    let chainEnabled = false;
    let blockchainId = null;
    try {
      const { address, privateKey } = generateWallet();
      await storePrivateKey(invite.universityId, privateKey);
      await registerUniversityOnChain(address, invite.universityId, invite.university.name);
      await fundWallet(address);
      blockchainId = address;
      chainEnabled = true;
    } catch (e) {
      console.error('Blockchain onboarding failed during invite accept:', e.message);
    }
    await prisma.university.update({
      where: { id: invite.universityId },
      data: { blockchainId, chainEnabled },
    });

    return { message: 'University account activated successfully' };
  },
}

export default universityInviteService;