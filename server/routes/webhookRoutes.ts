import { Router } from 'express';
import { handleGithubWebhook } from '../controllers/webhookController.ts';

const router = Router();
router.post('/github', handleGithubWebhook);

export default router;
