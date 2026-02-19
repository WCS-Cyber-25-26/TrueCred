import studentService from '../services/student.service.js';

export const getStudent = async (req, res) => {
  try {
    const student = await studentService.getStudent(req.user.id);
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getStudentCredential = async (req, res) => {
  try {
    const studentCredential = await studentService.getStudentCredential(req.user.id);
    res.json(studentCredential);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};