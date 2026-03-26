import React, { useState, useEffect } from 'react';
import { Github, Plus, Search, Code2, ArrowUpRight, CheckCircle2, Star, AlertTriangle, Filter, Download, ChevronLeft, ChevronRight, Folder, Rocket, TrendingUp, ShieldAlert, Cpu, BrainCircuit, Loader2, MoreVertical } from 'lucide-react';
import { Repository } from '../mock/data';
import { fetchRepositories, fetchDashboardStats, fetchRecentActivity, DashboardStats, ActivityItem } from '../lib/dashboardService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { analyzeRepository } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';

export const DashboardPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const debouncedFilter = useDebounce(repoUrl, 300);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(debouncedFilter.toLowerCase())
  );

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-outline';
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-tertiary';
    return 'text-error';
  };

  const bentoStats = [
    {
      label: 'Critical Issues',
      value: stats.find(s => s.label === 'Issues Resolved')?.value ?? '—',
      icon: ShieldAlert,
      color: 'border-error',
      iconColor: 'text-error',
      desc: 'Vulnerabilities detected in current active branches.',
    },
    {
      label: 'Total Analyses',
      value: stats.find(s => s.label === 'Total Analyses')?.value ?? '—',
      icon: Cpu,
      color: 'border-secondary',
      iconColor: 'text-secondary',
      desc: 'Deep-scan sequences completed by the AI engine.',
    },
    {
      label: 'Avg Health Score',
      value: stats.find(s => s.label === 'Average Score')?.value ?? '—',
      icon: BrainCircuit,
      color: 'border-primary',
      iconColor: 'text-primary',
      desc: 'Mean AI confidence across all analyzed repositories.',
    },
    {
      label: 'Active Jobs',
      value: activities.filter(a => a.type !== 'analysis-completed').length || '0',
      icon: Loader2,
      color: 'border-tertiary',
      iconColor: 'text-tertiary',
      desc: 'Workers currently executing deep-scan sequences.',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">

      {/* Hero / Repo Input Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-on-surface">Semantic Code Intelligence</h2>
            <p className="text-outline max-w-xl leading-relaxed">
              Input your repository URL below to trigger a deep structural analysis of your codebase using Inspectra's AI engine.
            </p>
          </div>

          {/* Repo Input Card */}
          <div className="bg-surface-container border-none rounded-xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                  <Github className="w-4 h-4" />
                </span>
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-lg py-4 pl-12 pr-4 text-sm font-mono focus:ring-2 focus:ring-primary/50 transition-all text-on-surface placeholder:text-outline/30 outline-none"
                  placeholder="https://github.com/username/repository"
                  type="text"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !repoUrl.trim()}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Rocket className="w-5 h-5" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-outline uppercase tracking-tighter">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Private Repos Supported</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> SOC2 Compliant</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Multi-Language Support</span>
            </div>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Global Health Score Bento */}
        <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between border-l-4 border-primary shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-outline uppercase tracking-widest">Global Health Score</span>
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-5xl font-bold text-primary tracking-tighter font-mono">
              {stats.find(s => s.label === 'Average Score')?.value ?? '—'}
              <span className="text-xl text-outline ml-1">/100</span>
            </div>
            <p className="text-xs text-outline leading-tight">
              Your codebase maintainability score based on the last {repositories.length} analyzed repositories.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-outline-variant/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-medium text-outline">Repositories Scanned</span>
              <span className="text-[10px] font-mono text-primary">{repositories.length} repos</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-700"
                style={{ width: `${Math.min((repositories.length / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Analyses Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-on-surface">Recent Analyses</h3>
          <div className="flex gap-2">
            <button className="bg-surface-container-high px-3 py-1.5 rounded text-xs font-medium text-outline hover:text-on-surface transition-colors flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button className="bg-surface-container-high px-3 py-1.5 rounded text-xs font-medium text-outline hover:text-on-surface transition-colors flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/10 text-outline text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Repo Name</th>
                <th className="px-6 py-4">Last Analyzed</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Health Score</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredRepos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-outline">
                    No repositories found. Analyze a repo to get started.
                  </td>
                </tr>
              ) : (
                filteredRepos.map((repo, idx) => (
                  <tr
                    key={repo.id}
                    className={cn(
                      "hover:bg-surface-container-high/50 transition-colors group cursor-pointer",
                      idx % 2 !== 0 && "bg-surface-container-highest/5"
                    )}
                    onClick={() => navigate(`/analysis/${repo.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Folder className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                        <span className="font-semibold text-on-surface">{repo.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-outline">{repo.lastAnalyzed}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-secondary" />
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn("font-mono font-bold", getScoreColor(repo.score))}>
                        {repo.score ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <button className="text-outline hover:text-primary transition-colors p-1 rounded hover:bg-surface-container">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="bg-surface-container-lowest p-4 flex justify-between items-center border-t border-outline-variant/5">
            <span className="text-[10px] text-outline uppercase font-bold tracking-widest">
              Showing {filteredRepos.length} of {repositories.length} Repositories
            </span>
            <div className="flex gap-2">
              <button className="p-1 rounded hover:bg-surface-container text-outline disabled:opacity-30 transition-colors" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 rounded hover:bg-surface-container text-outline transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Bento Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bentoStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={cn("bg-surface-container-low p-5 rounded-xl border-l-4", stat.color)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{stat.label}</span>
                <Icon className={cn("w-5 h-5", stat.iconColor)} />
              </div>
              <div className="text-3xl font-mono font-bold text-on-surface">{stat.value}</div>
              <p className="text-[10px] text-outline mt-2 leading-tight">{stat.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/10 py-6 text-center">
        <div className="inline-flex items-center gap-2 text-[10px] text-outline uppercase tracking-[0.2em] font-medium">
          <span className="w-8 h-px bg-outline-variant/30" />
          Engineered for structural clarity
          <span className="w-8 h-px bg-outline-variant/30" />
        </div>
      </footer>
    </div>
  );
};
