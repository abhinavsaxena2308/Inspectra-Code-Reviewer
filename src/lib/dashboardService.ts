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

  try {
    // 1. Fetch repositories
    const { data: repos, error: repoError } = await client.database
      .from('repositories')
      .select('*')
      .order('created_at', { ascending: false });

    if (repoError) throw repoError;

    const repoIds = (repos || []).map((r: any) => r.id);
    if (repoIds.length === 0) return [];

    // 2. Fetch latest analyses for these repos separately to avoid join errors
    // Joining with 'analyses(score, status, created_at)' fails if 'score' column is missing
    const { data: analyses, error: analysisError } = await client.database
      .from('analyses')
      .select('repo_id, status, created_at, score')
      .in('repo_id', repoIds)
      .order('created_at', { ascending: false });

    // Handle error where 'score' column is missing
    let finalAnalyses = analyses;
    if (analysisError && analysisError.message.includes('column "score" does not exist')) {
        const { data: fallbackAnalyses, error: fallbackError } = await client.database
            .from('analyses')
            .select('repo_id, status, created_at')
            .in('repo_id', repoIds)
            .order('created_at', { ascending: false });
        if (fallbackError) throw fallbackError;
        finalAnalyses = fallbackAnalyses?.map(a => ({ ...a, score: 0 }));
    } else if (analysisError) {
        throw analysisError;
    }

    return (repos || []).map((r: any) => {
      // Get the most recent analysis for this repo
      const latestAnalysis = (finalAnalyses || []).find((a: any) => a.repo_id === r.id);

      const score = latestAnalysis?.score ?? 0;
      const status = score >= 80 ? 'good' : score >= 60 ? 'needs-improvement' : 'critical';

      return {
        id: r.id,
        name: `${r.owner}/${r.repo_name}`,
        url: r.repo_url,
        language: 'TypeScript', 
        score: score,
        lastAnalyzed: latestAnalysis ? new Date(latestAnalysis.created_at).toLocaleDateString() : 'Never',
        status: latestAnalysis?.status === 'completed' ? status : (latestAnalysis?.status === 'failed' ? 'critical' : 'needs-improvement')
      };
    });
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    return [];
  }
};

export const fetchDashboardStats = async (): Promise<DashboardStats[]> => {
  const client = getClient();
  if (!client) return [];

  try {
    const [reposResult, analysesResult, issuesResult] = await Promise.all([
      client.database.from('repositories').select('id', { count: 'exact', head: true }),
      client.database.from('analyses').select('score, status').catch(() => ({ data: [], error: { message: 'fallback' } })),
      client.database.from('issues').select('id', { count: 'exact', head: true })
    ]);

    const totalRepos = reposResult.count || 0;
    
    // Robustly handle missing score column in analyses
    let analyses = Array.isArray(analysesResult.data) ? analysesResult.data : [];
    if (analysesResult.error && analysesResult.error.message.includes('column "score" does not exist')) {
       const { data } = await client.database.from('analyses').select('status');
       analyses = (data || []).map(a => ({ ...a, score: 0 }));
    }

    const completedAnalyses = analyses.filter((a: any) => a.status === 'completed');
    const avgScore = completedAnalyses.length > 0 
      ? Math.round(completedAnalyses.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / completedAnalyses.length)
      : 0;

    return [
      { label: 'Total Analyses', value: completedAnalyses.length.toString(), color: 'text-gh-blue' },
      { label: 'Average Score', value: avgScore.toString(), color: 'text-gh-orange' },
      { label: 'Issues Detected', value: (issuesResult.count || 0).toString(), color: 'text-gh-green' },
    ];
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    return [
      { label: 'Total Analyses', value: '—', color: 'text-gh-blue' },
      { label: 'Average Score', value: '—', color: 'text-gh-orange' },
      { label: 'Issues Detected', value: '—', color: 'text-gh-green' },
    ];
  }
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
