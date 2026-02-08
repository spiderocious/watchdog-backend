import mongoose from 'mongoose';
import { databaseConfig } from '@configs/database.config';
import { logger } from './logger.util';

class DatabaseUtil {
  private static instance: DatabaseUtil;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseUtil {
    if (!DatabaseUtil.instance) {
      DatabaseUtil.instance = new DatabaseUtil();
    }
    return DatabaseUtil.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await mongoose.connect(databaseConfig.mongoUri, databaseConfig.options);
      this.isConnected = true;
      logger.info('Connected to MongoDB');

      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    await mongoose.disconnect();
    this.isConnected = false;
    logger.info('Disconnected from MongoDB');
  }
}

export const databaseUtil = DatabaseUtil.getInstance();
