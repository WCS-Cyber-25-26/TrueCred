import universityService from '../services/university.service.js';

export const getUniversity = async (req, res) => {
    try {
        const university = await universityService.getUniversity(req.user.id);
        res.status(200).json(university);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUniversityStudents = async (req, res) => {
    try {
        const students = await universityService.getUniversityStudents(req.user.id, req.query);
        res.status(200).json(students);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getUniversityCredentials = async (req, res) => {
    try {
        res.status(200).send("All university credentials retrieved successfully");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getStudentbyStudentId = async (req, res) => {
    try {
        res.status(200).send("Student details retrieved successfully");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getCredentialsbyStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const userId = req.user?.id;

        const result = await universityService.getCredentialsbyStudentId(studentId, userId);

        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};