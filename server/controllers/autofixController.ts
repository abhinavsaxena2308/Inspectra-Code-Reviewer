import { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import { parseRepoUrl, createFixPullRequest } from '../services/githubService';
import { chatWithOllama } from '../services/ollamaService';
import { Octokit } from '@octokit/rest';

export const autoFixIssueController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const { repoUrl, filePath, issueDescription } = req.body;
    if (!repoUrl || !filePath || !issueDescription) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const repoDetails = parseRepoUrl(repoUrl);
    if (!repoDetails) return res.status(400).json({ status: 'error', message: 'Invalid repo URL' });
    const { owner, repo } = repoDetails;

    // Get GitHub token
    let githubToken: string | undefined;
    try {
      const response = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_github');
      if (response && response.data && response.data.length > 0) {
        githubToken = response.data[0].token;
      } else {
        const user = await clerkClient.users.getUser(userId);
        githubToken = (user.publicMetadata?.github_token as string) || (user.privateMetadata?.github_token as string);
      }
    } catch (e) {
      console.log('Failed to fetch github token', e);
    }

    if (!githubToken) {
      return res.status(403).json({ status: 'error', message: 'GitHub token required to auto-fix' });
    }

    const octokit = new Octokit({ auth: githubToken });

    // Fetch the original file content
    let originalContent = '';
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
      });
      if ('content' in data) {
        originalContent = Buffer.from(data.content, 'base64').toString('utf-8');
      } else {
        throw new Error('File not found or is a directory');
      }
    } catch (e: any) {
      return res.status(404).json({ status: 'error', message: 'Failed to fetch original file: ' + e.message });
    }

    // AI Generation
    const prompt = `You are an expert AI software engineer. You are provided with a file from a repository and a description of an issue found in this file.
Your task is to FIX the issue and return the completely patched file. 

CRITICAL RULES:
1. ONLY return the modified code. Do not include any explanations, markdown code fences (like \`\`\`javascript), or pleasantries.
2. Return the ENTIRE file with your fix applied, so it can drop-in replace the original.
3. Preserve all existing indentation, comments, and structure that are unrelated to the fix.

Issue Description:
${issueDescription}

Original File Content:
${originalContent}
`;

    console.log('[AutoFix] Requesting AI fix for', filePath);
    let patchedContent = await chatWithOllama(prompt);

    // Sanitize the LLM output (remove potential markdown wrappers)
    patchedContent = patchedContent.replace(/^```[a-z]*\n/i, '').replace(/```$/i, '').trim();

    // Create the PR
    console.log('[AutoFix] Creating PR for', filePath);
    const prUrl = await createFixPullRequest(
      owner,
      repo,
      filePath,
      patchedContent,
      issueDescription,
      githubToken
    );

    res.json({
      status: 'success',
      data: {
        prUrl
      }
    });

  } catch (error: any) {
    console.error('[AutoFix] Error:', error);
    next(error);
  }
};
