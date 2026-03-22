import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Github, Plus, Search, ExternalLink, Calendar, Code2, ArrowUpRight, CheckCircle2, Star, AlertTriangle, GitPullRequest, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Repository } from '../mock/data';
import { fetchRepositories, fetchDashboardStats, fetchRecentActivity, DashboardStats, ActivityItem } from '../lib/dashboardService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const STATS_ICONS: Record<string, any> = {
  'Total Analyses': Code2,
  'Average Score': Star,
  'Issues Resolved': CheckCircle2,
};

export const DashboardPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reposData, statsData, activityData] = await Promise.all([
          fetchRepositories(),
          fetchDashboardStats(),
          fetchRecentActivity(),
        ]);
        setRepositories(reposData);
        setStats(statsData);
        setActivities(activityData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAnalyze = () => {
    if (!repoUrl) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate('/analysis/1');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gh-blue" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gh-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gh-text mb-1">Repositories</h1>
          <p className="text-gh-muted text-sm">You have {repositories.length} active repositories under analysis.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="gap-2">
            <Github className="w-4 h-4" />
            Import
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Repo List */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Find a repository..." 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="bg-gh-bg border-gh-border h-8 text-sm"
              />
            </div>
            <Button size="sm" onClick={handleAnalyze} isLoading={isAnalyzing}>
              Analyze
            </Button>
          </div>

          <div className="space-y-0 border-t border-gh-border">
            {repositories.map((repo) => (
              <div 
                key={repo.id}
                className="py-6 border-b border-gh-border flex items-start justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 
                      className="text-xl font-semibold text-gh-blue hover:underline cursor-pointer"
                      onClick={() => navigate(`/analysis/${repo.id}`)}
                    >
                      {repo.name}
                    </h3>
                    <Badge variant="neutral" className="lowercase text-[10px] px-1.5 py-0">Public</Badge>
                  </div>
                  <p className="text-sm text-gh-muted max-w-xl">
                    AI-powered analysis of {repo.name.split('/')[1]} codebase for bugs, security, and quality.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gh-muted pt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gh-blue" />
                      {repo.language}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      {repo.score} score
                    </div>
                    <div className="flex items-center gap-1">
                      <GitPullRequest className="w-3.5 h-3.5" />
                      12 PRs
                    </div>
                    <div>
                      Updated {repo.lastAnalyzed}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="h-7 px-3 text-xs font-semibold bg-gh-header hover:bg-gh-bg">
                    <Star className="w-3.5 h-3.5 mr-1.5 text-gh-muted" />
                    Star
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Stats/Activity */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="gh-box">
            <div className="gh-box-header">Analysis Stats</div>
            <div className="p-4 space-y-4">
              {stats.map((stat) => {
                const Icon = STATS_ICONS[stat.label] || Code2;
                return (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-4 h-4", stat.color)} />
                      <span className="text-sm text-gh-text">{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gh-text">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="gh-box">
            <div className="gh-box-header">Recent Activity</div>
            <div className="p-4 space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-gh-muted">No recent activity found.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gh-muted/20 flex items-center justify-center shrink-0">
                      {activity.type === 'analysis-completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-gh-green" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-gh-orange" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gh-text">
                        <span className="font-bold">
                          {activity.type === 'analysis-completed' ? 'Analysis completed' : activity.description}
                        </span> for {activity.repoName}
                      </p>
                      <p className="text-[10px] text-gh-muted mt-0.5">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
