import { Request, Response } from 'express';
import { asyncHandler } from '@utils/async-handler.util';
import { ResponseUtil } from '@utils/response.util';
import { systemService } from '@services/system.service';

class SystemController {
  private static instance: SystemController;

  private constructor() {}

  public static getInstance(): SystemController {
    if (!SystemController.instance) {
      SystemController.instance = new SystemController();
    }
    return SystemController.instance;
  }

  getStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const result = await systemService.getStatus();

    if (!result.success) {
      ResponseUtil.serverError(res, result.messageKey!);
      return;
    }

    ResponseUtil.success(res, result.data, result.messageKey!);
  });
}

export const systemController = SystemController.getInstance();
