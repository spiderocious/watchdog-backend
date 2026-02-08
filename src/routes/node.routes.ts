import { Router } from 'express';
import { nodeController } from '@controllers/node.controller';
import {
  createNodeValidation,
  updateNodeValidation,
  serviceIdParam,
  listNodesValidation,
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

export default router;
