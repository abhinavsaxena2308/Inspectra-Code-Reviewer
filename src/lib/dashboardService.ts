// Mock Dashboard Service (InsForge removed)

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

export const fetchRepositories = async (): Promise<Repository[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: '1',
      name: 'facebook/react',
      language: 'TypeScript',
      score: 92,
      lastAnalyzed: new Date().toLocaleDateString(),
      status: 'good'
    },
    {
      id: '2',
      name: 'vercel/next.js',
      language: 'JavaScript',
      score: 78,
      lastAnalyzed: new Date().toLocaleDateString(),
      status: 'needs-improvement'
    }
  ];
};

export const fetchDashboardStats = async (): Promise<DashboardStats[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { label: 'Total Analyses', value: '12', color: 'text-gh-blue' },
    { label: 'Average Score', value: '85', color: 'text-gh-orange' },
    { label: 'Issues Detected', value: '43', color: 'text-gh-green' },
  ];
};

export const fetchRecentActivity = async (): Promise<ActivityItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      id: 'a1',
      type: 'analysis-completed',
      repoName: 'facebook/react',
      timestamp: '2h ago',
    },
    {
      id: 'a2',
      type: 'new-issues',
      repoName: 'vercel/next.js',
      timestamp: '5h ago',
      description: '3 security vulnerabilities found'
    }
  ];
};

export const fetchHistoryStats = async (): Promise<HistoryStat[]> => {
  return [
    {
      label: 'Total Runs',
      value: '48',
      subtext: 'Current workspace',
      trend: 'neutral',
      colorClass: 'bg-primary'
    },
    {
      label: 'Success Rate',
      value: '94.2%',
      subtext: 'Optimal Performance',
      trend: 'up',
      colorClass: 'bg-secondary'
    },
    {
      label: 'Avg Health Score',
      value: '82',
      subtext: 'Stable',
      trend: 'neutral',
      colorClass: 'bg-tertiary'
    }
  ];
};

export const fetchHistoryList = async (): Promise<HistoryListRow[]> => {
  return [
    {
      id: 'h1',
      repoName: 'Inspectra',
      commitHash: '7a2b5c1',
      date: 'Oct 24, 2023',
      time: '14:30 UTC',
      status: 'completed',
      score: 88
    },
    {
      id: 'h2',
      repoName: 'Inspectra',
      commitHash: '3f9e2d1',
      date: 'Oct 23, 2023',
      time: '09:15 UTC',
      status: 'completed',
      score: 82
    }
  ];
};
