import express from 'express';
import { acceptInvite } from '../controllers/university.invite.controller.js';
import { createCredential, bulkCreateCredentials, revokeCredential, updateCredential } from '../controllers/university.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import universityMiddleware from '../middleware/university.middleware.js';

const router = express.Router();

router.post('/invite/accept', acceptInvite);
router.post('/credentials', authMiddleware, universityMiddleware, createCredential);
router.post('/bulk', authMiddleware, universityMiddleware, bulkCreateCredentials);
router.post('/revoke', authMiddleware, universityMiddleware, revokeCredential);
router.put('/:id', authMiddleware, universityMiddleware, updateCredential);

export default router;