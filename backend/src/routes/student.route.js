import express from 'express';
import { addStudent, getStudent, revokeStudent } from '../controllers/student.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, addStudent);
router.get('/universities/students', authMiddleware, getStudent);
router.get('/:id', authMiddleware, getStudent);
router.put('/:id', authMiddleware, revokeStudent);

export default router;