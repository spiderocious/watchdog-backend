import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@shared/types';

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'users',
  }
);

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
