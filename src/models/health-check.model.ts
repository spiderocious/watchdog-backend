import mongoose, { Schema, Document } from 'mongoose';
import { HealthCheck } from '@shared/types';

export interface HealthCheckDocument extends HealthCheck, Document {}

const healthCheckSchema = new Schema<HealthCheckDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    node_id: {
      type: String,
      required: true,
      index: true,
    },
    status_code: {
      type: Number,
      required: true,
    },
    status_text: {
      type: String,
      required: true,
    },
    response_time: {
      type: Number,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    error_message: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    collection: 'health_checks',
  }
);

healthCheckSchema.index({ node_id: 1, created_at: -1 });

export const HealthCheckModel = mongoose.model<HealthCheckDocument>('HealthCheck', healthCheckSchema);
