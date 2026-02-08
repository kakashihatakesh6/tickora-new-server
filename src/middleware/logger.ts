import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  console.log(`📡 API HIT | ${req.method} ${req.path} | ${timestamp}`);
  next();
};
