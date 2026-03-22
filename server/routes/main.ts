import { Router } from 'express';
import { analyzeRepository, getAnalysisResult } from '../controllers/mainController';

const router = Router();

router.post('/analyze', analyzeRepository);
router.get('/analysis/:id', getAnalysisResult);

export default router;
