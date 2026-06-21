import { Router } from 'express';
import { 
  analyzeRepository, 
  getAnalysisResult, 
  getDashboardRepositories, 
  getDashboardStats, 
  getDashboardActivity,
  getHistoryStatsController,
  getHistoryListController
} from '../controllers/mainController';

const router = Router();

router.post('/analyze', analyzeRepository);
router.get('/analysis/:id', getAnalysisResult);
router.get('/status/:id', getAnalysisResult);

router.get('/repositories', getDashboardRepositories);
router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);

router.get('/history/stats', getHistoryStatsController);
router.get('/history/list', getHistoryListController);

export default router;
