import { nodeRepository } from '@repositories/node.repository';
import { healthCheckRepository } from '@repositories/health-check.repository';
import { monitoringEngine } from '@monitoring/monitoring-engine';
import { generateId } from '@utils/id.util';
import { logger } from '@utils/logger.util';
import { NodeDocument } from '@models/node.model';
import {
  ServiceResult,
  ServiceSuccess,
  ServiceError,
  CreateNodeDTO,
  UpdateNodeDTO,
  TestConnectionDTO,
  MonitorNode,
  PaginatedResponse,
  NodeStatus,
} from '@shared/types';
import { MESSAGE_KEYS } from '@shared/constants';

class NodeService {
  private static instance: NodeService;

  private constructor() {}

  public static getInstance(): NodeService {
    if (!NodeService.instance) {
      NodeService.instance = new NodeService();
    }
    return NodeService.instance;
  }

  async create(userId: string, data: CreateNodeDTO): Promise<ServiceResult<any>> {
    try {
      const nodeId = generateId(8, 'srv');

      const node = await nodeRepository.create({
        id: nodeId,
        user_id: userId,
        name: data.service_name,
        endpoint_url: data.endpoint_url,
        method: data.method || 'GET',
        headers: data.headers || {},
        body: data.body || '',
        check_interval: data.check_interval,
        failure_threshold: data.failure_threshold || 3,
        expected_status_codes: data.expected_status_codes || [200, 201, 204],
        status: 'active',
        consecutive_failures: 0,
      });

      monitoringEngine.startNode(node as unknown as NodeDocument);

      return new ServiceSuccess(
        {
          service_id: node.id,
          service_name: node.name,
          endpoint_url: node.endpoint_url,
          method: node.method,
          status: node.status,
          monitoring_started: true,
          created_at: node.created_at,
        },
        MESSAGE_KEYS.NODE_CREATED
      );
    } catch (error: any) {
      logger.error('Create node error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async list(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: NodeStatus,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<ServiceResult<PaginatedResponse<any>>> {
    try {
      const { items, total } = await nodeRepository.list({
        user_id: userId,
        page,
        limit,
        search,
        status,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const enrichedItems = await Promise.all(
        items.map(async (node) => {
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

      const statusCounts = await nodeRepository.countByUser(userId);

      return new ServiceSuccess(
        {
          overview: {
            total_services: statusCounts.total,
            active_count: statusCounts.active,
            down_count: statusCounts.down,
            warning_count: statusCounts.warning,
            paused_count: statusCounts.paused,
          },
          items: enrichedItems,
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        } as any,
        MESSAGE_KEYS.NODES_FETCHED
      );
    } catch (error: any) {
      logger.error('List nodes error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(nodeId: string, userId: string): Promise<ServiceResult<any>> {
    try {
      const node = await nodeRepository.findByIdAndUser(nodeId, userId);
      if (!node) {
        return new ServiceError('Service not found', MESSAGE_KEYS.NODE_NOT_FOUND);
      }

      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [
        checks,
        errors,
        uptime30d,
        avgResponse,
        counts,
        responseHistory,
      ] = await Promise.all([
        healthCheckRepository.findByNode(node.id, 50),
        healthCheckRepository.findErrorsByNode(node.id, 50),
        healthCheckRepository.getUptimePercentage(node.id, since30d),
        healthCheckRepository.getAverageResponseTime(node.id),
        healthCheckRepository.getCheckCounts(node.id),
        healthCheckRepository.getResponseTimeHistory(node.id, since24h),
      ]);

      const errorCount7d = errors.filter(
        (e) => new Date(e.created_at) >= since7d
      ).length;

      return new ServiceSuccess(
        {
          service: {
            id: node.id,
            name: node.name,
            endpoint: node.endpoint_url,
            method: node.method,
            status: node.status,
            check_interval: node.check_interval,
            failure_threshold: node.failure_threshold,
            created_at: node.created_at,
          },
          quick_metrics: {
            status: node.status,
            uptime_30d: uptime30d,
            avg_response: Math.round(avgResponse),
            errors_7d: errorCount7d,
          },
          response_time_history: responseHistory,
          health_check_log: checks,
          errors: errors.slice(0, 20),
        },
        MESSAGE_KEYS.NODE_FETCHED
      );
    } catch (error: any) {
      logger.error('Get node error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async update(nodeId: string, userId: string, data: UpdateNodeDTO): Promise<ServiceResult<any>> {
    try {
      const updateData: any = {};
      if (data.service_name) updateData.name = data.service_name;
      if (data.endpoint_url) updateData.endpoint_url = data.endpoint_url;
      if (data.method) updateData.method = data.method;
      if (data.headers !== undefined) updateData.headers = data.headers;
      if (data.body !== undefined) updateData.body = data.body;
      if (data.check_interval) updateData.check_interval = data.check_interval;
      if (data.failure_threshold) updateData.failure_threshold = data.failure_threshold;
      if (data.expected_status_codes) updateData.expected_status_codes = data.expected_status_codes;

      const node = await nodeRepository.update(nodeId, userId, updateData);
      if (!node) {
        return new ServiceError('Service not found', MESSAGE_KEYS.NODE_NOT_FOUND);
      }

      if (node.status === 'active' && monitoringEngine.isMonitoring(nodeId)) {
        monitoringEngine.startNode(node as unknown as NodeDocument);
        logger.info(`Restarted monitoring for node ${node.name} (${node.id}) with updated configuration`);
      }

      return new ServiceSuccess(
        {
          service_id: node.id,
          service_name: node.name,
          endpoint_url: node.endpoint_url,
          method: node.method,
          check_interval: node.check_interval,
          failure_threshold: node.failure_threshold,
          status: node.status,
          updated_at: node.updated_at,
        },
        MESSAGE_KEYS.NODE_UPDATED
      );
    } catch (error: any) {
      logger.error('Update node error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(nodeId: string, userId: string): Promise<ServiceResult<{ service_id: string; deleted_at: string }>> {
    try {
      const deleted = await nodeRepository.delete(nodeId, userId);
      if (!deleted) {
        return new ServiceError('Service not found', MESSAGE_KEYS.NODE_NOT_FOUND);
      }

      monitoringEngine.stopNode(nodeId);
      await healthCheckRepository.deleteByNode(nodeId);

      return new ServiceSuccess(
        { service_id: nodeId, deleted_at: new Date().toISOString() },
        MESSAGE_KEYS.NODE_DELETED
      );
    } catch (error: any) {
      logger.error('Delete node error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async pause(nodeId: string, userId: string): Promise<ServiceResult<any>> {
    try {
      const node = await nodeRepository.findByIdAndUser(nodeId, userId);
      if (!node) {
        return new ServiceError('Service not found', MESSAGE_KEYS.NODE_NOT_FOUND);
      }
      if (node.status === 'paused') {
        return new ServiceError('Service is already paused', MESSAGE_KEYS.NODE_ALREADY_PAUSED);
      }

      await nodeRepository.updateStatus(nodeId, 'paused');
      monitoringEngine.stopNode(nodeId);

      return new ServiceSuccess(
        { service_id: nodeId, status: 'paused', paused_at: new Date().toISOString() },
        MESSAGE_KEYS.NODE_PAUSED
      );
    } catch (error: any) {
      logger.error('Pause node error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async resume(nodeId: string, userId: string): Promise<ServiceResult<any>> {
    try {
      const node = await nodeRepository.findByIdAndUser(nodeId, userId);
      if (!node) {
        return new ServiceError('Service not found', MESSAGE_KEYS.NODE_NOT_FOUND);
      }
      if (node.status === 'active') {
        return new ServiceError('Service is already active', MESSAGE_KEYS.NODE_ALREADY_ACTIVE);
      }

      await nodeRepository.updateStatus(nodeId, 'active', { consecutive_failures: 0 });
      monitoringEngine.startNode(node as unknown as NodeDocument);

      return new ServiceSuccess(
        { service_id: nodeId, status: 'active', resumed_at: new Date().toISOString() },
        MESSAGE_KEYS.NODE_RESUMED
      );
    } catch (error: any) {
      logger.error('Resume node error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
    }
  }

  async testCheck(nodeId: string, userId: string): Promise<ServiceResult<any>> {
    try {
      const node = await nodeRepository.findByIdAndUser(nodeId, userId);
      if (!node) {
        return new ServiceError('Service not found', MESSAGE_KEYS.NODE_NOT_FOUND);
      }

      const result = await this.executeHttpCheck(node.endpoint_url, node.method, node.headers, node.body);
      return new ServiceSuccess(result, MESSAGE_KEYS.NODE_TEST_SUCCESS);
    } catch (error: any) {
      logger.error('Test check error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.NODE_TEST_FAILED);
    }
  }

  async testConnection(data: TestConnectionDTO): Promise<ServiceResult<any>> {
    try {
      const result = await this.executeHttpCheck(data.endpoint_url, data.method, data.headers, data.body);
      return new ServiceSuccess(result, MESSAGE_KEYS.CONNECTION_TEST_SUCCESS);
    } catch (error: any) {
      logger.error('Connection test error', error);
      return new ServiceError(error.message, MESSAGE_KEYS.CONNECTION_TEST_FAILED);
    }
  }

  async executeHttpCheck(
    url: string,
    method: string,
    headers?: Record<string, string>,
    body?: string
  ): Promise<{
    status_code: number;
    status_text: string;
    response_time: number;
    response_time_unit: string;
    content_size: number;
    content_size_unit: string;
    connection_established: boolean;
  }> {
    const start = performance.now();

    const fetchOptions: RequestInit = {
      method,
      headers: headers || {},
      signal: AbortSignal.timeout(30000),
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const responseTime = Math.round(performance.now() - start);
    const responseBody = await response.text();

    return {
      status_code: response.status,
      status_text: response.statusText,
      response_time: responseTime,
      response_time_unit: 'ms',
      content_size: Buffer.byteLength(responseBody),
      content_size_unit: 'bytes',
      connection_established: true,
    };
  }
}

export const nodeService = NodeService.getInstance();
