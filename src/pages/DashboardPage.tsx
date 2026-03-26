import React, { useState, useEffect } from 'react';
import { Github, Plus, Search, Code2, ArrowUpRight, CheckCircle2, Star, AlertTriangle, Filter, Download, ChevronLeft, ChevronRight, Folder, Rocket, TrendingUp, ShieldAlert, Cpu, BrainCircuit, Loader2, MoreVertical, RefreshCw, Trash2, Settings, Terminal, Database } from 'lucide-react';
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

      {/* Repositories Section */}
      <section className="space-y-6">
        {/* Section Header */}
        <div className="flex items-end justify-between">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold text-outline uppercase tracking-widest mb-1">
              <span>Workspace</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">Inspectra AI</span>
            </nav>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface flex items-baseline gap-4">
              Repositories
              <span className="font-mono text-lg font-medium text-outline">{repositories.length} Total</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface text-sm font-semibold rounded-lg hover:bg-surface-container-high transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-lg active:scale-95 transition-transform">
              <RefreshCw className="w-4 h-4" />
              Sync GitHub
            </button>
          </div>
        </div>

        {filteredRepos.length === 0 ? (
          /* Empty State */
          <div className="p-20 flex flex-col items-center justify-center text-center bg-surface-container-low/30 rounded-2xl border-2 border-dashed border-outline-variant/10">
            <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-6">
              <Folder className="w-8 h-8 text-outline" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2 tracking-tight">No repositories found</h3>
            <p className="text-outline text-sm max-w-sm mb-8 leading-relaxed">
              {repoUrl
                ? `No repositories match "${repoUrl}". Try a different name or sync a new repo.`
                : "Analyze a repository URL above to get started with Inspectra AI."}
            </p>
            <div className="flex gap-4">
              {repoUrl && (
                <button onClick={() => setRepoUrl('')} className="px-6 py-2 bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest rounded-lg border border-outline-variant/20">
                  Clear Search
                </button>
              )}
              <button
                onClick={() => document.querySelector('input')?.focus()}
                className="px-6 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-widest rounded-lg"
              >
                Analyze New Repository
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Bento Featured Repos — top 2 */}
            {filteredRepos.length >= 1 && (
              <div className="grid grid-cols-12 gap-6">
                {/* Main featured repo */}
                <div
                  onClick={() => navigate(`/analysis/${filteredRepos[0].id}`)}
                  className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl relative overflow-hidden group cursor-pointer border border-transparent hover:border-outline-variant/20 transition-all"
                >
                  <div className="severity-monolith bg-secondary" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <Terminal className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="text-xl font-bold text-on-surface font-mono">{filteredRepos[0].name}</h3>
                          <p className="text-sm text-outline">Primary repository — {filteredRepos[0].language}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-highest text-outline border border-outline-variant/20 uppercase tracking-tighter">
                        Public
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-outline tracking-widest">Health Score</p>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-3xl font-black font-mono leading-none", getScoreColor(filteredRepos[0].score))}>
                            {filteredRepos[0].score ?? '—'}
                          </span>
                          <span className="text-xs text-outline/60 leading-none">/ 100</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-outline tracking-widest">Active Analysis</p>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-secondary" />
                          <span className="text-sm font-semibold text-on-surface uppercase tracking-tight">Analyzed</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-outline tracking-widest">Last Check</p>
                        <p className="text-sm font-medium text-on-surface-variant font-mono leading-none pt-1">{filteredRepos[0].lastAnalyzed}</p>
                      </div>
                    </div>
                  </div>
                  {/* Decorative wave */}
                  <div className="absolute bottom-0 right-0 w-64 h-32 opacity-20 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 40">
                      <path d="M0 40 Q 25 35, 50 38 T 100 30 V 40 H 0 Z" fill="url(#grad1)" />
                      <defs>
                        <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#a2c9ff', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#10141a', stopOpacity: 0 }} />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Secondary repo or placeholder */}
                {filteredRepos[1] ? (
                  <div
                    onClick={() => navigate(`/analysis/${filteredRepos[1].id}`)}
                    className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl relative overflow-hidden group cursor-pointer border border-transparent hover:border-outline-variant/20 transition-all p-6"
                  >
                    <div className="severity-monolith bg-tertiary-container" />
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="w-5 h-5 text-tertiary" />
                      <h3 className="font-bold text-on-surface font-mono text-sm truncate">{filteredRepos[1].name}</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-outline uppercase tracking-widest leading-none">Health</span>
                        <span className={cn("text-2xl font-bold font-mono leading-none", getScoreColor(filteredRepos[1].score))}>
                          {filteredRepos[1].score ?? '—'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all",
                            (filteredRepos[1].score ?? 0) >= 80 ? 'bg-secondary' :
                            (filteredRepos[1].score ?? 0) >= 60 ? 'bg-tertiary' : 'bg-error'
                          )}
                          style={{ width: `${filteredRepos[1].score ?? 0}%` }}
                        />
                      </div>
                      <div className="pt-2 flex justify-between">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold border uppercase",
                          (filteredRepos[1].score ?? 0) >= 80 ? 'bg-secondary/10 text-secondary border-secondary/20' :
                          (filteredRepos[1].score ?? 0) >= 60 ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-error/10 text-error border-error/20'
                        )}>
                          {(filteredRepos[1].score ?? 0) >= 80 ? 'Healthy' : (filteredRepos[1].score ?? 0) >= 60 ? 'Warning' : 'Critical'}
                        </span>
                        <span className="text-[10px] font-mono text-outline">{filteredRepos[1].lastAnalyzed}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-6 border border-dashed border-outline-variant/20 flex flex-col items-center justify-center gap-3 text-center">
                    <Plus className="w-8 h-8 text-outline/30" />
                    <p className="text-xs text-outline/60">Analyze another repository to populate this card.</p>
                  </div>
                )}
              </div>
            )}

            {/* All Repositories List */}
            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl">
              {/* List Header */}
              <div className="px-6 py-4 border-b border-surface-container-highest flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-widest text-outline">All Repositories</h4>
                <div className="flex items-center gap-4 text-xs font-medium text-outline">
                  <span>Showing {filteredRepos.length} of {repositories.length}</span>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-surface-container rounded disabled:opacity-30 transition-colors" disabled>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-surface-container rounded transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column Headers */}
              <div className="grid grid-cols-12 px-6 py-3 bg-surface-container-lowest text-[10px] font-bold text-outline uppercase tracking-widest border-b border-outline-variant/5">
                <div className="col-span-4">Name &amp; Visibility</div>
                <div className="col-span-2">Health Index</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Last Analyzed</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Repo Rows */}
              <div className="divide-y divide-surface-container-highest">
                {filteredRepos.map((repo) => {
                  const isAnalyzing = repo.status === 'needs-improvement';
                  const isFailed = repo.status === 'critical';
                  const isHealthy = repo.status === 'good';
                  const score = repo.score ?? 0;

                  // Dot colors
                  const dotClass = isHealthy
                    ? 'bg-secondary shadow-[0_0_8px_rgba(103,223,112,0.4)]'
                    : isAnalyzing
                    ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(162,201,255,0.4)]'
                    : 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.4)]';

                  return (
                    <div
                      key={repo.id}
                      className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface-container-high transition-colors group cursor-pointer"
                      onClick={() => navigate(`/analysis/${repo.id}`)}
                    >
                      {/* Name & Visibility */}
                      <div className="col-span-4 flex items-center gap-4">
                        <div className={cn('w-2 h-2 rounded-full shrink-0', dotClass)} />
                        <div>
                          <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors font-mono">
                            {repo.name}
                          </span>
                          <p className="text-[10px] text-outline mt-0.5 uppercase font-bold tracking-tighter">
                            Public Repo • {repo.language}
                          </p>
                        </div>
                      </div>

                      {/* Health Index */}
                      <div className="col-span-2">
                        {isAnalyzing ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 text-outline animate-spin" />
                            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Calculating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', isFailed ? 'bg-error' : 'bg-secondary')}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={cn('text-xs font-bold font-mono', isFailed ? 'text-error' : 'text-secondary')}>
                              {score}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        {isHealthy && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-tight">
                            <span className="w-1 h-1 rounded-full bg-secondary" />
                            Healthy
                          </span>
                        )}
                        {isAnalyzing && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tight">
                            <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                            Analyzing
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase tracking-tight">
                            <span className="w-1 h-1 rounded-full bg-error" />
                            Failed
                          </span>
                        )}
                      </div>

                      {/* Last Analyzed */}
                      <div className="col-span-2">
                        <span className="text-xs text-outline font-mono">
                          {isAnalyzing ? 'Running now' : repo.lastAnalyzed}
                        </span>
                      </div>

                      {/* Actions — reveal on hover */}
                      <div
                        className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => e.stopPropagation()}
                      >
                        {isAnalyzing ? (
                          <button
                            title="Stop Analysis"
                            className="p-1.5 hover:bg-surface-container-highest rounded-lg text-outline hover:text-error transition-colors"
                          >
                            <Loader2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              title="Re-analyze"
                              onClick={() => navigate(`/analysis/${repo.id}`)}
                              className="p-1.5 hover:bg-surface-container-highest rounded-lg text-outline hover:text-primary transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              title="Settings"
                              className="p-1.5 hover:bg-surface-container-highest rounded-lg text-outline hover:text-primary transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete"
                              className="p-1.5 hover:bg-surface-container-highest rounded-lg text-outline hover:text-error transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>


              {/* Pagination Footer */}
              <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  Page 1 of {Math.max(1, Math.ceil(repositories.length / 10))}
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-surface-container text-on-surface text-[10px] font-bold uppercase tracking-widest rounded border border-outline-variant/20 hover:border-primary/50 transition-colors disabled:opacity-40" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-surface-container text-on-surface text-[10px] font-bold uppercase tracking-widest rounded border border-outline-variant/20 hover:border-primary/50 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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
