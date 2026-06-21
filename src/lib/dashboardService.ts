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

export const fetchHistoryStats = async (token: string): Promise<HistoryStat[]> => {
  try {
    const response = await axios.get('/api/history/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { totalRuns, successRate, avgScore } = response.data.data;
    
    return [
      {
        label: 'Total Runs',
        value: totalRuns.toString(),
        subtext: 'Current workspace',
        trend: 'neutral',
        colorClass: 'bg-primary'
      },
      {
        label: 'Success Rate',
        value: `${successRate}%`,
        subtext: 'Optimal Performance',
        trend: successRate >= 90 ? 'up' : 'down',
        colorClass: 'bg-secondary'
      },
      {
        label: 'Avg Health Score',
        value: avgScore.toString(),
        subtext: 'Stable',
        trend: 'neutral',
        colorClass: 'bg-tertiary'
      }
    ];
  } catch (error) {
    console.error('Failed to fetch history stats:', error);
    return [];
  }
};

export const fetchHistoryList = async (token: string): Promise<HistoryListRow[]> => {
  try {
    const response = await axios.get('/api/history/list', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.data.map((row: any) => {
      const dateObj = new Date(row.created_at);
      return {
        id: row.id,
        repoName: `${row.owner}/${row.repo_name}`,
        commitHash: 'HEAD', // Mocked or not stored yet
        date: dateObj.toLocaleDateString(),
        time: dateObj.toLocaleTimeString(),
        status: row.status,
        score: row.score
      };
    });
  } catch (error) {
    console.error('Failed to fetch history list:', error);
    return [];
  }
};
