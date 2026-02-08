import { envConfig } from '@configs/env.config';
import { databaseUtil } from '@utils/database.util';
import { logger } from '@utils/logger.util';
import app from './app';

const start = async (): Promise<void> => {
  try {
    await databaseUtil.connect();

    app.listen(envConfig.port, () => {
      logger.info(`Server running on port ${envConfig.port} [${envConfig.nodeEnv}]`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await databaseUtil.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down...');
  await databaseUtil.disconnect();
  process.exit(0);
});

start();
