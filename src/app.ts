import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsConfig } from '@configs/cors.config';
import { rateLimiter } from '@middlewares/rate-limit.middleware';
import { ResponseUtil } from '@utils/response.util';
import { logger } from '@utils/logger.util';
import { MESSAGE_KEYS } from '@shared/constants';
import routes from '@routes/index';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors(corsConfig));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(rateLimiter);
  }

  private setupRoutes(): void {
    this.app.use('/api', routes);

    this.app.use((_req: Request, res: Response) => {
      ResponseUtil.notFound(res, MESSAGE_KEYS.NOT_FOUND);
    });
  }

  private setupErrorHandling(): void {
    this.app.use(
      (error: Error, _req: Request, res: Response, _next: NextFunction) => {
        logger.error('Unhandled application error', error);
        ResponseUtil.serverError(res, MESSAGE_KEYS.INTERNAL_SERVER_ERROR);
      }
    );
  }
}

export default new App().app;
