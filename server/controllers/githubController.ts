import { Request, Response, NextFunction } from 'express';
import { parseRepoUrl, getRepositoryContents, fetchFileContent } from '../services/githubService';

export const analyzeRepository = async (req: Request, res: Response, next: NextFunction) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'repoUrl is required',
    });
  }

  const repoDetails = parseRepoUrl(repoUrl);
  if (!repoDetails) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid GitHub repository URL',
    });
  }

  try {
    const { owner, repo } = repoDetails;
    const files = await getRepositoryContents(owner, repo);

    // Filter down to a reasonable number of files for content fetching if needed,
    // or fetch all as requested. For now, we fetch content for all found files.
    const fileContents = await Promise.all(
      files.map(async (file) => {
        if (file.download_url) {
          const content = await fetchFileContent(file.download_url);
          return { ...file, content };
        }
        return file;
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        owner,
        repo,
        totalFiles: fileContents.length,
        files: fileContents,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
