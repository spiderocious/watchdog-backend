import { Router } from 'express';
import { systemController } from '@controllers/system.controller';

const router = Router();

router.get('/status', systemController.getStatus);

export default router;
