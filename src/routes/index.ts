import { Router } from 'express';
import authRoutes from './auth.routes';
import nodeRoutes from './node.routes';
import dashboardRoutes from './dashboard.routes';
import systemRoutes from './system.routes';
import healthCheckRoutes from './health-check.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', nodeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/system', systemRoutes);
router.use('/health-checks', healthCheckRoutes);

export default router;
