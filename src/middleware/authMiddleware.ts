import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    let tokenString = req.headers.authorization;

    if (!tokenString) {
      res.status(401).json({ error: 'Authorization header required' });
      return;
    }

    if (tokenString.startsWith('Bearer ')) {
      tokenString = tokenString.substring(7);
    }

    const decoded = validateToken(tokenString);
    
    if (!decoded.user_id) {
      res.status(401).json({ error: 'Invalid user_id in token' });
      return;
    }

    req.userId = decoded.user_id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};
