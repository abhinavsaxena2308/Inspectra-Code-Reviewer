import { Router } from 'express';
import healthRoutes from './health';
import githubRoutes from './github';

const router = Router();

// Aggregate all routes
router.use('/', healthRoutes);
router.use('/github', githubRoutes);

export default router;
