import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Github, Plus, Search, ExternalLink, Calendar, Code2, ArrowUpRight, CheckCircle2, Star, AlertTriangle, GitPullRequest, BookOpen, Clock, Activity, FolderOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Repository } from '../mock/data';
import { fetchRepositories, fetchDashboardStats, fetchRecentActivity, DashboardStats, ActivityItem } from '../lib/dashboardService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { analyzeRepository } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';

const STATS_ICONS: Record<string, any> = {
  'Total Analyses': Code2,
  'Average Score': Star,
  'Issues Resolved': CheckCircle2,
};

export const DashboardPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const debouncedFilter = useDebounce(repoUrl, 300);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
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

  const handleAnalyze = async () => {
    if (!repoUrl) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeRepository(repoUrl);
      if (result.status === 'success') {
        navigate(`/analysis/${result.data.id}`);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to start analysis. Check the URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background text-on-surface font-body selection:bg-primary-container/30">
      {/* Left Panel: Explorer / Repositories */}
      <aside className="w-80 bg-surface-container-low flex flex-col border-r border-outline-variant/10">
        <div className="p-4 flex items-center justify-between border-b border-outline-variant/10">
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Repositories</span>
          <FolderOpen className="w-4 h-4 text-on-surface-variant/40" />
        </div>
        
        <div className="p-4 border-b border-outline-variant/10 block bg-surface-container-lowest">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 relative">
              <Input 
                placeholder="Repository URL / name..." 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="bg-surface border-outline-variant/20 h-8 text-xs font-mono pl-8"
              />
              <Search className="w-3.5 h-3.5 text-on-surface-variant/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <Button size="sm" onClick={handleAnalyze} isLoading={isAnalyzing} className="h-8 px-3 text-xs font-bold bg-primary hover:bg-primary-container text-on-primary rounded transition-all">
              Analyze
            </Button>
          </div>
          {error && (
            <div className="p-2 rounded bg-error/10 border border-error/20 text-error text-[10px] font-medium leading-tight mt-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {repositories
            .filter(repo => repo.name.toLowerCase().includes(debouncedFilter.toLowerCase()))
            .map((repo) => (
              <div 
                key={repo.id}
                onClick={() => navigate(`/analysis/${repo.id}`)}
                className="flex flex-col gap-1.5 px-6 py-3 cursor-pointer group hover:bg-surface-container-high transition-colors border-l-2 border-transparent hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-on-surface/90 text-sm font-semibold group-hover:text-primary transition-colors">
                    <Github className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary/80" />
                    <span>{repo.name}</span>
                  </div>
                  {repo.score && (
                    <span className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded font-bold",
                      repo.score >= 80 ? "bg-secondary-container/20 text-secondary" : 
                      repo.score >= 60 ? "bg-tertiary-container/20 text-tertiary-container" : "bg-error/20 text-error"
                    )}>
                      {repo.score}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-on-surface-variant/60 font-mono">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                    {repo.language}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {repo.lastAnalyzed}
                  </div>
                </div>
              </div>
          ))}
          {repositories.length === 0 && (
            <div className="px-6 py-8 text-center text-xs text-on-surface-variant/50">
              No repositories found.
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel: Analysis Overview / Dashboard */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs Area */}
        <div className="bg-surface px-8 flex items-center border-b border-outline-variant/10">
          <nav className="flex gap-8">
            {['Overview', 'Performance', 'Security'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-4 text-sm font-medium transition-colors border-b-2 relative",
                  activeTab === tab 
                    ? "text-primary border-primary" 
                    : "text-on-surface-variant/60 hover:text-on-surface border-transparent"
                )}
              >
                {tab}
                {tab === 'Overview' && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/10 text-[10px] font-mono text-primary">
                    {activities.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-surface-container-lowest p-8 flex flex-col xl:flex-row gap-8">
          
          {/* Main Dashboard Info */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-on-surface mb-2">Workspace Overview</h1>
              <p className="text-sm text-on-surface-variant/80 max-w-2xl leading-relaxed">
                Monitor the health and security of your connected repositories. Inspectra's AI engine is actively analyzing {repositories.length} codebases for vulnerabilities, bugs, and performance bottlenecks.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, idx) => {
                const Icon = STATS_ICONS[stat.label] || Activity;
                return (
                  <div key={idx} className="bg-surface border border-outline-variant/10 p-5 rounded shadow-lg group hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">{stat.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tighter text-on-surface font-mono">{stat.value}</span>
                      {stat.trend && (
                        <span className="text-xs font-bold text-secondary flex items-center">
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Placeholder for Graphic or Map */}
            <div className="bg-surface border border-outline-variant/10 rounded overflow-hidden flex-1 shadow-lg relative min-h-[300px]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-6 relative z-10">Analysis Heatmap</h3>
                <div className="flex-1 border border-outline-variant/10 bg-surface-container-low/50 rounded flex items-center justify-center relative z-10">
                   <div className="text-center space-y-3">
                     <Activity className="w-8 h-8 text-primary/40 mx-auto" />
                     <p className="text-xs font-mono text-on-surface-variant/50">Collecting real-time metrics...</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Activity Feed */}
          <div className="w-full xl:w-96 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60">Recent Feed</h2>
              <button className="text-[10px] font-bold text-on-surface-variant/80 hover:text-on-surface transition-colors flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
                <Calendar className="w-3 h-3" />
                This Week
              </button>
            </div>
            
            <div className="bg-surface border border-outline-variant/10 rounded shadow-lg p-5 space-y-6 flex-1 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-xs text-on-surface-variant/50">No recent activity found.</span>
                </div>
              ) : (
                activities.map((activity, idx) => (
                  <div key={activity.id} className="relative pl-6">
                    {/* Time line connecting dots */}
                    {idx !== activities.length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-[-1.5rem] w-px bg-outline-variant/20" />
                    )}
                    
                    {/* Event Dot */}
                    <div className={cn(
                      "absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface bg-surface shadow-sm",
                      activity.type === 'analysis-completed' ? "text-secondary" : "text-tertiary-container"
                    )}>
                      {activity.type === 'analysis-completed' ? (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      ) : (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      )}
                    </div>
                    
                    {/* Event Content */}
                    <div className="space-y-1 group">
                      <p className="text-xs leading-relaxed text-on-surface-variant/90 group-hover:text-on-surface transition-colors">
                        <strong className="text-on-surface font-semibold">
                          {activity.type === 'analysis-completed' ? 'Analysis finished' : activity.description}
                        </strong> 
                        {' '}for{' '}
                        <span className="text-primary cursor-pointer hover:underline font-mono px-1 bg-primary/10 rounded">
                          {activity.repoName}
                        </span>
                      </p>
                      <p className="text-[10px] text-on-surface-variant/50 font-mono">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating FAB for New Codebase */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-background rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary/50">
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Analysis</span>
        </button>
      </div>
    </div>
  );
};
