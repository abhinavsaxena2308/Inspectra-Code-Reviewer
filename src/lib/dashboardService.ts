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

export interface HistoryStat {
  label: string;
  value: string;
  subtext: string;
  trend: 'up' | 'down' | 'neutral';
  colorClass: string;
}

export interface HistoryListRow {
  id: string;
  repoName: string;
  commitHash: string;
  date: string;
  time: string;
  status: 'completed' | 'failed' | 'running';
  score: number | null;
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
    if (analysisError && (analysisError.code === '42703' || analysisError.message.includes('score'))) {
        console.warn('Dashboard: "score" column missing in analyses table, using fallback.');
        const { data: fallbackAnalyses, error: fallbackError } = await client.database
            .from('analyses')
            .select('repo_id, status, created_at')
            .in('repo_id', repoIds)
            .order('created_at', { ascending: false });
        if (fallbackError) throw fallbackError;
        finalAnalyses = (fallbackAnalyses || []).map(a => ({ ...a, score: 0 }));
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
    if (analysesResult.error && (analysesResult.error.code === '42703' || analysesResult.error.message.includes('score'))) {
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

export const fetchHistoryStats = async (): Promise<HistoryStat[]> => {
  const client = getClient();
  if (!client) return [];
  try {
    const { data: analysesResult, error } = await client.database.from('analyses').select('status, score').catch(() => ({ data: [], error: { message: 'fallback' } }));
    
    let analyses = Array.isArray(analysesResult) ? analysesResult : [];
    if (error && (error.code === '42703' || error.message.includes('score'))) {
       const { data } = await client.database.from('analyses').select('status');
       analyses = (data || []).map(a => ({ ...a, score: 0 }));
    }

    const totalRuns = analyses.length;
    let completedRuns = 0;
    let totalScore = 0;
    let scoredRuns = 0;

    analyses.forEach((a: any) => {
      if (a.status === 'completed') completedRuns++;
      if (typeof a.score === 'number' && a.status === 'completed') {
        totalScore += a.score;
        scoredRuns++;
      }
    });

    const successRate = totalRuns > 0 ? ((completedRuns / totalRuns) * 100).toFixed(1) : '0.0';
    const avgScore = scoredRuns > 0 ? Math.round(totalScore / scoredRuns) : 0;

    return [
      {
        label: 'Total Runs',
        value: totalRuns.toLocaleString(),
        subtext: 'Current workspace',
        trend: 'neutral',
        colorClass: 'bg-primary'
      },
      {
        label: 'Success Rate',
        value: `${successRate}%`,
        subtext: 'Optimal Performance',
        trend: 'up',
        colorClass: 'bg-secondary'
      },
      {
        label: 'Avg Health Score',
        value: avgScore.toString(),
        subtext: avgScore < 70 ? 'Warning: Low' : 'Stable',
        trend: avgScore < 70 ? 'down' : 'neutral',
        colorClass: 'bg-tertiary'
      }
    ];

  } catch (err) {
    console.error('Failed to fetch history stats:', err);
    return [];
  }
};

export const fetchHistoryList = async (): Promise<HistoryListRow[]> => {
  const client = getClient();
  if (!client) return [];
  try {
    const { data: analyses, error } = await client.database
      .from('analyses')
      .select('id, status, created_at, score, repositories(repo_name, owner)')
      .order('created_at', { ascending: false });
    
    let finalAnalyses = analyses;
    if (error && error.message.includes('column "score" does not exist')) {
        const { data: fallbackAnalyses } = await client.database
            .from('analyses')
            .select('id, status, created_at, repositories(repo_name, owner)')
            .order('created_at', { ascending: false });
        finalAnalyses = fallbackAnalyses?.map(a => ({ ...a, score: 0 }));
    } else if (error) {
        throw error;
    }

    return (finalAnalyses || []).map((a: any) => {
      const dateObj = new Date(a.created_at);
      const repoNameStr = a.repositories ? `${a.repositories.repo_name}` : 'Unknown';
      // Generate a deterministic pseudo-commit hash based on ID
      const shortHex = a.id ? a.id.replace(/-/g, '').substring(0, 7) : '0000000';
      return {
        id: a.id,
        repoName: repoNameStr,
        commitHash: shortHex,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: dateObj.toLocaleTimeString('en-US', { hour12: false, timeZoneName: 'short' }),
        status: a.status === 'completed' ? 'completed' : a.status === 'failed' ? 'failed' : 'running',
        score: a.score ?? null
      };
    });

  } catch (err) {
    console.error('Failed to fetch history list:', err);
    return [];
  }
};
