import crypto from 'crypto';
import prisma from '../../prisma/client.js';
import { computeCanonicalHash, issueCredentialOnChain, revokeCredentialOnChain, verifyCredentialOnChain } from '../utils/blockchain.js';
import { getPrivateKey } from '../utils/vault.js';

// pseudonymousId holds the student's school email — unique per student
async function findOrCreateStudent(schoolEmail, fullName) {
  const existing = await prisma.student.findUnique({
    where: { pseudonymousId: schoolEmail },
  });
  if (existing) return existing;

  return prisma.student.create({
    data: {
      fullName,
      pseudonymousId: schoolEmail,
      hiddenIdentifier: crypto.randomUUID(),
    },
  });
}

const credentialService = {
  async issueCredential({ userId, schoolEmail, studentFullName, degreeName, program, awardedDate }) {
    const university = await prisma.university.findUnique({ where: { userId } });
    if (!university) throw new Error('University not found');

    if (!schoolEmail.toLowerCase().endsWith(`@${university.domain.toLowerCase()}`)) {
      const err = new Error(`Student email must belong to ${university.domain}`);
      err.statusCode = 422;
      throw err;
    }

    const student = await findOrCreateStudent(schoolEmail, studentFullName);

    const canonicalHash = computeCanonicalHash({
      studentPseudonymousId: student.pseudonymousId,
      degreeName,
      program,
      awardedDate,
      universityDomain: university.domain,
    });

    const existing = await prisma.credential.findFirst({
      where: { canonicalHash, universityId: university.id },
    });
    if (existing) {
      const err = new Error('Credential already exists for this student');
      err.statusCode = 409;
      throw err;
    }

    const credential = await prisma.credential.create({
      data: {
        canonicalHash,
        degreeName,
        program,
        awardedDate: new Date(awardedDate),
        studentId: student.id,
        universityId: university.id,
      },
    });

    let txHash = null;
    if (university.chainEnabled) {
      try {
        const privateKey = await getPrivateKey(university.id);
        txHash = await issueCredentialOnChain(privateKey, canonicalHash, credential.id);
        await prisma.credential.update({ where: { id: credential.id }, data: { txHash } });
      } catch (e) {
        console.error('On-chain issuance failed, credential saved without txHash:', e.message);
      }
    }

    return { credential, student, txHash };
  },

  async issueBulkCredentials(credentials) {
    return Promise.all(credentials.map((c) => credentialService.issueCredential(c)));
  },

  async updateCredential() {
    throw new Error('Not implemented');
  },

  async revokeCredentialById(credentialId, revokedBy) {
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      include: { university: true, revocation: true },
    });
    if (!credential) throw new Error('Credential not found');
    if (credential.revocation) throw new Error('Credential already revoked');

    let txHash = null;
    if (credential.university.chainEnabled) {
      try {
        const privateKey = await getPrivateKey(credential.university.id);
        txHash = await revokeCredentialOnChain(privateKey, credential.canonicalHash);
      } catch (e) {
        console.error('On-chain revocation failed:', e.message);
      }
    }

    await prisma.credentialRevocation.create({
      data: { credentialId, revokedBy, txHash },
    });

    return { revoked: true, txHash };
  },

  async getCredentialById(credentialId) {
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      include: { student: true, university: true, revocation: true },
    });
    if (!credential) throw new Error('Credential not found');

    let onChain = null;
    if (credential.university.chainEnabled) {
      onChain = await verifyCredentialOnChain(credential.canonicalHash);
    }

    return {
      credential,
      onChain,
      etherscanUrl: credential.txHash
        ? `https://sepolia.etherscan.io/tx/${credential.txHash}`
        : null,
    };
  },

  async getCredentialRevocationStatus(credentialId) {
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      include: { university: true, revocation: true },
    });
    if (!credential) throw new Error('Credential not found');

    const dbRevoked = !!credential.revocation;
    let chainRevoked = null;

    if (credential.university.chainEnabled) {
      const onChain = await verifyCredentialOnChain(credential.canonicalHash);
      chainRevoked = onChain.revoked;
    }

    return {
      dbRevoked,
      chainRevoked,
      revokedAt: credential.revocation?.revokedAt ?? null,
    };
  },
};

export default credentialService;
