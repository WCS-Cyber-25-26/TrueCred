import universityInviteService from '../services/university.invite.service.js';

export const acceptInvite = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                error: 'Token and password are required',
            });
        }

        const result = await universityInviteService.acceptInvite({
            token,
            password,
        });

        res.status(200).json(result);
    } catch (err) {
        console.error('Accept invite error:', err);
        res.status(400).json({ error: err.message });
    }
};