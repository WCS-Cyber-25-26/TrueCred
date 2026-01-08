import express from 'express';
import { addStudent, getStudent } from '../controllers/student.controller.js';

const router = express.Router();

//add authMiddleware later
router.post('/', addStudent);
router.get('/:id', getStudent);

export default router;
