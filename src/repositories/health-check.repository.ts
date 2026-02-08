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

  async getTelemetryBuckets(
    nodeIds: string[],
    since: Date,
    bucketSeconds: number = 30
  ): Promise<{
    timestamp: string;
    avg_response: number;
    p99_response: number;
    total_checks: number;
    failed_checks: number;
  }[]> {
    const bucketMs = bucketSeconds * 1000;

    const pipeline: any[] = [
      {
        $match: {
          node_id: { $in: nodeIds },
          created_at: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $subtract: [
              { $toLong: '$created_at' },
              { $mod: [{ $toLong: '$created_at' }, bucketMs] },
            ],
          },
          avg_response: { $avg: '$response_time' },
          p99_response: {
            $percentile: {
              input: '$response_time',
              p: [0.99],
              method: 'approximate',
            },
          },
          total_checks: { $sum: 1 },
          failed_checks: { $sum: { $cond: ['$success', 0, 1] } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const result = await HealthCheckModel.aggregate(pipeline);

    return result.map((r) => ({
      timestamp: new Date(r._id).toISOString(),
      avg_response: Math.round(r.avg_response * 10) / 10,
      p99_response: Math.round((r.p99_response?.[0] || r.avg_response) * 10) / 10,
      total_checks: r.total_checks,
      failed_checks: r.failed_checks,
    }));
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
