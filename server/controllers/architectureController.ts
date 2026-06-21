import { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import { getRepositoryContents, fetchFileContent } from '../services/githubService';

const TARGET_FILES = [
  'package.json',
  'docker-compose.yml',
  'docker-compose.yaml',
  'Dockerfile',
  'server.ts',
  'server.js',
  'app.ts',
  'app.js',
  'main.ts',
  'main.js',
  'tsconfig.json',
  'requirements.txt',
  'pom.xml'
];

export const analyzeArchitectureController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuth(req).userId;
    if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ status: 'error', message: 'repoUrl is required' });

    // Parse repo URL
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    if (urlParts.length < 2) return res.status(400).json({ status: 'error', message: 'Invalid repository URL' });
    const owner = urlParts[0];
    const repo = urlParts[1].replace('.git', '');

    // Get GitHub token if available
    let githubToken: string | undefined;
    try {
      const response = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_github');
      if (response && response.data && response.data.length > 0) {
        githubToken = response.data[0].token;
      } else {
        const user = await clerkClient.users.getUser(userId);
        githubToken = (user.publicMetadata?.github_token as string) || (user.privateMetadata?.github_token as string);
      }
    } catch (e) {}

    // Fetch repository tree
    const fileMetadata = await getRepositoryContents(owner, repo, '', githubToken);
    
    // Filter for architecture-relevant files
    const configFiles = fileMetadata.filter(f => TARGET_FILES.includes(f.name.toLowerCase()));
    
    if (configFiles.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No infrastructure or configuration files found to analyze.' });
    }

    // Fetch content
    const contents = [];
    for (const file of configFiles) {
      const content = await fetchFileContent(file.download_url!, githubToken);
      contents.push(`\n--- FILE: ${file.path} ---\n${content}\n`);
    }

    const allContext = contents.join('\n');

    const prompt = `You are an expert Software Architect and Security Specialist.

I am providing you with the core configuration, infrastructure, and entrypoint files for a software repository.
Your task is to:
1. Understand the high-level architecture (services, databases, frameworks, ports).
2. Generate a valid Mermaid.js graph TD flowchart that maps out these components and how they interact. Enclose the mermaid code strictly in \`\`\`mermaid ... \`\`\` block.
3. Below the diagram, provide a "Threat Model & Architecture Report" in Markdown format, detailing potential macro-level security risks (e.g. exposed ports, missing rate limiting, vulnerable architecture patterns).

Here are the files:
${allContext}

Provide the response with the Mermaid diagram first, followed by the Markdown report.`;

    const { chatWithOllama } = await import('../services/ollamaService');
    const responseText = await chatWithOllama(prompt);

    // Extract Mermaid block and Markdown content
    let mermaidCode = '';
    let report = responseText;

    const mermaidMatch = responseText.match(/```mermaid\n([\s\S]*?)```/);
    if (mermaidMatch) {
      mermaidCode = mermaidMatch[1].trim();
      report = responseText.replace(mermaidMatch[0], '').trim();
    }

    res.json({
      status: 'success',
      data: {
        mermaid: mermaidCode,
        report: report
      }
    });

  } catch (error) {
    next(error);
  }
};
