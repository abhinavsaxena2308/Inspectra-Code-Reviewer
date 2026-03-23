import { createClient } from '@insforge/sdk';

export interface Repository {
  id: string;
  name: string;
  language: string;
  score: number;
  lastAnalyzed: string;
}

export interface DashboardStats {
  label: string;
  value: string;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'analysis-completed' | 'new-issues';
  repoName: string;
  timestamp: string;
  description?: string;
}

let _client: any = null;
const getClient = () => {
  if (_client) return _client;
  const url = (import.meta as any).env.VITE_INSFORGE_URL;
  const key = (import.meta as any).env.VITE_INSFORGE_ANON_KEY;
  if (!url || !key) return null;
  _client = createClient({ baseUrl: url, anonKey: key });
  return _client;
};

export const fetchRepositories = async (): Promise<Repository[]> => {
  const client = getClient();
  if (!client) return [];

  const { data, error } = await client.database
    .from('repositories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch repositories:', error);
    return [];
  }

  // Map backend names to match frontend Repository interface if needed
  return (data || []).map((r: any) => ({
    id: r.id,
    name: `${r.owner}/${r.repo_name}`,
    language: 'TypeScript', // Default or fetch from tags later
    score: 0, // Will be updated by analysis
    lastAnalyzed: new Date(r.created_at).toLocaleDateString()
  }));
};

export const fetchDashboardStats = async (): Promise<DashboardStats[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { label: 'Total Analyses', value: '24', color: 'text-gh-blue' },
    { label: 'Average Score', value: '84', color: 'text-gh-orange' },
    { label: 'Issues Resolved', value: '142', color: 'text-gh-green' },
  ];
};

export const fetchRecentActivity = async (): Promise<ActivityItem[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      id: 'a1',
      type: 'analysis-completed',
      repoName: 'facebook/react',
      timestamp: '2 hours ago',
    },
    {
      id: 'a2',
      type: 'new-issues',
      repoName: 'vercel/next.js',
      timestamp: '1 day ago',
      description: '2 new issues found',
    },
  ];
};
