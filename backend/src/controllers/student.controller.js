const studentService = require('../services/student.service');

exports.addStudent = async (req, res) => {
  try {
    res.status(200).send("Student added successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    res.status(200).send("Student retrieval successful");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};