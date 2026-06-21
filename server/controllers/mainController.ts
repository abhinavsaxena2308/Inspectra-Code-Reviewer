import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { parseRepoUrl } from '../services/githubService';
import { createPendingAnalysis, getAnalysis, getUserActivity, getUserRepositories, getUserStats, getHistoryStats, getHistoryList, exportUserData, deleteUserHistory } from '../services/storageService';
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

    // Always fetch DB repos first
    const dbRepos = await getUserRepositories(userId);
    const dbRepoMap = new Map(dbRepos.map(r => [`${r.owner}/${r.repo_name}`.toLowerCase(), r]));

    let githubToken: string | undefined = undefined;

    // Try to get OAuth token
    try {
      const oauthResponse = await clerkClient.users.getUserOauthAccessToken(userId, 'github');
      if (oauthResponse.data && oauthResponse.data.length > 0) {
        githubToken = oauthResponse.data[0].token;
      }
    } catch (e) {
      console.log('[getConnectedRepos] No OAuth token found.');
    }

    // Try to get PAT token fallback if no OAuth token
    if (!githubToken) {
      try {
        const userObj = await clerkClient.users.getUser(userId);
        githubToken = (userObj.publicMetadata?.github_token || userObj.privateMetadata?.github_token || userObj.unsafeMetadata?.github_token) as string | undefined;
      } catch (e) {
        console.log('[getConnectedRepos] Failed to fetch user metadata.');
      }
    }

    // Try to fetch GitHub repos if token exists
    let githubRepos: any[] = [];
    if (githubToken) {
      try {
        const { getGitHubRepositories } = await import('../services/githubService');
        githubRepos = await getGitHubRepositories(githubToken);
      } catch (e: any) {
        console.log('[getConnectedRepos] Failed to fetch from GitHub API:', e.message);
      }
    }

    if (githubRepos.length > 0) {
      // Merge GitHub repos with DB repos
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
      return res.json({ status: 'success', data: mergedRepos });
    } else {
      // Fallback: Just return DB repos
      const fallbackRepos = dbRepos.map(r => ({
          id: r.id.toString(),
          name: `${r.owner}/${r.repo_name}`,
          description: '',
          isPrivate: false,
          language: 'Unknown',
          url: `https://github.com/${r.owner}/${r.repo_name}`,
          updatedAt: r.last_analyzed || new Date().toISOString(),
          analysisId: r.analysis_id,
          score: r.score,
          status: r.status,
          lastAnalyzed: r.last_analyzed
      }));
      return res.json({ status: 'success', data: fallbackRepos });
    }

  } catch (error: any) {
    console.error('[getConnectedRepos] Error:', error.message);
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

export const getHistoryListController = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const list = await getHistoryList(userId);
    res.json({ status: 'success', data: list });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch history list' });
  }
};

export const exportDataController = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const data = await exportUserData(userId);
    res.json({ status: 'success', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to export data' });
  }
};

export const clearHistoryController = async (req: Request, res: Response) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    await deleteUserHistory(userId);
    res.json({ status: 'success', message: 'History cleared successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to clear history' });
  }
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

export const chatController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ status: 'error', message: 'Prompt is required' });
    }
    
    const userId = getAuth(req).userId;
    let context = "You are Inspectra, an AI code review assistant. Answer the user's questions EXTREMELY concisely. Keep your answers very short. ALWAYS format your responses using clean Markdown. DO NOT output any internal <think> blocks or reasoning processes. Output ONLY the final response to the user. CRITICAL RULE: You MUST strictly refuse to answer any questions or requests that are not directly related to code review, software architecture, the Inspectra platform, or the user's connected repositories. If the user asks you to write general code (e.g., 'give me a html form'), you MUST politely decline and state that you are an analysis assistant, not a general-purpose code generator. ";
    
    if (userId) {
      const repos = await getUserRepositories(userId);
      if (repos && repos.length > 0) {
        const repoList = repos.map(r => `- **${r.owner}/${r.repo_name}** (Score: ${r.score || 'N/A'}, Status: ${r.status})`).join('\n');
        context += `\n\nThe user's current connected repositories are:\n${repoList}\n\nUse this information if they ask about their repos. Output a structured list.`;
      } else {
        context += `\n\nThe user currently has no repositories connected.`;
      }
    }

    const fullPrompt = `${context}\n\nUser Question: ${prompt}\n\nInspectra:`;

    const { chatWithOllama } = await import('../services/ollamaService');
    let responseText = await chatWithOllama(fullPrompt);
    
    // Strip out <think> blocks natively generated by reasoning models
    responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    res.json({ status: 'success', data: { response: responseText } });
  } catch (error) {
    next(error);
  }
};

export const getAiSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const userObj = await clerkClient.users.getUser(userId);
    const aiSettings = userObj.publicMetadata?.aiSettings || {
      strictness: 'standard',
      focusArea: 'general',
      customInstructions: ''
    };

    res.json({ status: 'success', data: aiSettings });
  } catch (error) {
    next(error);
  }
};

export const updateAiSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const { strictness, focusArea, customInstructions } = req.body;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        aiSettings: {
          strictness: strictness || 'standard',
          focusArea: focusArea || 'general',
          customInstructions: customInstructions || ''
        }
      }
    });

    res.json({ status: 'success', message: 'AI Settings updated' });
  } catch (error) {
    next(error);
  }
};
