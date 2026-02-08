import express from 'express';
import { getAllUniversities, revokeUniversity, sendInvite } from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/universities', authMiddleware, adminMiddleware, getAllUniversities);
router.post('/universities/:id/revoke', authMiddleware, adminMiddleware, revokeUniversity);
router.post('/universities/invite', authMiddleware, adminMiddleware, sendInvite);

export default router;