import { healthCheckRepository } from '@repositories/health-check.repository';
import { nodeRepository } from '@repositories/node.repository';
import { generateId } from '@utils/id.util';
import { logger } from '@utils/logger.util';
import { NodeDocument } from '@models/node.model';

export const executeCheck = async (node: NodeDocument): Promise<void> => {
  const start = performance.now();
  let statusCode = 0;
  let statusText = 'Unknown';
  let success = false;
  let errorMessage = '';

  try {
    const fetchOptions: RequestInit = {
      method: node.method,
      headers: (node.headers as Record<string, string>) || {},
      signal: AbortSignal.timeout(30000),
    };

    if (node.body && ['POST', 'PUT', 'PATCH'].includes(node.method)) {
      fetchOptions.body = node.body;
    }

    const response = await fetch(node.endpoint_url, fetchOptions);
    statusCode = response.status;
    statusText = response.statusText;
    success = node.expected_status_codes.includes(response.status);
  } catch (error: any) {
    statusCode = 0;
    statusText = 'Connection Failed';
    errorMessage = error.message || 'Request failed';
    success = false;
  }

  const responseTime = Math.round(performance.now() - start);

  await healthCheckRepository.create({
    id: generateId(12, 'chk'),
    node_id: node.id,
    status_code: statusCode,
    status_text: statusText,
    response_time: responseTime,
    success,
    error_message: errorMessage,
  });

  if (success) {
    if (node.consecutive_failures > 0) {
      await nodeRepository.resetFailures(node.id);
      logger.info(`Node ${node.name} (${node.id}) recovered`);
    } else {
      await nodeRepository.updateStatus(node.id, 'active', { last_check_at: new Date() });
    }
  } else {
    const updated = await nodeRepository.incrementFailures(node.id);
    if (updated && updated.consecutive_failures >= node.failure_threshold) {
      if (updated.status !== 'down') {
        await nodeRepository.updateStatus(node.id, 'down');
        logger.warn(`Node ${node.name} (${node.id}) is DOWN — ${updated.consecutive_failures} consecutive failures`);
      }
    } else if (updated && updated.consecutive_failures >= 2 && updated.status !== 'warning') {
      await nodeRepository.updateStatus(updated.id, 'warning');
    }
  }
};
