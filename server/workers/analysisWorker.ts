import { getRepositoryContents, fetchFileContent } from '../services/githubService';
import { analyzeMultipleFiles } from '../services/analysisService';
import { updateAnalysisStatus, saveAnalysisIssues } from '../services/storageService';

export const processRepositoryAnalysis = async (
  analysisId: string,
  repoUrl: string,
  owner: string,
  repo: string
) => {
  try {
    // 1. Mark as processing
    await updateAnalysisStatus(analysisId, 'processing');

    // 2. Fetch all file metadata
    const fileMetadata = await getRepositoryContents(owner, repo);
    
    // 3. Fetch content for each file
    const filesWithContent = await Promise.all(
        fileMetadata.map(async (file) => ({
            name: file.name,
            content: await fetchFileContent(file.download_url!)
        }))
    );

    // 4. Run Analysis
    const analysisResults = await analyzeMultipleFiles(filesWithContent);

    // 5. Calculate Score
    let score = 100;
    analysisResults.forEach((file: any) => {
      file.issues?.forEach((issue: any) => {
        if (issue.type === 'bug') score -= 10;
        else if (issue.type === 'security') score -= 20;
        else if (issue.type === 'performance') score -= 5;
        else if (issue.type === 'suggestion') score -= 2;
      });
    });
    score = Math.max(0, score);

    // 6. Save results to InsForge
    await saveAnalysisIssues(analysisId, analysisResults, score);

    // 7. Mark as completed
    await updateAnalysisStatus(analysisId, 'completed');

  } catch (error: any) {
    console.error(`[Worker] Analysis failed for ${analysisId}:`, error);
    await updateAnalysisStatus(analysisId, 'failed', error.message || String(error));
  }
};
