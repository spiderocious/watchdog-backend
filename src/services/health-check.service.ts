import { healthCheckRepository } from '@repositories/health-check.repository';
import { nodeRepository } from '@repositories/node.repository';
import { executeCheck } from '@monitoring/check-executor';
import { logger } from '@utils/logger.util';
import { ServiceResult, ServiceSuccess, ServiceError, PaginatedResponse } from '@shared/types';
import { MESSAGE_KEYS } from '@shared/constants';
import { HealthCheckDocument } from '@models/health-check.model';
import { NodeDocument } from '@models/node.model';

class HealthCheckService {
  private static instance: HealthCheckService;

  private constructor() {}

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  async list(
    userId: string,
    page: number,
    limit: number,
    serviceId?: string,
    success?: boolean,
    statusCode?: number,
    urlSearch?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ServiceResult<PaginatedResponse<HealthCheckDocument>>> {
    try {
      const userNodes = await nodeRepository.findByUserId(userId);
      const nodeIds = userNodes.map((n: NodeDocument) => n.id);

      if (nodeIds.length === 0) {
        return new ServiceSuccess(
          {
            items: [],
            page,
            limit,
            total: 0,
            total_pages: 0,
          },
          MESSAGE_KEYS.SUCCESS
        );
      }

      const { items, total } = await healthCheckRepository.list({
        node_ids: nodeIds,
        service_id: serviceId,
        success,
        status_code: statusCode,
        url_search: urlSearch,
        start_date: startDate,
        end_date: endDate,
        page,
        limit,
      });

      return new ServiceSuccess(
        {
          items,
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
        MESSAGE_KEYS.SUCCESS
      );
    } catch (error: any) {
      logger.error('List health checks error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async triggerManualCheck(
    userId: string,
    serviceId: string
  ): Promise<ServiceResult<{ message: string; check_id?: string }>> {
    try {
      const node = await nodeRepository.findById(serviceId);

      if (!node) {
        return new ServiceError('Service not found', MESSAGE_KEYS.NOT_FOUND);
      }

      if (node.user_id !== userId) {
        return new ServiceError('Unauthorized', MESSAGE_KEYS.UNAUTHORIZED);
      }

      await executeCheck(node);

      const recentCheck = (await healthCheckRepository.findByNode(node.id, 1))[0];

      return new ServiceSuccess(
        {
          message: 'Manual health check triggered successfully',
          check_id: recentCheck?.id,
        },
        MESSAGE_KEYS.SUCCESS
      );
    } catch (error: any) {
      logger.error('Trigger manual check error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }
}

export const healthCheckService = HealthCheckService.getInstance();
