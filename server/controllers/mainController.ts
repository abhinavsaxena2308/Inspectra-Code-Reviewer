import { Request, Response, NextFunction } from 'express';
import { parseRepoUrl, getRepositoryContents, fetchFileContent } from '../services/githubService';
import { analyzeMultipleFiles } from '../services/analysisService';
import { saveAnalysis, getAnalysis } from '../services/storageService';
import crypto from 'crypto';

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

    // 1. Fetch all file metadata
    const fileMetadata = await getRepositoryContents(owner, repo);
    
    // 2. Fetch content for each file
    const filesWithContent = await Promise.all(
        fileMetadata.map(async (file) => ({
            name: file.name,
            content: await fetchFileContent(file.download_url!)
        }))
    );

    // 3. Run Analysis
    const analysisResults = await analyzeMultipleFiles(filesWithContent);

    // 4. Prepare and Store Results
    const resultData = {
        repoUrl,
        owner,
        repoName: repo,
        issues: analysisResults
    };

    // Try to save, but don't fail the whole request if DB fails (since we return results)
    let saved = false;
    let analysisId = null;
    let saveErrorMessage = null;
    try {
        const result = await saveAnalysis(resultData);
        if (result) {
            analysisId = result.analysisId;
            saved = true;
        }
    } catch (saveError: any) {
        saveErrorMessage = saveError.stack || JSON.stringify(saveError) || String(saveError);
        console.error('[Main] Failed to save analysis:', saveError);
    }

    res.status(200).json({
      status: 'success',
      data: {
          id: analysisId,
          owner,
          repo,
          saved,
          saveErrorMessage,
          results: analysisResults
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
