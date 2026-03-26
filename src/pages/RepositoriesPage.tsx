import React, { useState, useEffect } from 'react';
import { 
  Plus, Filter, ChevronRight, ChevronLeft, RefreshCw, Trash2, 
  Settings, Terminal, Database, Loader2, Rocket, CheckCircle2, Github, Folder
} from 'lucide-react';
import { Repository } from '../mock/data';
import { fetchRepositories } from '../lib/dashboardService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useDebounce } from '../hooks/useDebounce';

export const RepositoriesPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const debouncedFilter = useDebounce(repoUrl, 300);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const reposData = await fetchRepositories();
        setRepositories(reposData);
      } catch (error) {
        console.error('Failed to load repositories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(debouncedFilter.toLowerCase())
  );

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-outline';
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-tertiary';
    return 'text-error';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
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
              : "No repositories connected yet. Start by analyzing a repository URL on the dashboard."}
          </p>
          <div className="flex gap-4">
            {repoUrl && (
              <button onClick={() => setRepoUrl('')} className="px-6 py-2 bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest rounded-lg border border-outline-variant/20">
                Clear Search
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-widest rounded-lg"
            >
              Back to Dashboard
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
                  <p className="text-xs text-outline/60">Analyze more repositories to populate this view.</p>
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
    </div>
  );
};
