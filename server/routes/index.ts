import { Router } from 'express';
import healthRoutes from './health';
import githubRoutes from './github';
import analysisRoutes from './analysis';
import mainRoutes from './main';

const router = Router();

// API Routing Table
router.use('/', healthRoutes);     // /api/health
router.use('/github', githubRoutes); // /api/github
router.use('/analysis', analysisRoutes); // /api/analysis
router.use('/', mainRoutes);       // /api/analyze, /api/status/:id, etc.

export default router;
