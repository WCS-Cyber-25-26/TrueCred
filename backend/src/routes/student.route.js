import express from 'express';
import { addStudent, getStudent } from '../controllers/student.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

//add authMiddleware later
router.post('/', authMiddleware, addStudent);
router.get('/:id', authMiddleware, getStudent);

export default router;