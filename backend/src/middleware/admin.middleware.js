import prisma from '../../prisma/client.js';

export default async function adminMiddleware(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    //attach user to req for downstream controllers if needed
    req.user = user;

    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
