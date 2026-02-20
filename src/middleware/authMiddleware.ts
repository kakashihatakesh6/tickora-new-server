import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validateToken } from '../utils/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: number;
  user?: User;
}

export const authMiddleware: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    let tokenString = req.headers.authorization || '';

    if (!tokenString) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    if (tokenString.startsWith('Bearer ')) {
      tokenString = tokenString.substring(7);
    }

    const decoded = validateToken(tokenString);

    if (!decoded || !decoded.user_id) {
      res.status(401).json({ error: 'Invalid user_id in token' });
      return;
    }

    (req as AuthRequest).userId = decoded.user_id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};

export const isAdmin: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin rights required.' });
      return;
    }

    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error checking admin status' });
    return;
  }
};
