import { MOCK_REPOS, Repository } from '../mock/data';

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

export const fetchRepositories = async (): Promise<Repository[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_REPOS;
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
