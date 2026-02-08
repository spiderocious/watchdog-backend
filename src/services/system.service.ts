import { NodeModel } from '@models/node.model';
import { monitoringEngine } from '@monitoring/monitoring-engine';
import { logger } from '@utils/logger.util';
import { ServiceResult, ServiceSuccess, ServiceError } from '@shared/types';
import { MESSAGE_KEYS } from '@shared/constants';

class SystemService {
  private static instance: SystemService;

  private constructor() {}

  public static getInstance(): SystemService {
    if (!SystemService.instance) {
      SystemService.instance = new SystemService();
    }
    return SystemService.instance;
  }

  async getStatus(): Promise<ServiceResult<any>> {
    try {
      const totalNodes = await NodeModel.countDocuments();
      const downNodes = await NodeModel.countDocuments({ status: 'down' });

      const systemStatus = downNodes > 0 ? 'degraded' : 'operational';

      return new ServiceSuccess(
        {
          system_status: systemStatus,
          total_services: totalNodes,
          active_monitors: monitoringEngine.activeCount,
          timestamp: new Date().toISOString(),
          version: 'v1.0.0-mvp',
        },
        MESSAGE_KEYS.SYSTEM_STATUS_FETCHED
      );
    } catch (error: any) {
      logger.error('System status error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }
}

export const systemService = SystemService.getInstance();
