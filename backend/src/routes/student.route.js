const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', studentController.addStudent);
router.get('/:id', studentController.getStudent);

module.exports = router;
