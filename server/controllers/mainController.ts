import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { parseRepoUrl } from '../services/githubService';
import { createPendingAnalysis, getAnalysis } from '../services/storageService';
import { processRepositoryAnalysis } from '../workers/analysisWorker';
import { calculateScore } from '../services/scoringService';

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
