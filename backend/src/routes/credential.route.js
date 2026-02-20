import express from 'express';
import { getCredentialsByStudent, isCredentialRevoked } from '../controllers/credential.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import universityMiddleware from '../middleware/university.middleware.js';

const router = express.Router();

router.get('/student/:studentId', authMiddleware, universityMiddleware, getCredentialsByStudent);
router.get('/:credentialId/revocation-status', authMiddleware, universityMiddleware, isCredentialRevoked);

export default router;