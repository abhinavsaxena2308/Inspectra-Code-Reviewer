import { Router } from 'express';
import { analyzeCode } from '../controllers/analysisController';

const router = Router();

router.post('/analyze', analyzeCode);

export default router;
