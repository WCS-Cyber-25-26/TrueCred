import verifyService from '../services/verify.service.js';

export const verifyCredentialByFields = async (req, res) => {
  const { university, studentName, degree, degreeAwardedDate, hiddenIdentifier } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
  const userAgent = req.headers['user-agent'] || null;

  try {
    const result = await verifyService.verifyFromFields(
      { university, studentName, degree, degreeAwardedDate, hiddenIdentifier },
      ipAddress,
      userAgent
    );
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const verifyCredential = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No certificate file uploaded' });
  }

  const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
  const userAgent = req.headers['user-agent'] || null;

  try {
    const result = await verifyService.verifyFromImage(req.file.buffer, ipAddress, userAgent);
    return res.status(200).json(result);
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message });
  }
};
