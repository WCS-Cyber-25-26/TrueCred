import prisma from '../../prisma/client.js';
import { verifyJwt } from '../utils/jwt.js';

export default function authMiddleware(req, res, next) {
  try {
    let token;

    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyJwt(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    next();
  } catch (err) {
    console.error('JWT auth error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}