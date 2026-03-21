import prisma from '../../prisma/client.js';
import { extractFields } from '../utils/extractor.js';
import { getAiScore } from '../utils/aiClient.js';
import { verifyCredentialOnChain } from '../utils/blockchain.js';
import { canonicalize, hashCanonicalString, verifyRSASign } from '../../services/canonical-service/canonicalize.js';

function combineSignals(blockchainSignal, aiSignal) {
  if (blockchainSignal === 'revoked') return 'revoked';
  if (blockchainSignal === 'verified' && aiSignal === 'authentic') return 'verified';
  if (blockchainSignal === 'verified' && aiSignal === 'suspicious') return 'verified_tampered';
  if (blockchainSignal === 'not_found' && aiSignal === 'authentic') return 'not_on_chain';
  return 'forged';
}

const verifyService = {
  async verifyFromFields(fields, ipAddress, userAgent) {
    const job = await prisma.verificationJob.create({
      data: { status: 'PROCESSING', ipAddress, userAgent },
    });

    try {
      if (!fields.hiddenIdentifier) {
        const err = new Error('hiddenIdentifier is required');
        err.statusCode = 422;
        throw err;
      }

      const canonicalString = canonicalize({
        university: fields.university || '',
        studentName: fields.studentName || '',
        degree: fields.degree || '',
        degreeAwardedDate: fields.degreeAwardedDate || '',
        hiddenIdentifier: fields.hiddenIdentifier,
      });
      const hash = hashCanonicalString(canonicalString);

      let onChain;
      try {
        onChain = await verifyCredentialOnChain('0x' + hash);
      } catch {
        const error = new Error('Blockchain query failed');
        error.statusCode = 500;
        throw error;
      }

      const credential = await prisma.credential.findUnique({
        where: { hiddenIdentifier: fields.hiddenIdentifier },
        include: { university: true, student: true, revocation: true },
      });

      const isRevoked = onChain.revoked || !!credential?.revocation;
      let blockchainSignal;
      if (onChain.issued && isRevoked) blockchainSignal = 'revoked';
      else if (onChain.issued && !isRevoked) blockchainSignal = 'verified';
      else blockchainSignal = 'not_found';

      const verdict = combineSignals(blockchainSignal, 'authentic');

      let rsaVerified = false;
      if (credential?.rsaSignature && credential.university?.rsaPublicKey) {
        try {
          rsaVerified = verifyRSASign(hash, credential.university.rsaPublicKey, credential.rsaSignature);
        } catch {
          rsaVerified = false;
        }
      }

      await prisma.verificationResult.create({
        data: { jobId: job.id, ocrStatus: 'skipped', aiScore: null, blockchainMatch: onChain.issued, verdict },
      });
      await prisma.verificationJob.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      return {
        verdict,
        aiScore: null,
        canonicalHash: hash,
        issuedAt: onChain.issuedAt,
        revokedAt: onChain.revokedAt,
        credential: credential ? {
          degreeName: credential.degreeName,
          program: credential.program,
          awardedDate: credential.awardedDate,
          university: { name: credential.university.name },
        } : null,
        etherscanUrl: credential?.revocation?.txHash
          ? `https://sepolia.etherscan.io/tx/${credential.revocation.txHash}`
          : credential?.txHash
          ? `https://sepolia.etherscan.io/tx/${credential.txHash}`
          : null,
        rsaSignature: credential?.rsaSignature || null,
        universityPublicKey: credential?.university?.rsaPublicKey || null,
        rsaVerified,
      };
    } catch (err) {
      await prisma.verificationJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', completedAt: new Date() },
      }).catch(() => {});
      throw err;
    }
  },

  async verifyFromImage(imageBuffer, ipAddress, userAgent) {
    const job = await prisma.verificationJob.create({
      data: {
        status: 'PROCESSING',
        ipAddress,
        userAgent,
      },
    });

    try {
      // Run OCR and AI scoring in parallel
      const [fields, aiResult] = await Promise.all([
        extractFields(imageBuffer),
        getAiScore(imageBuffer),
      ]);

      // If no cert ID, skip blockchain entirely — AI score is the only signal
      if (!fields.hiddenIdentifier) {
        const aiSignal = aiResult.score >= 0.7 ? 'authentic' : 'suspicious';
        const verdict = aiSignal === 'authentic' ? 'not_on_chain' : 'forged';

        await prisma.verificationResult.create({
          data: {
            jobId: job.id,
            ocrStatus: 'no_cert_id_found',
            verdict,
            aiScore: aiResult.score,
            blockchainMatch: false,
          },
        });
        await prisma.verificationJob.update({
          where: { id: job.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });

        return {
          verdict,
          aiScore: aiResult.score,
          canonicalHash: null,
          issuedAt: null,
          revokedAt: null,
          credential: null,
          etherscanUrl: null,
          rsaSignature: null,
          universityPublicKey: null,
          rsaVerified: false,
        };
      }

      // Build canonical hash from OCR-extracted fields
      const canonicalString = canonicalize({
        university: fields.university || '',
        studentName: fields.studentName || '',
        degree: fields.degree || '',
        degreeAwardedDate: fields.degreeAwardedDate || '',
        hiddenIdentifier: fields.hiddenIdentifier,
      });
      const hash = hashCanonicalString(canonicalString);
      const hashBytes32 = '0x' + hash;

      // Query blockchain
      let onChain;
      try {
        onChain = await verifyCredentialOnChain(hashBytes32);
      } catch (err) {
        const error = new Error('Blockchain query failed');
        error.statusCode = 500;
        throw error;
      }

      // Look up credential in DB by hiddenIdentifier (most reliable lookup)
      const credential = await prisma.credential.findUnique({
        where: { hiddenIdentifier: fields.hiddenIdentifier },
        include: { university: true, student: true, revocation: true },
      });

      // Determine blockchain signal
      const isRevoked = onChain.revoked || !!credential?.revocation;
      let blockchainSignal;
      if (onChain.issued && isRevoked) {
        blockchainSignal = 'revoked';
      } else if (onChain.issued && !isRevoked) {
        blockchainSignal = 'verified';
      } else {
        blockchainSignal = 'not_found';
      }

      const aiSignal = aiResult.score >= 0.7 ? 'authentic' : 'suspicious';
      const verdict = combineSignals(blockchainSignal, aiSignal);

      // RSA verification (if credential found with signature)
      let rsaVerified = false;
      if (credential?.rsaSignature && credential.university?.rsaPublicKey) {
        try {
          rsaVerified = verifyRSASign(hash, credential.university.rsaPublicKey, credential.rsaSignature);
        } catch {
          rsaVerified = false;
        }
      }

      await prisma.verificationResult.create({
        data: {
          jobId: job.id,
          ocrStatus: 'ok',
          aiScore: aiResult.score,
          blockchainMatch: onChain.issued,
          verdict,
        },
      });

      await prisma.verificationJob.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      return {
        verdict,
        aiScore: aiResult.score,
        canonicalHash: hash,
        issuedAt: onChain.issuedAt,
        revokedAt: onChain.revokedAt,
        credential: credential
          ? {
              degreeName: credential.degreeName,
              program: credential.program,
              awardedDate: credential.awardedDate,
              university: { name: credential.university.name },
            }
          : null,
        etherscanUrl: credential?.revocation?.txHash
          ? `https://sepolia.etherscan.io/tx/${credential.revocation.txHash}`
          : credential?.txHash
          ? `https://sepolia.etherscan.io/tx/${credential.txHash}`
          : null,
        rsaSignature: credential?.rsaSignature || null,
        universityPublicKey: credential?.university?.rsaPublicKey || null,
        rsaVerified,
      };
    } catch (err) {
      // If not already failed, mark job as failed
      if (!err.statusCode || err.statusCode !== 422) {
        await prisma.verificationJob.update({
          where: { id: job.id },
          data: { status: 'FAILED', completedAt: new Date() },
        }).catch(() => {});
      }
      throw err;
    }
  },
};

export default verifyService;
