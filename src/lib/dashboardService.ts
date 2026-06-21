import axios from 'axios';

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

export const fetchRepositories = async (token: string): Promise<Repository[]> => {
  const response = await axios.get('/api/repositories', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const fetchDashboardStats = async (token: string): Promise<DashboardStats[]> => {
  const response = await axios.get('/api/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const fetchRecentActivity = async (token: string): Promise<ActivityItem[]> => {
  const response = await axios.get('/api/activity', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

// We will mock history stats for now, or you can implement an endpoint later
export const fetchHistoryStats = async (token: string): Promise<HistoryStat[]> => {
  return [
    {
      label: 'Total Runs',
      value: '-',
      subtext: 'Current workspace',
      trend: 'neutral',
      colorClass: 'bg-primary'
    },
    {
      label: 'Success Rate',
      value: '-',
      subtext: 'Optimal Performance',
      trend: 'up',
      colorClass: 'bg-secondary'
    },
    {
      label: 'Avg Health Score',
      value: '-',
      subtext: 'Stable',
      trend: 'neutral',
      colorClass: 'bg-tertiary'
    }
  ];
};

export const fetchHistoryList = async (token: string): Promise<HistoryListRow[]> => {
  return [];
};
