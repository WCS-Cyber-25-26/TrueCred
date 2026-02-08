import credentialService from '../services/credential.service.js';

export const getCredentialsByStudent = async (req, res) => {
    try {
        res.status(200).send("Credential retrieval successful");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const isCredentialRevoked = async (req, res) => {
    try {
        res.status(200).send("Credential revocation status retrieval successful");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};