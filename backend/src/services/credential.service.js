import crypto from 'crypto';
import prisma from '../../prisma/client.js';
import { issueCredentialOnChain, revokeCredentialOnChain, verifyCredentialOnChain } from '../utils/blockchain.js';
import { getPrivateKey, getRsaPrivateKey } from '../utils/vault.js';
import { canonicalize, hashCanonicalString, signStudentRecord } from '../../services/canonical-service/canonicalize.js';

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

function generateHiddenIdentifier() {
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
  const parts = hex.match(/.{4}/g);
  return `TC-${parts[0]}-${parts[1]}`;
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

    // Generate a unique credential identifier printed on the PDF
    const hiddenIdentifier = generateHiddenIdentifier();

    // Format date as YYYY-MM-DD for canonical service
    const awardedDateStr = new Date(awardedDate).toISOString().split('T')[0];

    // Compute canonical hash using canonical-service (SHA-256)
    const canonicalString = canonicalize({
      university: university.name,
      studentName: student.fullName,
      degree: degreeName,
      degreeAwardedDate: awardedDateStr,
      hiddenIdentifier,
    });
    const hash = hashCanonicalString(canonicalString);
    const canonicalHash = hash; // store without 0x prefix in DB

    const existing = await prisma.credential.findFirst({
      where: { canonicalHash, universityId: university.id },
    });
    if (existing) {
      const err = new Error('Credential already exists for this student');
      err.statusCode = 409;
      throw err;
    }

    // RSA sign the canonical hash (requires university to have chain enabled with RSA key)
    let rsaSignature = null;
    if (university.chainEnabled) {
      try {
        const rsaPrivateKey = await getRsaPrivateKey(university.id);
        const { signature } = signStudentRecord(hash, rsaPrivateKey);
        rsaSignature = signature;
      } catch (e) {
        console.warn('RSA signing skipped (key not found):', e.message);
      }
    }

    const credential = await prisma.credential.create({
      data: {
        canonicalHash,
        degreeName,
        program,
        awardedDate: new Date(awardedDate),
        hiddenIdentifier,
        rsaSignature,
        studentId: student.id,
        universityId: university.id,
      },
    });

    let txHash = null;
    if (university.chainEnabled) {
      try {
        const privateKey = await getPrivateKey(university.id);
        txHash = await issueCredentialOnChain(privateKey, '0x' + canonicalHash, credential.id);
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
        txHash = await revokeCredentialOnChain(privateKey, '0x' + credential.canonicalHash);
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
      onChain = await verifyCredentialOnChain('0x' + credential.canonicalHash);
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
      const onChain = await verifyCredentialOnChain('0x' + credential.canonicalHash);
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
