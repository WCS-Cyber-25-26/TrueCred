import express from 'express';
import {getStudent, getStudents, getStudentCredential } from '../controllers/student.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import studentMiddleware from '../middleware/student.middleware.js';

const router = express.Router();

router.get('/universities/students', authMiddleware, getStudents);
router.get('/me', authMiddleware, studentMiddleware, getStudent);
router.get('/me/credentials', authMiddleware, studentMiddleware, getStudentCredential);

export default router;