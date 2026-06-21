import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { parseRepoUrl } from '../services/githubService';
import { createPendingAnalysis, getAnalysis, getUserActivity, getUserRepositories, getUserStats, getHistoryStats, getHistoryList } from '../services/storageService';
import { logEmitter, getAnalysisLogs } from '../services/logService';
import { processRepositoryAnalysis } from '../workers/analysisWorker';
import { calculateScore } from '../services/scoringService';
import { getAuth, clerkClient } from '@clerk/express';

const analyzeBodySchema = z.object({
  repoUrl: z.string().url('Must provide a valid URL string'),
});

const idParamSchema = z.object({
  id: z.string().min(1, 'Invalid Analysis ID format'),
});

export const analyzeRepository = async (req: Request, res: Response, next: NextFunction) => {
  const validation = analyzeBodySchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid request body',
      errors: validation.error.format(),
    });
  }

  const { repoUrl } = validation.data;

  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid GitHub repository URL',
    });
  }

  try {
    const { owner, repo } = parsed;

    // 1. Create a pending job in the DB
    const userId = getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const analysisId = await createPendingAnalysis(repoUrl, owner, repo, userId);

    if (!analysisId) {
       return res.status(500).json({
         status: 'error',
         message: 'Failed to initialize analysis job. Storage might be offline.'
       });
    }

    // 2. Fire and Forget the worker
    processRepositoryAnalysis(analysisId, repoUrl, owner, repo, userId).catch(err => {
        console.error(`[Main] Background worker crashed for ${analysisId}:`, err);
    });

    // 3. Return immediately
    res.status(202).json({
      status: 'success',
      data: {
          id: analysisId,
          owner,
          repo,
          jobStatus: 'pending',
          message: 'Analysis job started in the background. Poll the status endpoint with this ID.'
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAnalysisResult = async (req: Request, res: Response, next: NextFunction) => {
  const validation = idParamSchema.safeParse(req.params);

  if (!validation.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid Analysis ID',
      errors: validation.error.format(),
    });
  }

  const { id } = validation.data;
  console.log(`[Main] Fetching status for job: ${id}`);

  try {
    const userId = getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const result = await getAnalysis(id, userId);

    if (!result) {
      console.warn(`[Main] Job ${id} was not found in database.`);
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Analysis result not found',
      });
    }

    console.log(`[Main] Found job ${id} with status: ${result.status}`);

    // The getAnalysis result now includes joined repositories and issues
    const repository = result.repositories;
    const issues = result.issues || [];

    // Group issues by file_name
    const filesMap: Record<string, any[]> = {};
    issues.forEach((issue: any) => {
      const fileName = issue.file_name || 'unknown';
      
      // If the table doesn't have a 'type' column, issue.type might be undefined.
      // We also check for 'file-meta' marker to potentially skip it in UI if needed, 
      // but usually the UI expects all files that were analyzed.
      if (!filesMap[fileName]) {
        filesMap[fileName] = [];
      }
      
      if (issue.type !== 'file-meta') {
        filesMap[fileName].push({
          type: issue.type || 'bug',
          severity: issue.severity || 'info',
          message: issue.message || 'No message',
          suggestion: issue.suggestion || '',
          line: issue.line_number
        });
      }
    });

    const files = Object.entries(filesMap).map(([file_name, fileIssues]) => ({
      file_name,
      issues: fileIssues
    }));

    // Calculate score if it's not already stored
    let score = result.score;
    if (score === undefined || score === null) {
      score = calculateScore(issues);
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: result.id,
        repo: repository ? `${repository.owner}/${repository.repo_name}` : 'Unknown Repository',
        score: score,
        status: result.status,
        files: files,
        created_at: result.created_at
      },
    });
  } catch (error: any) {
    console.error(`[Main] Error in getAnalysisResult for ${req.params.id}:`, error);
    next(error);
  }
};

