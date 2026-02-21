import credentialService from '../services/credential.service.js';

// Export as a named function so the router can find it
export const getCredentialsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    
    const userID = req.user.id;

    if (!userID) {
      return res.status(401).json({ message: "University identity not found in token." });
    }
    const result = await credentialService.getCredentialsByStudent(studentId, userID);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const isCredentialRevoked = async (req, res) => {
    try {
        res.status(200).send("Credential revocation status retrieval successful");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};