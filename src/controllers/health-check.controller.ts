import { Request, Response } from 'express';
import { asyncHandler } from '@utils/async-handler.util';
import { ResponseUtil } from '@utils/response.util';
import { healthCheckService } from '@services/health-check.service';
import { AuthRequest } from '@middlewares/auth.middleware';

class HealthCheckController {
  private static instance: HealthCheckController;

  private constructor() {}

  public static getInstance(): HealthCheckController {
    if (!HealthCheckController.instance) {
      HealthCheckController.instance = new HealthCheckController();
    }
    return HealthCheckController.instance;
  }

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const {
      page,
      limit,
      service_id,
      success,
      status_code,
      url_search,
      start_date,
      end_date,
    } = req.query;

    const result = await healthCheckService.list(
      authReq.user!.userId,
      Number(page) || 1,
      Number(limit) || 20,
      service_id as string,
      success !== undefined ? success === 'true' : undefined,
      status_code ? Number(status_code) : undefined,
      url_search as string,
      start_date ? new Date(start_date as string) : undefined,
      end_date ? new Date(end_date as string) : undefined
    );

    if (!result.success) {
      ResponseUtil.serverError(res, result.messageKey!);
      return;
    }

    ResponseUtil.success(res, result.data, result.messageKey!);
  });

  triggerManualCheck = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const { service_id } = req.params;

    const result = await healthCheckService.triggerManualCheck(
      authReq.user!.userId,
      service_id as string
    );

    if (!result.success) {
      if (result.messageKey === 'NOT_FOUND') {
        ResponseUtil.notFound(res, result.messageKey);
        return;
      }
      if (result.messageKey === 'UNAUTHORIZED') {
        ResponseUtil.unauthorized(res, result.messageKey);
        return;
      }
      ResponseUtil.serverError(res, result.messageKey!);
      return;
    }

    ResponseUtil.success(res, result.data, result.messageKey!);
  });
}

export const healthCheckController = HealthCheckController.getInstance();
