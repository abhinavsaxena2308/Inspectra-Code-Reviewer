import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { parseRepoUrl } from '../services/githubService';
import { createPendingAnalysis, getAnalysis } from '../services/storageService';
import { processRepositoryAnalysis } from '../workers/analysisWorker';

const analyzeBodySchema = z.object({
  repoUrl: z.string().url('Must provide a valid URL string'),
});

const idParamSchema = z.object({
  id: z.string().uuid('Invalid Analysis ID format'),
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
    const analysisId = await createPendingAnalysis(repoUrl, owner, repo);

    if (!analysisId) {
       return res.status(500).json({
         status: 'error',
         message: 'Failed to initialize analysis job. Storage might be offline.'
       });
    }

    // 2. Fire and Forget the worker
    // Notice we do NOT await this statement, it runs in the background.
    processRepositoryAnalysis(analysisId, repoUrl, owner, repo).catch(err => {
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
    const result = await getAnalysis(id);

    if (!result) {
      console.warn(`[Main] Job ${id} was not found in database.`);
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Analysis result not found',
      });
    }

    console.log(`[Main] Founding job ${id} with status: ${result.status}`);
    console.log(`[Main] Found job ${id} with status: ${result.status}`);

    // Fetch repository and issues if not in result
    let repository = result.repositories;
    let issues = result.issues;

    if (!repository && result.repo_id) {
       const client = (await import('../services/storageService')).getClient();
       if (client) {
         const { data: repoData } = await client.database
           .from('repositories')
           .select('repo_url, owner, repo_name')
           .eq('id', result.repo_id)
           .single();
         repository = repoData;
       }
    }

    if (!issues) {
       const client = (await import('../services/storageService')).getClient();
       if (client) {
         const { data: issuesData } = await client.database
           .from('issues')
           .select('*')
           .eq('analysis_id', id);
         issues = issuesData || [];
       }
    }

    // Group issues by file_name
    const filesMap: Record<string, any[]> = {};
    (issues || []).forEach((issue: any) => {
      if (!filesMap[issue.file_name]) {
        filesMap[issue.file_name] = [];
      }
      filesMap[issue.file_name].push({
        type: issue.type || 'bug',
        severity: issue.severity,
        message: issue.message,
        suggestion: issue.suggestion || ''
      });
    });

    const files = Object.entries(filesMap).map(([file_name, issues]) => ({
      file_name,
      issues
    }));

    // Calculate score
    let score = result.score;
    if (score === undefined || score === null) {
      score = 100;
      (issues || []).forEach((issue: any) => {
        if (issue.type === 'bug') score -= 10;
        else if (issue.severity === 'high' || issue.severity === 'critical') score -= 15;
        else if (issue.severity === 'medium') score -= 5;
        else score -= 2;
      });
      score = Math.max(0, score);
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
