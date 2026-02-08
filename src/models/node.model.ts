import mongoose, { Schema, Document } from 'mongoose';
import { MonitorNode } from '@shared/types';

export interface NodeDocument extends MonitorNode, Document {}

const nodeSchema = new Schema<NodeDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    endpoint_url: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      default: 'GET',
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    body: {
      type: String,
      default: '',
    },
    check_interval: {
      type: Number,
      required: true,
      default: 30000,
    },
    expected_status_codes: {
      type: [Number],
      default: [200, 201, 204],
    },
    failure_threshold: {
      type: Number,
      default: 3,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'down', 'warning'],
      default: 'active',
    },
    consecutive_failures: {
      type: Number,
      default: 0,
    },
    last_check_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'nodes',
  }
);

nodeSchema.index({ user_id: 1, status: 1 });
nodeSchema.index({ user_id: 1, name: 'text' });

export const NodeModel = mongoose.model<NodeDocument>('Node', nodeSchema);
