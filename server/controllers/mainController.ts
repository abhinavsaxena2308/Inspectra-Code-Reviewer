import { Request, Response, NextFunction } from 'express';
import { parseRepoUrl } from '../services/githubService';
import { createPendingAnalysis, getAnalysis } from '../services/storageService';
import { processRepositoryAnalysis } from '../workers/analysisWorker';

export const analyzeRepository = async (req: Request, res: Response, next: NextFunction) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'GitHub repository URL is required',
    });
  }

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
  const { id } = req.params;

  try {
    const result = await getAnalysis(id);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Analysis result not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};
