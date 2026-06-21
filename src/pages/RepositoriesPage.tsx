import React, { useState, useEffect } from 'react';
import { 
  Plus, Filter, ChevronRight, ChevronLeft, RefreshCw, Trash2, 
  Settings, Terminal, Database, Loader2, Rocket, CheckCircle2, Github, Folder, ExternalLink
} from 'lucide-react';
import { fetchConnectedRepos, Repository } from '../lib/dashboardService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '@clerk/react';

export const RepositoriesPage = () => {
  const { getToken } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const debouncedFilter = useDebounce(repoUrl, 300);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const reposData = await fetchConnectedRepos(token);
      setRepositories(reposData);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnalyze = async (url: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");
      const { analyzeRepository } = await import('../lib/api');
      const response = await analyzeRepository(url, token);
      if (response.status === 'success') {
        navigate(`/analysis/${response.data.id}`);
      }
    } catch (error) {
      console.error('Failed to trigger analysis:', error);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 space-y-10 max-w-7xl mx-auto w-full">
      {/* Page Header Area */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-semibold tracking-tight text-on-surface">Repositories</h2>
             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/10 bg-surface-container text-[10px] font-medium text-on-surface-variant">
               {repositories.length} Total
             </span>
          </div>
          <p className="text-on-surface-variant text-sm max-w-2xl">
            Manage connected workspaces and trigger new sequences.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <button className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 bg-surface hover:bg-surface-container text-on-surface transition-colors border border-white/10">
              <Filter className="w-3.5 h-3.5 opacity-70" />
              Filter
           </button>
           <button onClick={loadData} className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 bg-white text-black hover:bg-zinc-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Sync GitHub
           </button>
        </div>
      </header>

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
                onClick={() => filteredRepos[0].analysisId ? navigate(`/analysis/${filteredRepos[0].analysisId}`) : handleAnalyze(filteredRepos[0].url)}
                className="col-span-12 lg:col-span-8 bg-surface border border-white/10 rounded-xl relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all p-6"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-on-surface-variant" />
                    <div>
                      <h3 className="text-lg font-semibold text-on-surface font-mono">{filteredRepos[0].name}</h3>
                      <p className="text-xs text-on-surface-variant">Primary repository — {filteredRepos[0].language}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container text-on-surface-variant border border-white/10 uppercase">
                    Public
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Health Score</p>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-3xl font-semibold font-mono leading-none", getScoreColor(filteredRepos[0].score).replace('primary', 'emerald-500').replace('tertiary', 'amber-500').replace('error', 'red-500'))}>
                        {filteredRepos[0].score ?? '—'}
                      </span>
                      <span className="text-xs text-on-surface-variant leading-none">/ 100</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono text-on-surface-variant">PASS</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Last Sync</p>
                    <p className="text-xs font-medium text-on-surface-variant font-mono leading-none pt-1.5">{filteredRepos[0].lastAnalyzed}</p>
                  </div>
                </div>
              </div>

              {/* Secondary repo or placeholder */}
              {filteredRepos[1] ? (
                <div
                  onClick={() => filteredRepos[1].analysisId ? navigate(`/analysis/${filteredRepos[1].analysisId}`) : handleAnalyze(filteredRepos[1].url)}
                  className="col-span-12 lg:col-span-4 bg-surface border border-white/10 rounded-xl relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-on-surface-variant" />
                    <h3 className="font-medium text-on-surface font-mono text-sm truncate">{filteredRepos[1].name}</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider leading-none">Health</span>
                      <span className={cn("text-2xl font-semibold font-mono leading-none", getScoreColor(filteredRepos[1].score).replace('primary', 'emerald-500').replace('tertiary', 'amber-500').replace('error', 'red-500'))}>
                        {filteredRepos[1].score ?? '—'}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-white/10 overflow-hidden">
                      <div
                        className={cn("h-full transition-all",
                          (filteredRepos[1].score ?? 0) >= 80 ? 'bg-emerald-500' :
                          (filteredRepos[1].score ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${filteredRepos[1].score ?? 0}%` }}
                      />
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {(filteredRepos[1].score ?? 0) >= 80 ? 'PASS' : (filteredRepos[1].score ?? 0) >= 60 ? 'WARN' : 'FAIL'}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant">{filteredRepos[1].lastAnalyzed}</span>
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
          <div className="bg-surface border border-white/10 rounded-xl overflow-hidden flex flex-col">
            {/* List Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-on-surface">Registered Workspaces</h4>
              <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
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
            <div className="grid grid-cols-12 px-6 py-3 bg-surface-container-low text-[10px] font-medium text-on-surface-variant uppercase tracking-wide border-b border-white/10">
              <div className="col-span-4">Repository</div>
              <div className="col-span-2">Integrity</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Last Sync</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Repo Rows */}
            <div className="divide-y divide-white/5">
              {filteredRepos.map((repo) => {
                const isAnalyzing = repo.status === 'pending' || repo.status === 'processing';
                const isFailedJob = repo.status === 'failed';
                const score = repo.score ?? 0;
                
                const scoreColorClass = score >= 80 ? 'emerald-500' : score >= 60 ? 'amber-500' : 'red-500';

                const dotClass = isAnalyzing
                  ? 'bg-amber-500 animate-pulse'
                  : isFailedJob
                  ? 'bg-red-500'
                  : `bg-${scoreColorClass}`;

                return (
                  <div
                    key={repo.id}
                    className="grid grid-cols-12 px-6 py-3.5 items-center hover:bg-surface-container transition-colors group cursor-pointer"
                    onClick={() => repo.analysisId ? navigate(`/analysis/${repo.analysisId}`) : handleAnalyze(repo.url)}
                  >
                    {/* Name & Visibility */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClass)} />
                      <div>
                        <span className="text-sm font-medium text-on-surface hover:underline underline-offset-4 font-mono">
                          {repo.name}
                        </span>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono uppercase">
                          {repo.isPrivate ? 'PRIVATE' : 'PUBLIC'} • {repo.language}
                        </p>
                      </div>
                    </div>

                    {/* Health Index */}
                    <div className="col-span-2">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-on-surface-variant animate-spin" />
                          <span className="text-[10px] font-mono text-on-surface-variant">SYNCING</span>
                        </div>
                      ) : isFailedJob ? (
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-mono text-on-surface-variant">ERR</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1 bg-white/10 overflow-hidden">
                            <div
                              className={cn('h-full', `bg-${scoreColorClass}`)}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-mono', `text-${scoreColorClass}`)}>
                            {score}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      {repo.status === 'completed' && (
                        <span className="text-[10px] font-mono text-on-surface-variant">
                          {score >= 80 ? 'PASS' : score >= 60 ? 'WARN' : 'FAIL'}
                        </span>
                      )}
                      {isAnalyzing && (
                        <span className="text-[10px] font-mono text-on-surface-variant">SYNC</span>
                      )}
                      {isFailedJob && (
                        <span className="text-[10px] font-mono text-red-400">ERROR</span>
                      )}
                    </div>

                    {/* Last Analyzed */}
                    <div className="col-span-2">
                      <span className="text-xs text-on-surface-variant font-mono">
                        {isAnalyzing ? 'Running...' : repo.lastAnalyzed ? new Date(repo.lastAnalyzed).toLocaleDateString() : 'Unscanned'}
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
                            title={repo.analysisId ? "Re-analyze" : "Analyze"}
                            onClick={(e) => { e.stopPropagation(); handleAnalyze(repo.url); }}
                            className="p-1.5 hover:bg-surface-container-highest rounded-lg text-outline hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <Rocket className="w-4 h-4" />
                            <span className="text-[10px] font-semibold">{repo.analysisId ? "SCAN" : "SCAN"}</span>
                          </button>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in GitHub"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-surface-container-highest rounded-lg text-outline hover:text-on-surface transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-surface-container-low flex items-center justify-between">
              <p className="text-xs font-medium text-on-surface-variant">
                Page 1 of {Math.max(1, Math.ceil(repositories.length / 10))}
              </p>
              <div className="flex items-center gap-1.5">
                <button className="px-2 py-1 bg-surface border border-white/5 rounded hover:bg-surface-container text-on-surface text-xs transition-colors disabled:opacity-40" disabled>
                  Prev
                </button>
                <button className="px-2.5 py-1 bg-white text-black text-xs font-medium rounded transition-colors">
                  1
                </button>
                <button className="px-2 py-1 bg-surface border border-white/5 rounded hover:bg-surface-container text-on-surface text-xs transition-colors disabled:opacity-40" disabled>
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
