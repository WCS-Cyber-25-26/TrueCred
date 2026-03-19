import adminService from '../services/admin.service.js';

export const sendInvite = async (req, res) => {
    try {
        const { name, domain, email } = req.body;

        await adminService.sendInvite({
            name,
            domain,
            email,
            createdBy: req.user.id,
        });

        res.status(201).json({
            message: 'University invitation sent successfully',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const revokeUniversity = async (req, res) => {
    try {
        const result = await adminService.revokeUniversity(req.params.id, req.user.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const updateUniversity = async (req, res) => {
    try {
        res.status(200).send("University update successful");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllUniversities = async (req, res) => {
    try {
        const universities = await adminService.getAllUniversities();
        res.status(200).json(universities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUniversityById = async (req, res) => {
    try {
        const university = await adminService.getUniversityById(req.params.id);
        res.status(200).json(university);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const enableChain = async (req, res) => {
    try {
        const result = await adminService.enableChainForUniversity(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};