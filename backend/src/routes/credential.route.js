import express from 'express';
import { issueCredential, issueBulkCredentials, updateCredential, revokeCredentialById, getCredentialById, getCredentialRevocationStatus } from '../controllers/credential.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import universityMiddleware from '../middleware/university.middleware.js';

const router = express.Router();

router.post('/universities/credentials', authMiddleware, universityMiddleware, issueCredential);
router.post('/universities/credentials/bulk', authMiddleware, universityMiddleware, issueBulkCredentials);
router.patch('/universities/credentials/:id', authMiddleware, universityMiddleware, updateCredential);
router.post('/universities/credentials/:id/revoke', authMiddleware, universityMiddleware, revokeCredentialById);
router.get('/universities/credentials/:credentialId', authMiddleware, universityMiddleware, getCredentialById);
router.get('/universities/credentials/:credentialId/revocation-status', authMiddleware, universityMiddleware, getCredentialRevocationStatus);

export default router;