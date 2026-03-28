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
        const userId = req.params.id;
        const bodyKeys = Object.keys(req.body || {});
        const allowedKeys = ['reason'];
        const hasExtraKeys = bodyKeys.some((k) => !allowedKeys.includes(k));
        if (hasExtraKeys) {
            return res.status(400).json({ error: 'Request body must only include the reason field' });
        }
        const reason = req.body?.reason;

        const data = await adminService.revokeUniversity(userId, { reason }, req.user.id);

        return res.status(201).json({
            message: 'University revoked successfully',
            data: {
                universityId: data.universityId,
                revokedAt: data.revokedAt,
                reason: data.reason,
                revokedBy: data.revokedBy,
            },
        });
    } catch (err) {
        if (err.code === 'UNIVERSITY_NOT_FOUND') {
            return res.status(404).json({ error: 'University not found or invalid user ID' });
        }
        if (err.code === 'ALREADY_REVOKED') {
            return res.status(409).json({ error: 'University already revoked' });
        }
        return res.status(500).json({ error: err.message });
    }
};

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

export const repairRsaKeys = async (req, res) => {
    try {
        const result = await adminService.repairRsaKeys(req.params.id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};