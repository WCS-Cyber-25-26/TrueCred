import express from 'express';
import { acceptInvite } from '../controllers/university.invite.controller.js';
import { getUniversity, getUniversityStudents, getUniversityCredentials, getStudentbyStudentId, getCredentialsbyStudentId } from '../controllers/university.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import universityMiddleware from '../middleware/university.middleware.js';
import { get } from 'http';

const router = express.Router();

router.post('/invite/accept', acceptInvite);
router.get('/me', authMiddleware, universityMiddleware, getUniversity);
router.get('/me/students', authMiddleware, universityMiddleware, getUniversityStudents);
router.get('/me/credentials', authMiddleware, universityMiddleware, getUniversityCredentials);
router.get('/students/:studentId', authMiddleware, universityMiddleware, getStudentbyStudentId);
router.get('/students/:studentId/credentials', authMiddleware, universityMiddleware, getCredentialsbyStudentId);

export default router;