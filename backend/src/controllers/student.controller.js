import studentService from '../services/student.service.js';


export const addStudent = async (req, res) => {
  try {
    res.status(200).send("Student added successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudent = async (req, res) => {
  try {
    res.status(200).send("Student retrieval successful");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};