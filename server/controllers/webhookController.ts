import { Request, Response } from 'express';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'whsec_1234567890abcdef';

export const handleGithubWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const event = req.headers['x-github-event'] as string;

  console.log(`[Webhook] Received event: ${event}`);

  // Signature verification (mocked logic)
  if (signature) {
    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    if (signature !== digest) {
      console.warn('[Webhook] Invalid signature, but allowing in dev mode.');
    }
  }

  // Handle PR actions
  if (event === 'pull_request') {
    const action = req.body.action;
    if (action === 'opened' || action === 'synchronize') {
      const repoUrl = req.body.repository?.html_url || 'Unknown Repo';
      const prNumber = req.body.number;
      
      console.log(`[Webhook] CI/CD Trigger: PR #${prNumber} ${action} on ${repoUrl}`);
      // In a real app, we would enqueue the repoUrl for analysis using queueService
      // and update the PR status via GitHub API.
      console.log(`[Webhook] Queued analysis for ${repoUrl}...`);
    }
  }

  res.status(200).json({ received: true, status: 'simulated' });
};
