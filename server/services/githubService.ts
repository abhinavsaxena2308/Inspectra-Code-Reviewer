import axios from 'axios';
import { Octokit } from '@octokit/rest';
import { config } from '../config';

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  download_url?: string;
}

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = config.githubToken;

const IGNORED_DIRS = ['.git', 'node_modules', 'dist', 'build', 'vendor', '.next', '.cache'];
const SUPPORTED_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx', '.py', '.go', '.java', '.c', '.cpp', '.h', '.cs', '.rs', '.php', '.rb', '.sh', '.md', '.json', '.html', '.css'];

export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com' && parsedUrl.hostname !== 'www.github.com') {
      return null;
    }
    const parts = parsedUrl.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, ''),
    };
  } catch (err) {
    return null; // Invalid URL
  }
};

export const getGitHubRepositories = async (token: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=100`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Inspectra-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('[GitHubService] Failed to fetch repositories:', error.message);
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
};

export const getRepositoryContents = async (owner: string, repo: string, path: string = '', userToken?: string): Promise<GitHubFile[]> => {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  const activeToken = userToken || GITHUB_TOKEN;
  const headers: any = {
    'User-Agent': 'Inspectra-App',
    ...(activeToken ? { Authorization: `token ${activeToken}` } : {}),
  };

  try {
    const response = await axios.get(url, { headers });
    const items = response.data;
    let files: GitHubFile[] = [];

    for (const item of items) {
      if (item.type === 'dir' && !IGNORED_DIRS.includes(item.name)) {
        const subFiles = await getRepositoryContents(owner, repo, item.path, userToken);
        files = [...files, ...subFiles];
      } else if (item.type === 'file') {
        const parts = item.name.split('.');
        const ext = parts.length > 1 ? `.${parts.pop()}` : '';
        if (SUPPORTED_EXTENSIONS.includes(ext.toLowerCase()) || item.name.toLowerCase() === 'readme' || item.name.toLowerCase() === 'license') {
          files.push({
            name: item.name,
            path: item.path,
            type: 'file',
            download_url: item.download_url,
          });
        }
      }
    }
    console.log(`[GitHubService] Found ${files.length} files in ${owner}/${repo}`);
    return files;
  } catch (error: any) {
    throw new Error(`Failed to fetch contents from GitHub: ${error.message}`);
  }
};

export const fetchFileContent = async (downloadUrl: string, userToken?: string): Promise<string> => {
  try {
    const activeToken = userToken || GITHUB_TOKEN;
    const response = await axios.get(downloadUrl, {
      headers: { 
        'User-Agent': 'Inspectra-App',
        ...(activeToken ? { Authorization: `token ${activeToken}` } : {}),
      }
    });
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
  } catch (error: any) {
    throw new Error(`Failed to fetch file content: ${error.message}`);
  }
};

export const createFixPullRequest = async (
  owner: string,
  repo: string,
  filePath: string,
  newContent: string,
  issueDescription: string,
  userToken?: string
): Promise<string> => {
  const activeToken = userToken || GITHUB_TOKEN;
  if (!activeToken) throw new Error('No GitHub token provided');

  const octokit = new Octokit({ auth: activeToken });

  try {
    // 1. Get default branch (e.g. main or master)
    const repoInfo = await octokit.repos.get({ owner, repo });
    const defaultBranch = repoInfo.data.default_branch;

    // 2. Get the latest commit SHA on the default branch
    const refInfo = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const baseSha = refInfo.data.object.sha;

    // 3. Create a new branch
    const branchName = `inspectra-fix-${Date.now()}`;
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    // 4. Create a blob with the new file content
    const blobData = await octokit.git.createBlob({
      owner,
      repo,
      content: newContent,
      encoding: 'utf-8',
    });

    // 5. Create a new tree
    const treeData = await octokit.git.createTree({
      owner,
      repo,
      base_tree: baseSha,
      tree: [
        {
          path: filePath,
          mode: '100644',
          type: 'blob',
          sha: blobData.data.sha,
        },
      ],
    });

    // 6. Create a commit
    const commitData = await octokit.git.createCommit({
      owner,
      repo,
      message: `Fix: ${issueDescription.substring(0, 50)}...\n\nAutomated fix generated by Inspectra AI.`,
      tree: treeData.data.sha,
      parents: [baseSha],
    });

    // 7. Update the branch reference
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branchName}`,
      sha: commitData.data.sha,
    });

    // 8. Create a Pull Request
    const prData = await octokit.pulls.create({
      owner,
      repo,
      title: `Auto-Fix: ${issueDescription.substring(0, 60)}`,
      body: `This is an automated pull request created by **Inspectra AI**.\n\n### Issue Addressed\n${issueDescription}\n\n### Changes\nApplied AI-generated fix to \`${filePath}\`. Please review the changes before merging.`,
      head: branchName,
      base: defaultBranch,
    });

    return prData.data.html_url;

  } catch (error: any) {
    console.error('[GitHubService] Failed to create PR:', error.message);
    throw new Error(`Failed to create pull request: ${error.message}`);
  }
};
