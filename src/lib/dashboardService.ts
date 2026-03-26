import { createClient } from '@insforge/sdk';

export interface Repository {
  id: string;
  name: string;
  language: string;
  score: number;
  lastAnalyzed: string;
  status: 'good' | 'needs-improvement' | 'critical';
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

  // Fetch repositories joined with latest analysis
  const { data: repos, error: repoError } = await client.database
    .from('repositories')
    .select('*, analyses(status, score, created_at)')
    .order('created_at', { ascending: false });

  if (repoError) {
    console.error('Failed to fetch repositories:', repoError);
    return [];
  }

  return (repos || []).map((r: any) => {
    // Get the most recent analysis
    const latestAnalysis = r.analyses?.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    const score = latestAnalysis?.score ?? 0;
    const status = score >= 80 ? 'good' : score >= 60 ? 'needs-improvement' : 'critical';

    return {
      id: r.id,
      name: `${r.owner}/${r.repo_name}`,
      language: 'TypeScript', // Would ideally fetch from repo metadata
      score: score,
      lastAnalyzed: latestAnalysis ? new Date(latestAnalysis.created_at).toLocaleDateString() : 'Never',
      status: latestAnalysis?.status === 'completed' ? status : (latestAnalysis?.status === 'failed' ? 'critical' : 'needs-improvement')
    };
  });
};

export const fetchDashboardStats = async (): Promise<DashboardStats[]> => {
  const client = getClient();
  if (!client) return [];

  const [reposResult, analysesResult, issuesResult] = await Promise.all([
    client.database.from('repositories').select('id', { count: 'exact', head: true }),
    client.database.from('analyses').select('score, status'),
    client.database.from('issues').select('id', { count: 'exact', head: true })
  ]);

  const totalRepos = reposResult.count || 0;
  const analyses = analysesResult.data || [];
  const completedAnalyses = analyses.filter((a: any) => a.status === 'completed');
  const avgScore = completedAnalyses.length > 0 
    ? Math.round(completedAnalyses.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / completedAnalyses.length)
    : 0;

  return [
    { label: 'Total Analyses', value: completedAnalyses.length.toString(), color: 'text-gh-blue' },
    { label: 'Average Score', value: avgScore.toString(), color: 'text-gh-orange' },
    { label: 'Issues Detected', value: (issuesResult.count || 0).toString(), color: 'text-gh-green' },
  ];
};

export const fetchRecentActivity = async (): Promise<ActivityItem[]> => {
  const client = getClient();
  if (!client) return [];

  // Fetch last 10 analyses with repo info
  const { data: analyses, error } = await client.database
    .from('analyses')
    .select('id, status, created_at, repositories(repo_name, owner)')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return [];

  return (analyses || []).map((a: any) => ({
    id: a.id,
    type: a.status === 'completed' ? 'analysis-completed' : 'new-issues',
    repoName: a.repositories ? `${a.repositories.owner}/${a.repositories.repo_name}` : 'Unknown Repo',
    timestamp: formatRelativeTime(new Date(a.created_at)),
    description: a.status === 'failed' ? 'Analysis failed' : undefined
  }));
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
}
