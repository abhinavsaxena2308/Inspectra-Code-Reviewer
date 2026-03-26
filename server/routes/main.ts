import { Router } from 'express';
import { analyzeRepository, getAnalysisResult } from '../controllers/mainController';

const router = Router();

router.post('/analyze', analyzeRepository);
router.get('/analysis/:id', getAnalysisResult);
router.get('/status/:id', getAnalysisResult);
router.get('/debug/analysis/:id', async (req, res) => {
    const { getAnalysis } = await import('../services/storageService');
    const result = await getAnalysis(req.params.id);
    res.json({ found: !!result, data: result });
});

export default router;
