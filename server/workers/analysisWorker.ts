import { getRepositoryContents, fetchFileContent } from '../services/githubService';
import { analyzeMultipleFiles } from '../services/analysisService';
import { updateAnalysisStatus, saveAnalysisIssues } from '../services/storageService';
import { calculateScore } from '../services/scoringService';

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
    console.log(`[Worker] ${analysisId} - Found ${fileMetadata.length} files to analyze.`);
    
    // 3. Fetch content for each file
    const filesWithContent = await Promise.all(
        fileMetadata.map(async (file) => ({
            name: file.path, // Use path instead of name for better identification
            content: await fetchFileContent(file.download_url!)
        }))
    );

    // 4. Run Analysis
    console.log(`[Worker] ${analysisId} - Starting analysis for ${filesWithContent.length} files.`);
    const analysisResults = await analyzeMultipleFiles(filesWithContent, `${owner}/${repo}`);
    console.log(`[Worker] ${analysisId} - Analysis complete. Issues found in ${analysisResults.filter(r => r.issues.length > 0).length} files.`);

    // 5. Calculate Score
    const allIssues = analysisResults.flatMap((file) => file.issues || []);
    const score = calculateScore(allIssues);

    // 6. Save results to InsForge
    await saveAnalysisIssues(analysisId, analysisResults, score);

    // 7. Mark as completed
    await updateAnalysisStatus(analysisId, 'completed');

  } catch (error: any) {
    console.error(`[Worker] Analysis failed for ${analysisId}:`, error);
    await updateAnalysisStatus(analysisId, 'failed', error.message || String(error));
  }
};
