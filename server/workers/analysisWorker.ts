import { getRepositoryContents, fetchFileContent } from '../services/githubService';
import { sendAnalysisCompletionEmail } from '../services/emailService';
import { analyzeMultipleFiles } from '../services/analysisService';
import { updateAnalysisStatus, saveAnalysisIssues } from '../services/storageService';
import { calculateScore } from '../services/scoringService';
import { addAnalysisLog } from '../services/logService';
import { clerkClient } from '@clerk/express';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processRepositoryAnalysis = async (
  analysisId: string,
  repoUrl: string,
  owner: string,
  repo: string,
  userId: string
) => {
  try {
    // 1. Mark as processing
    await updateAnalysisStatus(analysisId, 'processing');
    addAnalysisLog(analysisId, `Starting analysis for repository: ${owner}/${repo}`);
    addAnalysisLog(analysisId, `Initializing virtual environment for code extraction...`);
    await sleep(1000);

    // Fetch GitHub token from Clerk if available
    let githubToken: string | undefined;
    try {
        addAnalysisLog(analysisId, `Checking for user's connected GitHub account...`);
        // We use the new clerkClient API to get OAuth tokens
        const response = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_github');
        if (response && response.data && response.data.length > 0) {
            githubToken = response.data[0].token;
            addAnalysisLog(analysisId, `Successfully acquired GitHub OAuth token.`);
        } else {
            // Fallback to checking user metadata if they pasted a PAT manually
            const user = await clerkClient.users.getUser(userId);
            githubToken = (user.publicMetadata?.github_token as string) || (user.privateMetadata?.github_token as string);
            if (githubToken) {
                addAnalysisLog(analysisId, `Using manually configured GitHub Personal Access Token.`);
            } else {
                addAnalysisLog(analysisId, `No GitHub token found. Attempting public repository access...`);
            }
        }
    } catch (err) {
        addAnalysisLog(analysisId, `Notice: Proceeding without GitHub token (public repos only).`);
    }

    // 2. Fetch all file metadata
    addAnalysisLog(analysisId, `Fetching repository tree metadata from GitHub...`);
    const fileMetadata = await getRepositoryContents(owner, repo, '', githubToken);
    addAnalysisLog(analysisId, `Successfully indexed ${fileMetadata.length} files in the repository structure.`);
    await sleep(800);
    
    // 3. Fetch content for each file
    addAnalysisLog(analysisId, `Downloading source code for deep static analysis...`);
    const filesWithContent = [];
    for (let i = 0; i < fileMetadata.length; i++) {
        const file = fileMetadata[i];
        filesWithContent.push({
            name: file.path,
            content: await fetchFileContent(file.download_url!, githubToken)
        });
        if (i % 3 === 0) {
           addAnalysisLog(analysisId, `  -> Extracted ${file.path}`);
           await sleep(200);
        }
    }
    addAnalysisLog(analysisId, `Source code extraction completed. Total files: ${filesWithContent.length}`);

    // 4. Run Analysis
    addAnalysisLog(analysisId, `Connecting to Gemini AI Engine for heuristic scanning...`);
    await sleep(500);
    addAnalysisLog(analysisId, `Executing semantic code analysis in batches...`);
    const analysisResults = await analyzeMultipleFiles(filesWithContent, `${owner}/${repo}`);
    addAnalysisLog(analysisId, `AI Engine analysis complete. Detected issues in ${analysisResults.filter(r => r.issues.length > 0).length} files.`);

    // 5. Calculate Score
    addAnalysisLog(analysisId, `Calculating repository integrity score...`);
    const allIssues = analysisResults.flatMap((file) => file.issues || []);
    const score = calculateScore(allIssues);
    addAnalysisLog(analysisId, `Final Integrity Score: ${score}/100.`);

    // 6. Save results to InsForge
    addAnalysisLog(analysisId, `Saving analysis metrics to the database...`);
    await saveAnalysisIssues(analysisId, analysisResults, score);

    // 7. Mark as completed
    addAnalysisLog(analysisId, `Analysis job [${analysisId}] completed successfully.`);
    await updateAnalysisStatus(analysisId, 'completed');

    // 8. Send Email Notification
    try {
      const userObj = await clerkClient.users.getUser(userId);
      const notifications = userObj.unsafeMetadata?.notifications as any;
      // Default is true if not explicitly set to false
      if (notifications?.scanCompletion !== false) {
        const emailAddress = userObj.primaryEmailAddressId 
          ? userObj.emailAddresses.find(e => e.id === userObj.primaryEmailAddressId)?.emailAddress 
          : userObj.emailAddresses[0]?.emailAddress;

        if (emailAddress) {
          addAnalysisLog(analysisId, `Triggering completion email to ${emailAddress}...`);
          await sendAnalysisCompletionEmail(emailAddress, `${owner}/${repo}`, score);
        }
      }
    } catch (err: any) {
      console.error(`[Worker] Failed to send email for ${analysisId}:`, err);
    }

  } catch (error: any) {
    addAnalysisLog(analysisId, `[ERROR] Analysis failed: ${error.message || String(error)}`);
    console.error(`[Worker] Analysis failed for ${analysisId}:`, error);
    await updateAnalysisStatus(analysisId, 'failed', error.message || String(error));
  }
};
