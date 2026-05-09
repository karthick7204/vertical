import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!token || !secret) {
        return res.status(401).json({ message: 'Not authorized, token or secret missing' });
      }

      const decoded: any = jwt.verify(token, secret);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'HR_ADMIN' || req.user.role === 'SUPER_ADMIN')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
