import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '@utils/jwt.util';
import { ResponseUtil } from '@utils/response.util';
import { MESSAGE_KEYS } from '@shared/constants';
import { JwtPayload } from '@shared/types';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ResponseUtil.unauthorized(res, MESSAGE_KEYS.TOKEN_REQUIRED);
    return;
  }

  const decoded = JwtUtil.verifyToken<JwtPayload>(token);

  if (!decoded) {
    ResponseUtil.unauthorized(res, MESSAGE_KEYS.INVALID_TOKEN);
    return;
  }

  req.user = decoded;
  next();
};
