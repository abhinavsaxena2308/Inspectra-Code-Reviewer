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

  try {
    const result = await getAnalysis(id);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Analysis result not found',
      });
    }

    // Group issues by file_name
    const filesMap: Record<string, any[]> = {};
    (result.issues || []).forEach((issue: any) => {
      if (!filesMap[issue.file_name]) {
        filesMap[issue.file_name] = [];
      }
      filesMap[issue.file_name].push({
        type: issue.type || 'bug',
        severity: issue.severity,
        message: issue.message,
        suggestion: issue.suggestion
      });
    });

    const files = Object.entries(filesMap).map(([file_name, issues]) => ({
      file_name,
      issues
    }));

    // Calculate score if missing from DB
    let score = result.score;
    if (score === undefined || score === null) {
      score = 100;
      (result.issues || []).forEach((issue: any) => {
        if (issue.type === 'bug') score -= 10;
        else if (issue.type === 'security') score -= 20;
        else if (issue.type === 'performance') score -= 5;
        else if (issue.type === 'suggestion') score -= 2;
      });
      score = Math.max(0, score);
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: result.id,
        repo: `${result.repositories?.owner}/${result.repositories?.repo_name}`,
        score: score,
        status: result.status,
        files: files,
        created_at: result.created_at
      },
    });
  } catch (error: any) {
    next(error);
  }
};
