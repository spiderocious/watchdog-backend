import { nodeRepository } from '@repositories/node.repository';
import { healthCheckRepository } from '@repositories/health-check.repository';
import { cacheService } from '@utils/cache.util';
import { logger } from '@utils/logger.util';
import { ServiceResult, ServiceSuccess, ServiceError } from '@shared/types';
import { MESSAGE_KEYS } from '@shared/constants';

const DASHBOARD_CACHE_KEY = 'dashboard:overview';
const DASHBOARD_CACHE_TTL = 30;

const TELEMETRY_THRESHOLDS = {
  response_time: 3000,
  request_rate: 600,
  error_rate: 1.0,
  latency_p99: 200,
};

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
      const since5m = new Date(Date.now() - 5 * 60 * 1000);

      const [recentChecks, telemetryBuckets] = await Promise.all([
        healthCheckRepository.getRecentChecksForNodes(allNodeIds, 20),
        healthCheckRepository.getTelemetryBuckets(allNodeIds, since5m, 30),
      ]);

      const formatTime = (iso: string) => {
        const d = new Date(iso);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      };

      const responseTimeChart = telemetryBuckets.map((b) => ({
        timestamp: formatTime(b.timestamp),
        value: b.avg_response,
      }));

      const requestRateChart = telemetryBuckets.map((b) => ({
        timestamp: formatTime(b.timestamp),
        value: Math.round(b.total_checks * (60 / 30)),
      }));

      const errorRateChart = telemetryBuckets.map((b) => ({
        timestamp: formatTime(b.timestamp),
        value: b.total_checks > 0
          ? Math.round((b.failed_checks / b.total_checks) * 10000) / 100
          : 0,
      }));

      const latencyP99Chart = telemetryBuckets.map((b) => ({
        timestamp: formatTime(b.timestamp),
        value: b.p99_response,
      }));

      const lastBucket = telemetryBuckets[telemetryBuckets.length - 1];

      const data = {
        services_overview: servicesOverview,
        real_time_telemetry: {
          response_time: {
            current: lastBucket?.avg_response || 0,
            unit: 'ms',
            threshold: TELEMETRY_THRESHOLDS.response_time,
            chart_data: responseTimeChart,
          },
          request_rate: {
            current: lastBucket ? Math.round(lastBucket.total_checks * (60 / 30)) : 0,
            unit: 'QPM',
            threshold: TELEMETRY_THRESHOLDS.request_rate,
            chart_data: requestRateChart,
          },
          error_rate: {
            current: lastBucket && lastBucket.total_checks > 0
              ? Math.round((lastBucket.failed_checks / lastBucket.total_checks) * 10000) / 100
              : 0,
            unit: '%',
            threshold: TELEMETRY_THRESHOLDS.error_rate,
            chart_data: errorRateChart,
          },
          latency_p99: {
            current: lastBucket?.p99_response || 0,
            unit: 'ms',
            threshold: TELEMETRY_THRESHOLDS.latency_p99,
            chart_data: latencyP99Chart,
          },
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
