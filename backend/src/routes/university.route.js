import express from 'express';
import { getAllUniversities, revokeUniversity, sendInvite } from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';
import { acceptInvite } from '../controllers/university.invite.controller.js';

const router = express.Router();

router.post('/invitations/accept', acceptInvite);

export default router;