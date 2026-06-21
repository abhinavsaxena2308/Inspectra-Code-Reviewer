import React, { useState, useEffect } from 'react';
import { 
  Plus, Filter, ChevronRight, ChevronLeft, RefreshCw, Trash2, 
  Settings, Terminal, Database, Loader2, Rocket, CheckCircle2, Github, Folder, ExternalLink, Search
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
    if (score >= 60) return 'text-amber-500';
    return 'text-error';
  };

  const totalRepos = repositories.length;
  const validScores = repositories.filter(r => r.score !== undefined && r.score !== null).map(r => r.score);
  const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  const needsAttentionCount = repositories.filter(r => r.status === 'failed' || (r.score !== undefined && r.score !== null && r.score < 80)).length;

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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/10">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold font-heading tracking-tight text-on-surface">Repositories</h2>
             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/10 bg-surface-container text-[10px] font-medium text-on-surface-variant">
               {repositories.length} Total
             </span>
          </div>
          <p className="text-on-surface-variant text-sm max-w-2xl font-sans">
            Manage connected workspaces, search your repositories, or enter a new GitHub URL to trigger an analysis.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
           {/* Search / Connect Bar */}
           <div className="relative w-full sm:w-80 group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
             <input
               type="text"
               placeholder="Search or paste repo URL..."
               value={repoUrl}
               onChange={(e) => setRepoUrl(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors font-mono"
             />
           </div>
           
           <button 
             onClick={() => {
               if (repoUrl.includes('github.com')) {
                 handleAnalyze(repoUrl);
               } else {
                 loadData();
               }
             }} 
             className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 ethereal-btn whitespace-nowrap"
           >
              {repoUrl.includes('github.com') ? (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  Analyze URL
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync GitHub
                </>
              )}
           </button>
        </div>
      </header>

      {filteredRepos.length === 0 ? (
        /* Empty State */
        <div className="p-20 flex flex-col items-center justify-center text-center glass-card rounded-2xl border border-white/5">
          <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <Folder className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold font-heading text-on-surface mb-2 tracking-tight">No repositories found</h3>
          <p className="text-on-surface-variant text-sm max-w-sm mb-8 leading-relaxed font-sans">
            {repoUrl
              ? `No repositories match "${repoUrl}". Try a different name or sync a new repo.`
              : "No repositories connected yet. Paste a GitHub URL above to start analyzing."}
          </p>
          <div className="flex gap-4">
            {repoUrl && (
              <button onClick={() => setRepoUrl('')} className="px-6 py-2 bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest rounded-lg border border-outline-variant/20 hover:bg-surface-container transition-colors">
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Aggregate Stats Overview */}
          {!repoUrl.includes('github.com') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat Card 1 */}
              <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-surface-container-high rounded-lg shadow-lg">
                    <Database className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-bold text-on-surface-variant font-sans text-xs uppercase tracking-wider">Total Workspaces</h3>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-bold font-heading text-on-surface">{totalRepos}</span>
                  <span className="text-xs text-on-surface-variant font-mono pb-1">Connected</span>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-primary/10 rounded-lg shadow-lg border border-primary/20">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-on-surface-variant font-sans text-xs uppercase tracking-wider">Avg Health Score</h3>
                </div>
                <div className="flex items-end justify-between">
                  <span className={cn("text-4xl font-bold font-heading glow-text", getScoreColor(avgScore))}>
                    {avgScore}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono pb-1">/ 100</span>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mt-4">
                  <div
                    className={cn("h-full transition-all shadow-[0_0_10px_currentColor]",
                      avgScore >= 80 ? 'bg-primary' : avgScore >= 60 ? 'bg-amber-500' : 'bg-error'
                    )}
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="glass-card rounded-xl p-6 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-error/10 rounded-lg shadow-lg border border-error/20">
                    <Settings className="w-5 h-5 text-error" />
                  </div>
                  <h3 className="font-bold text-on-surface-variant font-sans text-xs uppercase tracking-wider">Needs Attention</h3>
                </div>
                <div className="flex items-end justify-between">
                  <span className={cn("text-4xl font-bold font-heading", needsAttentionCount > 0 ? "text-error glow-text" : "text-on-surface")}>
                    {needsAttentionCount}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono pb-1">Repositories</span>
                </div>
              </div>
            </div>
          )}

          {/* All Repositories List */}
          <div className="glass-card rounded-xl overflow-hidden flex flex-col border border-white/5">
            {/* List Header */}
            <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h4 className="text-base font-bold font-heading text-on-surface">Registered Workspaces</h4>
              <div className="flex items-center gap-4 text-sm font-medium text-on-surface-variant">
                <span>Showing {filteredRepos.length} of {repositories.length}</span>
                <div className="flex gap-1">
                  <button className="p-1.5 bg-surface-container-low border border-outline/30 rounded hover:bg-surface-container disabled:opacity-30 transition-colors" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 bg-surface-container-low border border-outline/30 rounded hover:bg-surface-container transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 px-6 py-4 bg-surface-container-low/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-white/5">
              <div className="col-span-12 md:col-span-5">Repository Details</div>
              <div className="col-span-6 md:col-span-2">Integrity</div>
              <div className="col-span-6 md:col-span-2">Status</div>
              <div className="col-span-6 md:col-span-2">Last Sync</div>
              <div className="col-span-6 md:col-span-1 text-right">Actions</div>
            </div>

            {/* Repo Rows */}
            <div className="divide-y divide-white/5">
              {filteredRepos.map((repo) => {
                const isAnalyzing = repo.status === 'pending' || repo.status === 'processing';
                const isFailedJob = repo.status === 'failed';
                const score = repo.score ?? 0;
                
                const scoreColorClass = score >= 80 ? 'primary' : score >= 60 ? 'amber-500' : 'error';
                const scoreHexClass = score >= 80 ? 'text-primary' : score >= 60 ? 'text-amber-500' : 'text-error';
                const scoreBgClass = score >= 80 ? 'bg-primary' : score >= 60 ? 'bg-amber-500' : 'bg-error';

                const dotClass = isAnalyzing
                  ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : isFailedJob
                  ? 'bg-error shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : `${scoreBgClass} shadow-[0_0_10px_currentColor]`;

                return (
                  <div
                    key={repo.id}
                    className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface-container/50 transition-colors group cursor-pointer"
                    onClick={() => repo.analysisId ? navigate(`/analysis/${repo.analysisId}`) : handleAnalyze(repo.url)}
                  >
                    {/* Name & Details */}
                    <div className="col-span-12 md:col-span-5 flex items-start gap-4 mb-4 md:mb-0">
                      <div className={cn('w-2 h-2 rounded-full shrink-0 mt-2', dotClass)} />
                      <div className="flex flex-col gap-1 min-w-0 pr-4">
                        <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors font-mono truncate">
                          {repo.name}
                        </span>
                        {repo.description && (
                          <p className="text-xs text-on-surface-variant font-sans line-clamp-1">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded border border-outline/30">
                            {repo.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                            {repo.language}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Health Index */}
                    <div className="col-span-6 md:col-span-2">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                          <span className="text-xs font-mono text-amber-500">SYNCING</span>
                        </div>
                      ) : isFailedJob ? (
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-mono text-error">ERR</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                            <div
                              className={cn('h-full', scoreBgClass)}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={cn('text-sm font-bold font-mono', scoreHexClass)}>
                            {score}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-6 md:col-span-2">
                      {repo.status === 'completed' && (
                        <span className={cn("ghost-label", scoreHexClass, `border-${scoreColorClass}/30`)}>
                          {score >= 80 ? 'PASS' : score >= 60 ? 'WARN' : 'FAIL'}
                        </span>
                      )}
                      {isAnalyzing && (
                        <span className="ghost-label text-amber-500 border-amber-500/30">SYNC</span>
                      )}
                      {isFailedJob && (
                        <span className="ghost-label text-error border-error/30">ERROR</span>
                      )}
                    </div>

                    {/* Last Analyzed */}
                    <div className="col-span-6 md:col-span-2 mt-4 md:mt-0">
                      <span className="text-xs text-on-surface-variant font-mono">
                        {isAnalyzing ? 'Running...' : repo.lastAnalyzed ? new Date(repo.lastAnalyzed).toLocaleDateString() : 'Unscanned'}
                      </span>
                    </div>

                    {/* Actions — reveal on hover */}
                    <div
                      className="col-span-6 md:col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-4 md:mt-0"
                      onClick={e => e.stopPropagation()}
                    >
                      {isAnalyzing ? (
                        <button
                          title="Stop Analysis"
                          className="p-2 bg-surface-container border border-outline/30 rounded-lg text-outline hover:text-error transition-colors"
                        >
                          <Loader2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            title={repo.analysisId ? "Re-analyze" : "Analyze"}
                            onClick={(e) => { e.stopPropagation(); handleAnalyze(repo.url); }}
                            className="p-2 bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                          >
                            <Rocket className="w-4 h-4" />
                          </button>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in GitHub"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-surface-container border border-outline/30 rounded-lg text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors"
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
            <div className="px-6 py-4 border-t border-white/5 bg-surface-container-low/30 flex items-center justify-between">
              <p className="text-xs font-medium text-on-surface-variant">
                Page 1 of {Math.max(1, Math.ceil(repositories.length / 10))}
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-surface-container border border-outline/30 rounded hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors disabled:opacity-40" disabled>
                  Prev
                </button>
                <button className="px-3 py-1.5 bg-primary text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] text-xs font-bold rounded transition-colors">
                  1
                </button>
                <button className="px-3 py-1.5 bg-surface-container border border-outline/30 rounded hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors disabled:opacity-40" disabled>
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
