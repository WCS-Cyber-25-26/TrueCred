import credentialService from '../services/credential.service.js';

export const issueCredential = async (req, res) => {
  try {
    const { schoolEmail, studentFullName, degreeName, program, awardedDate } = req.body;
    const result = await credentialService.issueCredential({
      userId: req.user.id,
      schoolEmail,
      studentFullName,
      degreeName,
      program,
      awardedDate,
    });
    return res.status(201).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message });
  }
};

export const issueBulkCredentials = async (req, res) => {
  try {
    // Each entry: { schoolEmail, studentFullName, degreeName, program, awardedDate }
    const { credentials } = req.body;
    const results = await credentialService.issueBulkCredentials(
      credentials.map((c) => ({ ...c, userId: req.user.id }))
    );
    return res.status(201).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCredential = async (req, res) => {
  try {
    return res.status(200).json({ message: "updated Credential Successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const revokeCredentialById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await credentialService.revokeCredentialById(id, req.user.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getCredentialById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await credentialService.getCredentialById(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getCredentialRevocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await credentialService.getCredentialRevocationStatus(id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