export const getDashboardRepositories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const repos = await getUserRepositories(userId);
    res.json({ status: 'success', data: repos.map(r => ({
      id: r.analysis_id || r.id, // Fallback to repo id if no analysis exists
      name: `${r.owner}/${r.repo_name}`,
      language: 'Unknown',
      score: r.score || 0,
      lastAnalyzed: r.last_analyzed ? new Date(r.last_analyzed).toLocaleDateString() : 'Never',
      status: r.status || 'pending'
    })) });
  } catch (error) { next(error); }
};

export const getConnectedRepos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // 1. Fetch OAuth token from Clerk
    const oauthResponse = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_github');
    const tokens = oauthResponse.data;
    
    if (!tokens || tokens.length === 0) {
      return res.status(404).json({ status: 'error', message: 'GitHub account not connected' });
    }

    const githubToken = tokens[0].token;

    // 2. Fetch repos from GitHub using the token
    const { getGitHubRepositories } = await import('../services/githubService');
    const githubRepos = await getGitHubRepositories(githubToken);

    // 3. Fetch past analysis from our DB to join status
    const dbRepos = await getUserRepositories(userId);
    const dbRepoMap = new Map(dbRepos.map(r => [`${r.owner}/${r.repo_name}`.toLowerCase(), r]));

    // 4. Merge
    const mergedRepos = githubRepos.map(r => {
      const fullName = r.full_name;
      const dbInfo = dbRepoMap.get(fullName.toLowerCase());
      
      return {
        id: r.id.toString(),
        name: r.full_name,
        description: r.description,
        isPrivate: r.private,
        language: r.language || 'Unknown',
        url: r.html_url,
        updatedAt: r.updated_at,
        // Inspectra specific info
        analysisId: dbInfo?.analysis_id,
        score: dbInfo?.score,
        status: dbInfo?.status || 'unscanned',
        lastAnalyzed: dbInfo?.last_analyzed
      };
    });

    res.json({ status: 'success', data: mergedRepos });
  } catch (error: any) {
    console.error('[getConnectedRepos] Error:', error.message);
    if (error.message.includes('No OAuth access token found') || error.message.includes('not connected')) {
       return res.status(404).json({ status: 'error', message: 'GitHub account not connected' });
    }
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const stats = await getUserStats(userId);
    res.json({ status: 'success', data: [
      { label: 'Total Analyses', value: stats.total.toString(), color: 'text-gh-blue' },
      { label: 'Average Score', value: stats.avg_score.toString(), color: 'text-gh-orange' },
      { label: 'Issues Detected', value: stats.issues.toString(), color: 'text-error' },
    ] });
  } catch (error) { next(error); }
};

export const getDashboardActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const activities = await getUserActivity(userId);
    res.json({ status: 'success', data: activities.map(a => ({
      id: a.id,
      type: a.status === 'completed' ? 'analysis-completed' : 'new-issues',
      repoName: a.repo_name,
      timestamp: new Date(a.created_at).toLocaleTimeString() + ' ' + new Date(a.created_at).toLocaleDateString(),
    })) });
  } catch (error) { next(error); }
};

export const getHistoryStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const stats = await getHistoryStats(userId);
    res.json({ status: 'success', data: stats });
  } catch (error) { next(error); }
};

export const getHistoryListController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const list = await getHistoryList(userId);
    res.json({ status: 'success', data: list });
  } catch (error) { next(error); }
};

export const streamAnalysisLogs = (req: Request, res: Response) => {
  const { id } = req.params;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send any existing logs immediately
  const existingLogs = getAnalysisLogs(id);
  for (const log of existingLogs) {
    res.write(`data: ${log}\n\n`);
  }

  // Listen for new logs
  const listener = (msg: string) => {
    res.write(`data: ${msg}\n\n`);
  };
  
  logEmitter.on(`log:${id}`, listener);

  req.on('close', () => {
    logEmitter.off(`log:${id}`, listener);
  });
};
