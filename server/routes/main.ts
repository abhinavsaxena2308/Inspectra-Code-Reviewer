import { Router } from 'express';
import { 
  analyzeRepository, 
  getAnalysisResult, 
  getDashboardRepositories, 
  getDashboardStats, 
  getDashboardActivity 
} from '../controllers/mainController';

const router = Router();

router.post('/analyze', analyzeRepository);
router.get('/analysis/:id', getAnalysisResult);
router.get('/status/:id', getAnalysisResult);

router.get('/repositories', getDashboardRepositories);
router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);

export default router;
