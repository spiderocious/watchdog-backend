import { NodeModel, NodeDocument } from '@models/node.model';
import { NodeStatus } from '@shared/types';

interface ListNodesQuery {
  user_id: string;
  page: number;
  limit: number;
  search?: string;
  status?: NodeStatus;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

class NodeRepository {
  private static instance: NodeRepository;

  private constructor() {}

  public static getInstance(): NodeRepository {
    if (!NodeRepository.instance) {
      NodeRepository.instance = new NodeRepository();
    }
    return NodeRepository.instance;
  }

  async create(data: Partial<NodeDocument>): Promise<NodeDocument> {
    return NodeModel.create(data);
  }

  async findById(id: string): Promise<NodeDocument | null> {
    return NodeModel.findOne({ id }).lean();
  }

  async findByIdAndUser(id: string, userId: string): Promise<NodeDocument | null> {
    return NodeModel.findOne({ id, user_id: userId }).lean();
  }

  async list(query: ListNodesQuery): Promise<{ items: NodeDocument[]; total: number }> {
    const { user_id, page, limit, search, status, sort_by, sort_order } = query;
    const skip = (page - 1) * limit;

    const filter: any = { user_id };
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const sortField = sort_by || 'created_at';
    const sortDirection = sort_order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      NodeModel.find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      NodeModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async update(id: string, userId: string, data: Partial<NodeDocument>): Promise<NodeDocument | null> {
    return NodeModel.findOneAndUpdate(
      { id, user_id: userId },
      { $set: data },
      { new: true }
    ).lean();
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await NodeModel.deleteOne({ id, user_id: userId });
    return result.deletedCount > 0;
  }

  async findActiveNodes(): Promise<NodeDocument[]> {
    return NodeModel.find({ status: 'active' }).lean();
  }

  async findByUserId(userId: string): Promise<NodeDocument[]> {
    return NodeModel.find({ user_id: userId }).lean();
  }

  async updateStatus(id: string, status: NodeStatus, extras?: Partial<NodeDocument>): Promise<NodeDocument | null> {
    return NodeModel.findOneAndUpdate(
      { id },
      { $set: { status, ...extras } },
      { new: true }
    ).lean();
  }

  async incrementFailures(id: string): Promise<NodeDocument | null> {
    return NodeModel.findOneAndUpdate(
      { id },
      { $inc: { consecutive_failures: 1 }, $set: { last_check_at: new Date() } },
      { new: true }
    ).lean();
  }

  async resetFailures(id: string): Promise<NodeDocument | null> {
    return NodeModel.findOneAndUpdate(
      { id },
      { $set: { consecutive_failures: 0, status: 'active', last_check_at: new Date() } },
      { new: true }
    ).lean();
  }

  async countByUser(userId: string): Promise<{ total: number; active: number; down: number; paused: number; warning: number }> {
    const counts = await NodeModel.aggregate([
      { $match: { user_id: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = { total: 0, active: 0, down: 0, paused: 0, warning: 0 };
    for (const c of counts) {
      result[c._id as keyof typeof result] = c.count;
      result.total += c.count;
    }
    return result;
  }
}

export const nodeRepository = NodeRepository.getInstance();
