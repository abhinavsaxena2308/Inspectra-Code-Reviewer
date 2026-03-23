import axios from 'axios';
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

export const getRepositoryContents = async (owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> => {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  const headers: any = {
    'User-Agent': 'Inspectra-App',
    ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
  };

  try {
    const response = await axios.get(url, { headers });
    const items = response.data;
    let files: GitHubFile[] = [];

    for (const item of items) {
      if (item.type === 'dir' && !IGNORED_DIRS.includes(item.name)) {
        const subFiles = await getRepositoryContents(owner, repo, item.path);
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
    return files;
  } catch (error: any) {
    throw new Error(`Failed to fetch contents from GitHub: ${error.message}`);
  }
};

export const fetchFileContent = async (downloadUrl: string): Promise<string> => {
  try {
    const response = await axios.get(downloadUrl, {
      headers: { 'User-Agent': 'Inspectra-App' }
    });
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
  } catch (error: any) {
    throw new Error(`Failed to fetch file content: ${error.message}`);
  }
};
