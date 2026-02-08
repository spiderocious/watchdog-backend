import { Router } from 'express';
import authRoutes from './auth.routes';
import nodeRoutes from './node.routes';
import dashboardRoutes from './dashboard.routes';
import systemRoutes from './system.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', nodeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/system', systemRoutes);

export default router;
