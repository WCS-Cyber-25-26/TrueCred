import credentialService from '../services/credential.service.js';

// Export as a named function so the router can find it
export const getCredentialsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const userId = req.user?.id;

    const result = await credentialService.getCredentialsByStudent(studentId, userId);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const isCredentialRevoked = async (req, res) => {
    try {
        res.status(200).send("Credential revocation status retrieval successful");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};