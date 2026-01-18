import express from 'express';
import { getAllUniversities, revokeUniversity } from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/universities', authMiddleware, adminMiddleware, getAllUniversities);
router.post('/universities/:id/revoke', authMiddleware, adminMiddleware, revokeUniversity);

export default router;