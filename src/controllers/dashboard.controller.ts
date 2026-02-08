import { Request, Response } from 'express';
import { asyncHandler } from '@utils/async-handler.util';
import { ResponseUtil } from '@utils/response.util';
import { dashboardService } from '@services/dashboard.service';
import { AuthRequest } from '@middlewares/auth.middleware';

class DashboardController {
  private static instance: DashboardController;

  private constructor() {}

  public static getInstance(): DashboardController {
    if (!DashboardController.instance) {
      DashboardController.instance = new DashboardController();
    }
    return DashboardController.instance;
  }

  getOverview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const result = await dashboardService.getOverview(authReq.user!.userId);

    if (!result.success) {
      ResponseUtil.serverError(res, result.messageKey!);
      return;
    }

    ResponseUtil.success(res, result.data, result.messageKey!);
  });
}

export const dashboardController = DashboardController.getInstance();
