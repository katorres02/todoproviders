import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized } from '../lib/errors';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export interface AuthPayload {
  sub: string;
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthPayload;
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(unauthorized('Missing bearer token'));
    return;
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    const { sub, email } = decoded as jwt.JwtPayload & AuthPayload;
    if (typeof sub !== 'string') throw new Error('bad token');
    req.auth = { sub, email };
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}
