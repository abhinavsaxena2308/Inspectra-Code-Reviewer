import { Router } from 'express';
import { 
  analyzeRepository, 
  getAnalysisResult, 
  getDashboardRepositories, 
  getDashboardStats, 
  getDashboardActivity,
  getHistoryStatsController,
  getHistoryListController,
  streamAnalysisLogs,
  getConnectedRepos,
  exportDataController,
  clearHistoryController,
  chatController
} from '../controllers/mainController';

const router = Router();

router.post('/analyze', analyzeRepository);
router.get('/analysis/:id', getAnalysisResult);
router.get('/status/:id', getAnalysisResult);
router.get('/analysis/:id/logs', streamAnalysisLogs);

router.get('/repositories', getDashboardRepositories);
router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);

router.get('/history/stats', getHistoryStatsController);
router.get('/history/list', getHistoryListController);
router.get('/github/repos', getConnectedRepos);

router.get('/data/export', exportDataController);
router.delete('/data/history', clearHistoryController);

router.post('/chat', chatController);

export default router;
