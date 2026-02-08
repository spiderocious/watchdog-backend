import { nodeRepository } from '@repositories/node.repository';
import { healthCheckRepository } from '@repositories/health-check.repository';
import { cacheService } from '@utils/cache.util';
import { logger } from '@utils/logger.util';
import { ServiceResult, ServiceSuccess, ServiceError } from '@shared/types';
import { MESSAGE_KEYS } from '@shared/constants';

const DASHBOARD_CACHE_KEY = 'dashboard:overview';
const DASHBOARD_CACHE_TTL = 30;

class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async getOverview(userId: string): Promise<ServiceResult<any>> {
    try {
      const cacheKey = `${DASHBOARD_CACHE_KEY}:${userId}`;
      const cached = cacheService.get<any>(cacheKey);
      if (cached) {
        return new ServiceSuccess(cached, MESSAGE_KEYS.DASHBOARD_FETCHED);
      }

      const { items: nodes, total } = await nodeRepository.list({
        user_id: userId,
        page: 1,
        limit: 6,
      });

      const statusCounts = await nodeRepository.countByUser(userId);

      const servicesOverview = await Promise.all(
        nodes.map(async (node) => {
          const [counts, uptime, avgResponse] = await Promise.all([
            healthCheckRepository.getCheckCounts(node.id),
            healthCheckRepository.getUptimePercentage(node.id),
            healthCheckRepository.getAverageResponseTime(node.id),
          ]);

          return {
            id: node.id,
            status: node.status,
            name: node.name,
            endpoint: node.endpoint_url,
            method: node.method,
            interval: node.check_interval,
            uptime_percentage: uptime,
            avg_response: Math.round(avgResponse),
            last_check: node.last_check_at,
            failure_count: counts.failure_count,
            success_count: counts.success_count,
          };
        })
      );

      const allNodeIds = nodes.map((n) => n.id);
      const recentChecks = await healthCheckRepository.getRecentChecksForNodes(allNodeIds, 20);

      const successChecks = recentChecks.filter((c) => c.success);
      const avgResponseTime = successChecks.length > 0
        ? Math.round(successChecks.reduce((sum, c) => sum + c.response_time, 0) / successChecks.length)
        : 0;

      const errorRate = recentChecks.length > 0
        ? Math.round((recentChecks.filter((c) => !c.success).length / recentChecks.length) * 10000) / 100
        : 0;

      const data = {
        services_overview: servicesOverview,
        real_time_telemetry: {
          response_time: { current: avgResponseTime, unit: 'ms' },
          error_rate: { current: errorRate, unit: '%' },
        },
        service_diagnostics: {
          check_logs: recentChecks.filter((c) => c.success).slice(0, 10),
        },
        error_logs: recentChecks.filter((c) => !c.success).slice(0, 10),
        status_overview: {
          total_services: statusCounts.total,
          active: statusCounts.active,
          down: statusCounts.down,
          warning: statusCounts.warning,
          paused: statusCounts.paused,
          monitoring_active: statusCounts.active > 0,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          system_status: statusCounts.down > 0 ? 'degraded' : 'operational',
        },
      };

      cacheService.set(cacheKey, data, DASHBOARD_CACHE_TTL);

      return new ServiceSuccess(data, MESSAGE_KEYS.DASHBOARD_FETCHED);
    } catch (error: any) {
      logger.error('Dashboard overview error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }
}

export const dashboardService = DashboardService.getInstance();
