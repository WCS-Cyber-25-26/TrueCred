import express from 'express';
import { issueCredential, issueBulkCredentials, updateCredential, revokeCredentialById, getCredentialById, getCredentialRevocationStatus } from '../controllers/credential.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import universityMiddleware from '../middleware/university.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, universityMiddleware, issueCredential);
router.post('/bulk', authMiddleware, universityMiddleware, issueBulkCredentials);
router.patch('/:id', authMiddleware, universityMiddleware, updateCredential);
router.post('/:id/revoke', authMiddleware, universityMiddleware, revokeCredentialById);
router.get('/:credentialId', authMiddleware, universityMiddleware, getCredentialById);
router.get('/:credentialId/revocation-status', authMiddleware, universityMiddleware, getCredentialRevocationStatus);

export default router;