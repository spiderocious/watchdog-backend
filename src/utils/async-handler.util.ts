import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.util';
import { ResponseUtil } from './response.util';
import { MESSAGE_KEYS } from '@shared/constants';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (handler: AsyncHandler) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      logger.error('Unhandled error in controller', error);
      ResponseUtil.serverError(res, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  };
};
