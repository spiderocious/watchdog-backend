import { Router } from 'express';
import { nodeController } from '@controllers/node.controller';
import {
  createNodeValidation,
  updateNodeValidation,
  serviceIdParam,
  listNodesValidation,
  testConnectionValidation,
} from '@requests/node.validation';
import { validateRequest } from '@middlewares/validate-request.middleware';
import { authenticate } from '@middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  listNodesValidation,
  validateRequest,
  nodeController.list
);

router.post(
  '/',
  createNodeValidation,
  validateRequest,
  nodeController.create
);

router.get(
  '/:service_id',
  serviceIdParam,
  validateRequest,
  nodeController.getById
);

router.patch(
  '/:service_id',
  updateNodeValidation,
  validateRequest,
  nodeController.update
);

router.delete(
  '/:service_id',
  serviceIdParam,
  validateRequest,
  nodeController.delete
);

router.post(
  '/test',
  testConnectionValidation,
  validateRequest,
  nodeController.testConnection
);

router.post(
  '/:service_id/pause',
  serviceIdParam,
  validateRequest,
  nodeController.pause
);

router.post(
  '/:service_id/resume',
  serviceIdParam,
  validateRequest,
  nodeController.resume
);

router.post(
  '/:service_id/test',
  serviceIdParam,
  validateRequest,
  nodeController.testCheck
);

export default router;
