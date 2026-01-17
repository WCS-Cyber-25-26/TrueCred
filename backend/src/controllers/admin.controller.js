import adminService from '../services/admin.service.js';

export const getAllUniversities = async (req, res) => {
    try {
        res.status(200).send("List");
    } catch (err){
        res.status(500).json({ error: err.message });
    }
};

export const revokeUniversity = async (req, res) => {
    try {
        res.status(200).send("Revoked University successfully");
    } catch (err){
        res.status(500).json({ error: err.message });
    }
}