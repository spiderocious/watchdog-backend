import { Router } from 'express';
import authRoutes from './auth.routes';
import nodeRoutes from './node.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', nodeRoutes);

export default router;
