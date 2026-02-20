export default function studentMiddleware(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Student access required' });
    }

    next();
  } catch (err) {
    console.error('Student middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}