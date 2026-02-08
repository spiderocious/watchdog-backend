import { Router, Request, Response } from 'express';
import { systemController } from '@controllers/system.controller';

const router = Router();

router.get('/status', systemController.getStatus);

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

export default router;
