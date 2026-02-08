import universityService from '../services/university.service.js';

export const createCredential = async (req, res) => {
    try {
        res.status(200).send("Credential created successfully");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const bulkCreateCredentials = async (req, res) => {
    try {
        res.status(200).send("Bulk credential creation successful");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// export const getAllStudents = async (req, res) => {
//     try {
//         res.status(200).send("Student retrieval successful");
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

export const revokeCredential = async (req, res) => {
    try {
        res.status(200).send("Credential revoking successful");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};