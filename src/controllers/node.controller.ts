import { Request, Response } from 'express';
import { asyncHandler } from '@utils/async-handler.util';
import { ResponseUtil } from '@utils/response.util';
import { nodeService } from '@services/node.service';
import { AuthRequest } from '@middlewares/auth.middleware';
import { MESSAGE_KEYS } from '@shared/constants';
import { NodeStatus } from '@shared/types';

class NodeController {
  private static instance: NodeController;

  private constructor() {}

  public static getInstance(): NodeController {
    if (!NodeController.instance) {
      NodeController.instance = new NodeController();
    }
    return NodeController.instance;
  }

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const result = await nodeService.create(authReq.user!.userId, req.body);

    if (!result.success) {
      ResponseUtil.badRequest(res, result.messageKey!);
      return;
    }

    ResponseUtil.created(res, result.data, result.messageKey!);
  });

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const { page, limit, search, status, sort_by, sort_order } = req.query;

    const result = await nodeService.list(
      authReq.user!.userId,
      Number(page) || 1,
      Number(limit) || 10,
      search as string,
      status as NodeStatus,
      sort_by as string,
      sort_order as 'asc' | 'desc'
    );

    if (!result.success) {
      ResponseUtil.serverError(res, result.messageKey!);
      return;
    }

    ResponseUtil.success(res, result.data, result.messageKey!);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const result = await nodeService.getById(req.params.service_id as string, authReq.user!.userId);

    if (!result.success) {
      ResponseUtil.notFound(res, result.messageKey!);
      return;
    }

    ResponseUtil.success(res, result.data, result.messageKey!);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const result = await nodeService.update(req.params.service_id as string, authReq.user!.userId, req.body);

    if (!result.success) {
      ResponseUtil.notFound(res, result.messageKey!);
      return;
    }

    ResponseUtil.success(res, result.data, result.messageKey!);
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const result = await nodeService.delete(req.params.service_id as string, authReq.user!.userId);

    if (!result.success) {
      ResponseUtil.notFound(res, result.messageKey!);
      return;
    }

    ResponseUtil.success(res, result.data, result.messageKey!);
  });
}

export const nodeController = NodeController.getInstance();
