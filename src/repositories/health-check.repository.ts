import { HealthCheckModel, HealthCheckDocument } from '@models/health-check.model';

class HealthCheckRepository {
  private static instance: HealthCheckRepository;

  private constructor() {}

  public static getInstance(): HealthCheckRepository {
    if (!HealthCheckRepository.instance) {
      HealthCheckRepository.instance = new HealthCheckRepository();
    }
    return HealthCheckRepository.instance;
  }

  async create(data: {
    id: string;
    node_id: string;
    status_code: number;
    status_text: string;
    response_time: number;
    success: boolean;
    error_message?: string;
  }): Promise<HealthCheckDocument> {
    return HealthCheckModel.create(data);
  }

  async findByNode(nodeId: string, limit: number = 50): Promise<HealthCheckDocument[]> {
    return HealthCheckModel.find({ node_id: nodeId })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
  }

  async findErrorsByNode(nodeId: string, limit: number = 50): Promise<HealthCheckDocument[]> {
    return HealthCheckModel.find({ node_id: nodeId, success: false })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
  }

  async getAverageResponseTime(nodeId: string, since?: Date): Promise<number> {
    const match: any = { node_id: nodeId, success: true };
    if (since) match.created_at = { $gte: since };

    const result = await HealthCheckModel.aggregate([
      { $match: match },
      { $group: { _id: null, avg: { $avg: '$response_time' } } },
    ]);

    return result[0]?.avg || 0;
  }

  async getUptimePercentage(nodeId: string, since?: Date): Promise<number> {
    const match: any = { node_id: nodeId };
    if (since) match.created_at = { $gte: since };

    const result = await HealthCheckModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successes: { $sum: { $cond: ['$success', 1, 0] } },
        },
      },
    ]);

    if (!result[0] || result[0].total === 0) return 100;
    return Math.round((result[0].successes / result[0].total) * 10000) / 100;
  }

  async getCheckCounts(nodeId: string): Promise<{ success_count: number; failure_count: number }> {
    const result = await HealthCheckModel.aggregate([
      { $match: { node_id: nodeId } },
      {
        $group: {
          _id: null,
          success_count: { $sum: { $cond: ['$success', 1, 0] } },
          failure_count: { $sum: { $cond: ['$success', 0, 1] } },
        },
      },
    ]);

    return result[0] || { success_count: 0, failure_count: 0 };
  }

  async deleteByNode(nodeId: string): Promise<void> {
    await HealthCheckModel.deleteMany({ node_id: nodeId });
  }

  async getRecentChecksForNodes(nodeIds: string[], limit: number = 5): Promise<HealthCheckDocument[]> {
    return HealthCheckModel.find({ node_id: { $in: nodeIds } })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
  }

  async getResponseTimeHistory(nodeId: string, since: Date): Promise<{ time: string; value: number }[]> {
    const checks = await HealthCheckModel.find({
      node_id: nodeId,
      success: true,
      created_at: { $gte: since },
    })
      .sort({ created_at: 1 })
      .select('created_at response_time')
      .lean();

    return checks.map((c) => ({
      time: c.created_at.toISOString(),
      value: c.response_time,
    }));
  }
}

export const healthCheckRepository = HealthCheckRepository.getInstance();
