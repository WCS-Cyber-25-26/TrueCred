import express from 'express';
import { getAllUniversities, revokeUniversity, sendInvite } from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import universityMiddleware from '../middleware/university.middleware.js';
import { acceptInvite } from '../controllers/university.invite.controller.js';
import { createCredential, bulkCreateCredentials, revokeCredential, updateCredential } from '../controllers/university.controller.js';

const router = express.Router();

router.post('/invitations/accept', acceptInvite);
router.post('/credentials', authMiddleware, universityMiddleware, createCredential);
router.post('/credentials/bulk', authMiddleware, universityMiddleware, bulkCreateCredentials);
router.post('/credentials/revoke', authMiddleware, universityMiddleware, revokeCredential);
router.put('/credentials/:id', authMiddleware, universityMiddleware, updateCredential);

export default router;