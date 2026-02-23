import express from 'express';
import {getStudent, getStudentCredentials } from '../controllers/student.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import studentMiddleware from '../middleware/student.middleware.js';

const router = express.Router();

router.get('/students/me', authMiddleware, studentMiddleware, getStudent);
router.get('/students/me/credentials', authMiddleware, studentMiddleware, getStudentCredentials);

export default router;