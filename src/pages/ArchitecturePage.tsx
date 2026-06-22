import React, { useState, useEffect, useRef } from 'react';
import { Network, ShieldAlert, Code2, Loader2, Play, Database } from 'lucide-react';
import { useAuth } from '@clerk/react';
import { fetchConnectedRepos, Repository } from '../lib/dashboardService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';

export const ArchitecturePage = () => {
  const { getToken } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [threatModel, setThreatModel] = useState<string | null>(null);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const { theme } = useTheme();
  
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default', securityLevel: 'loose' });
    // Force a re-render if the diagram is already present when theme toggles
    if (mermaidCode && mermaidRef.current) {
      mermaidRef.current.innerHTML = '';
      mermaid.render(`architecture-diagram-${theme}`, mermaidCode).then((result) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = result.svg;
        }
      }).catch(err => {
        console.error("Mermaid Render Error", err);
      });
    }
  }, [theme]);

  useEffect(() => {
    const loadRepos = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const repos = await fetchConnectedRepos(token);
        setRepositories(repos);
        if (repos.length > 0) setSelectedRepo(repos[0].url || '');
      } catch (err) {
        toast.error('Failed to load repositories');
      }
    };
    loadRepos();
  }, [getToken]);

  // Fetch saved architecture when repo changes
  useEffect(() => {
    const fetchSaved = async () => {
      if (!selectedRepo) return;
      try {
        const token = await getToken();
        const res = await fetch(`/api/architecture/saved?repoUrl=${encodeURIComponent(selectedRepo)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setMermaidCode(data.data.mermaid);
          setThreatModel(data.data.report);
        } else {
          setMermaidCode(null);
          setThreatModel(null);
        }
      } catch (err) {
        console.error("Failed to fetch saved architecture", err);
      }
    };
    fetchSaved();
  }, [selectedRepo, getToken]);

  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      mermaidRef.current.innerHTML = '';
      mermaid.render(`architecture-diagram-${theme}-${Date.now()}`, mermaidCode).then((result) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = result.svg;
        }
      }).catch(err => {
        console.error("Mermaid Render Error", err);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div class="text-red-400 p-4">Failed to render diagram: ${err.message}</div>`;
        }
      });
    }
  }, [mermaidCode]);

  const handleAnalyze = async () => {
    if (!selectedRepo) return;
    setIsAnalyzing(true);
    setMermaidCode(null);
    setThreatModel(null);

    try {
      const token = await getToken();
      const res = await fetch('/api/architecture/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repoUrl: selectedRepo })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to analyze architecture');

      setMermaidCode(data.data.mermaid);
      setThreatModel(data.data.report);
      setIsTableVisible(false);
      toast.success('Architecture modeled successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface flex items-center gap-3">
              <Network className="w-6 h-6 text-fuchsia-400" />
              Architecture Modeler
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Visualize system components and identify macro-level security threats.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isTableVisible && (
              <button
                onClick={() => setIsTableVisible(true)}
                className="px-4 py-2 bg-surface border border-white/10 text-on-surface rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors"
              >
                <Database className="w-4 h-4" /> Change Project
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedRepo}
              className="px-4 py-2 bg-fuchsia-500 text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-fuchsia-600 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
              ) : (mermaidCode || threatModel) ? (
                <><Play className="w-4 h-4 fill-current" /> Re-Analyze Architecture</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> Analyze Architecture</>
              )}
            </button>
          </div>
        </div>

        {/* Repositories Table */}
        {isTableVisible && (
          <div className="bg-surface border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-white/10 text-xs uppercase tracking-wider text-on-surface-variant">
                <th className="p-4 font-semibold">Repository</th>
                <th className="p-4 font-semibold text-center">Architecture Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {repositories.map(repo => {
                const isSelected = selectedRepo === repo.url;
                return (
                  <tr 
                    key={repo.id} 
                    className={cn(
                      "transition-colors cursor-pointer",
                      isSelected ? "bg-fuchsia-500/10" : "hover:bg-surface-container-high"
                    )}
                    onClick={() => {
                      setSelectedRepo(repo.url || '');
                      setIsTableVisible(false);
                    }}
                  >
                    <td className="p-4 flex items-center gap-3">
                      <Database className={cn("w-4 h-4", isSelected ? "text-fuchsia-400" : "text-on-surface-variant")} />
                      <span className={cn("font-medium", isSelected ? "text-fuchsia-400" : "text-on-surface")}>
                        {repo.name}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {repo.has_architecture ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-fuchsia-500/20 text-fuchsia-400">
                          <Network className="w-3.5 h-3.5" /> Saved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-on-surface-variant">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isSelected ? (
                        <span className="text-xs font-bold text-fuchsia-400 flex items-center justify-end gap-1">
                          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-primary hover:text-primary-light">
                          Select
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {repositories.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-on-surface-variant text-sm">
                    No connected repositories found. Connect a repository on the Dashboard first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Content */}
        {!isTableVisible && isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-32 bg-surface border border-white/10 rounded-xl">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin"></div>
              <Network className="w-6 h-6 text-fuchsia-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold text-on-surface mt-6 mb-2">Analyzing Infrastructure...</h3>
            <p className="text-sm text-on-surface-variant font-mono">Parsing docker-compose, package.json, and entrypoints</p>
          </div>
        ) : mermaidCode || threatModel ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Diagram Pane */}
            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-surface-container-low">
                <Code2 className="w-4 h-4 text-fuchsia-400" />
                <h3 className="font-semibold text-sm text-on-surface">System Diagram</h3>
              </div>
              <div 
                className={cn(
                  "p-6 flex-1 overflow-auto [&>svg]:w-full [&>svg]:h-full [&>svg]:min-w-[600px] [&>svg]:min-h-[400px]",
                  theme === 'dark' ? "bg-[#0a0a0a]" : "bg-white"
                )} 
                ref={mermaidRef}
              >
                {/* Mermaid renders here */}
              </div>
            </div>

            {/* Threat Model Pane */}
            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-red-500/10 text-red-400">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-semibold text-sm">Threat Model Report</h3>
              </div>
              <div className="p-6 flex-1 overflow-y-auto prose prose-sm prose-invert max-w-none prose-tables:border prose-tables:border-white/10 prose-th:bg-white/5 prose-th:p-2 prose-td:p-2 prose-tr:border-b prose-tr:border-white/10">
                {threatModel ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{threatModel}</ReactMarkdown>
                ) : (
                  <p className="text-on-surface-variant italic">No threat model generated.</p>
                )}
              </div>
            </div>
            
          </div>
        ) : !isTableVisible ? (
          <div className="py-24 text-center bg-surface border border-white/10 border-dashed rounded-xl animate-in fade-in zoom-in-95">
            <Network className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-on-surface mb-2">No Architecture Loaded</h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Click Analyze Architecture to generate a system dependency graph and threat model.
            </p>
          </div>
        ) : null}

      </div>
    </div>
  );
};
