export default function universityMiddleware(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'UNIVERSITY') {
      return res.status(403).json({ error: 'University access required' });
    }

    next();
  } catch (err) {
    console.error('University middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}