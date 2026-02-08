import { nodeRepository } from '@repositories/node.repository';
import { logger } from '@utils/logger.util';
import { executeCheck } from './check-executor';
import { NodeDocument } from '@models/node.model';

class MonitoringEngine {
  private static instance: MonitoringEngine;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): MonitoringEngine {
    if (!MonitoringEngine.instance) {
      MonitoringEngine.instance = new MonitoringEngine();
    }
    return MonitoringEngine.instance;
  }

  async start(): Promise<void> {
    const activeNodes = await nodeRepository.findActiveNodes();
    logger.info(`Starting monitoring engine — ${activeNodes.length} active nodes`);

    for (const node of activeNodes) {
      this.startNode(node);
    }
  }

  startNode(node: NodeDocument): void {
    if (this.timers.has(node.id)) {
      this.stopNode(node.id);
    }

    const interval = setInterval(async () => {
      try {
        const currentNode = await nodeRepository.findById(node.id);
        if (!currentNode || currentNode.status === 'paused') {
          this.stopNode(node.id);
          return;
        }
        await executeCheck(currentNode);
      } catch (error) {
        logger.error(`Check failed for node ${node.id}`, error);
      }
    }, node.check_interval);

    this.timers.set(node.id, interval);
    logger.debug(`Started monitoring: ${node.name} (${node.id}) every ${node.check_interval}ms`);
  }

  stopNode(nodeId: string): void {
    const timer = this.timers.get(nodeId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(nodeId);
      logger.debug(`Stopped monitoring: ${nodeId}`);
    }
  }

  stopAll(): void {
    for (const [nodeId, timer] of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
    logger.info('Monitoring engine stopped — all timers cleared');
  }

  isMonitoring(nodeId: string): boolean {
    return this.timers.has(nodeId);
  }

  get activeCount(): number {
    return this.timers.size;
  }
}

export const monitoringEngine = MonitoringEngine.getInstance();
