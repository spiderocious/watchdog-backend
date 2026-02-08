import { Router } from 'express';
import { authController } from '@controllers/auth.controller';
import { registerValidation, loginValidation } from '@requests/auth.validation';
import { validateRequest } from '@middlewares/validate-request.middleware';
import { authenticate } from '@middlewares/auth.middleware';
import { authRateLimiter } from '@middlewares/rate-limit.middleware';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  registerValidation,
  validateRequest,
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  loginValidation,
  validateRequest,
  authController.login
);

router.get(
  '/me',
  authenticate,
  authController.getMe
);

export default router;
