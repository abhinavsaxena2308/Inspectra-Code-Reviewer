import { Router } from 'express';
import { analyzeRepository, getAnalysisResult } from '../controllers/mainController';

const router = Router();

router.post('/analyze', analyzeRepository);
router.get('/analysis/:id', getAnalysisResult);
router.get('/status/:id', getAnalysisResult);

router.get('/debug-env', (req, res) => {
    res.json({
        cwd: process.cwd(),
        url: process.env.VITE_INSFORGE_URL ? 'SET' : 'MISSING',
        key: process.env.VITE_INSFORGE_ANON_KEY ? 'SET' : 'MISSING'
    });
});

export default router;
