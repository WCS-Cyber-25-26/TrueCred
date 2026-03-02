import express from 'express';
import { getAllUniversities, revokeUniversity, sendInvite, updateUniversity, getUniversityById} from '../controllers/admin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/universities/invite', authMiddleware, adminMiddleware, sendInvite);
router.post('/universities/:id/revoke', authMiddleware, adminMiddleware, revokeUniversity);
router.patch('/universities/:id', authMiddleware, adminMiddleware, updateUniversity);
router.get('/universities', authMiddleware, adminMiddleware, getAllUniversities);
router.get('/universities/:id', authMiddleware, adminMiddleware, getUniversityById);

export default router;