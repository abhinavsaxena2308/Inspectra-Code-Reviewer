import { Router } from 'express';
import { analyzeRepository } from '../controllers/githubController';

const router = Router();

router.post('/analyze', analyzeRepository);

export default router;
