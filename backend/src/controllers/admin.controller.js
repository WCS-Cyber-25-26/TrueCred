import adminService from '../services/admin.service.js';

export const getAllUniversities = async (req, res) => {
    try {
        const universities = await adminService.getAllUniversities();

        const formattedUniversities = universities.map((uni) => {
            const { revocation, ...universityData } = uni;

            const revocationInfo = revocation 
            ? { ...revocation, status: 'Revoked' } 
            : { status: 'Active' };

            return {
                ...universityData,
                revocation: revocationInfo
            };
        });
        res.status(200).json(formattedUniversities);
        
    } catch (err) {
        console.error("Controller Error:", err.message);
        res.status(500).json({ 
            message: "Failed to retrieve universities",
            error: err.message 
        });
    }
};

export const revokeUniversity = async (req, res) => {
    try {
        res.status(200).send("Revoked University successfully");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

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