import prisma from '../../prisma/client.js';
import { hashSessionToken } from '../utils/token.js';

export default async function authMiddleware(req, res, next) {
  let authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({error: 'Unauthorized'});
  }

  let token = authHeader;
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  const hashedToken = hashSessionToken(token);

  try {
    const session = await prisma.session.findUnique({
      where: {token: hashedToken},
      include: {user: true},
    });

    if (!session) {
      return res.status(401).json({error: 'Invalid session token'});
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.update({
        where: {token: hashedToken},
        data: {revoked: true},
      });
      return res.status(401).json({error: 'Session expired'});
    }

    if (session.revoked) {
      return res.status(401).json({error: 'Session revoked'});
    }

    req.user = {
      id: session.user.id,
      role: session.user.role,
    };

    req.token = hashedToken;

    next();
  } catch (err) {
    return res.status(500).json({error: 'Server error'});
  }
}
