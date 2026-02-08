import { Router } from 'express';
import { healthCheckController } from '@controllers/health-check.controller';
import {
  listHealthChecksValidation,
  triggerManualCheckValidation,
} from '@requests/health-check.validation';
import { validateRequest } from '@middlewares/validate-request.middleware';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  listHealthChecksValidation,
  validateRequest,
  healthCheckController.list
);

router.post(
  '/:service_id/trigger',
  triggerManualCheckValidation,
  validateRequest,
  healthCheckController.triggerManualCheck
);

export default router;
