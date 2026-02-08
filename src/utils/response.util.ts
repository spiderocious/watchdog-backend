import { Response } from 'express';
import { HTTP_STATUS, MESSAGES, MessageKey, MESSAGE_KEYS } from '@shared/constants';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    messageKey: MessageKey = MESSAGE_KEYS.SUCCESS,
    statusCode: number = HTTP_STATUS.OK
  ): void {
    res.status(statusCode).json({
      success: true,
      message: MESSAGES[messageKey],
      data,
    });
  }

  static error(
    res: Response,
    messageKey: MessageKey = MESSAGE_KEYS.INTERNAL_SERVER_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: any
  ): void {
    res.status(statusCode).json({
      success: false,
      error: messageKey,
      message: MESSAGES[messageKey],
      ...(details && { details }),
    });
  }

  static created<T>(res: Response, data: T, messageKey: MessageKey): void {
    this.success(res, data, messageKey, HTTP_STATUS.CREATED);
  }

  static badRequest(res: Response, messageKey: MessageKey, details?: any): void {
    this.error(res, messageKey, HTTP_STATUS.BAD_REQUEST, details);
  }

  static unauthorized(res: Response, messageKey: MessageKey): void {
    this.error(res, messageKey, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(res: Response, messageKey: MessageKey): void {
    this.error(res, messageKey, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(res: Response, messageKey: MessageKey): void {
    this.error(res, messageKey, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(res: Response, messageKey: MessageKey): void {
    this.error(res, messageKey, HTTP_STATUS.CONFLICT);
  }

  static tooMany(res: Response, messageKey: MessageKey): void {
    this.error(res, messageKey, HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  static serverError(res: Response, messageKey: MessageKey): void {
    this.error(res, messageKey, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
