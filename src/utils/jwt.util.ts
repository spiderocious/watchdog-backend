import jwt from 'jsonwebtoken';
import { jwtConfig } from '@configs/jwt.config';
import { logger } from './logger.util';

export class JwtUtil {
  static generateToken(payload: object): string {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn as any,
    });
  }

  static verifyToken<T = any>(token: string): T | null {
    try {
      return jwt.verify(token, jwtConfig.secret) as T;
    } catch (error) {
      logger.error('JWT verification failed', error);
      return null;
    }
  }
}
