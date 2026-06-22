import React, { useState, useEffect, useRef } from 'react';
import { Network, ShieldAlert, Code2, Loader2, Play, Database, ChevronDown } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'diagram' | 'threat-model'>('diagram');
  const { theme } = useTheme();
  
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'default', securityLevel: 'loose' });
    if (mermaidCode && mermaidRef.current && activeTab === 'diagram') {
      mermaidRef.current.innerHTML = '';
      mermaid.render(`architecture-diagram-${theme}`, mermaidCode).then((result) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = result.svg;
        }
      }).catch(err => {
        console.error("Mermaid Render Error", err);
      });
    }
  }, [theme, activeTab, mermaidCode]);

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
      toast.success('Architecture modeled successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasContent = mermaidCode || threatModel;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface flex items-center gap-3">
              <Network className="w-6 h-6 text-emerald-400" />
              Architecture Modeler
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Visualize system components and identify macro-level security threats.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Repository Select Dropdown */}
            <div className="relative">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="appearance-none bg-surface border border-white/10 text-on-surface py-2 pl-10 pr-10 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer min-w-[200px]"
              >
                {repositories.length === 0 && <option value="">No Repositories</option>}
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.url || ''}>
                    {repo.name}
                  </option>
                ))}
              </select>
              <Database className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-4 h-4 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedRepo}
              className="px-4 py-2 bg-emerald-500 text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
              ) : hasContent ? (
                <><Play className="w-4 h-4 fill-current" /> Re-Analyze Architecture</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> Analyze Architecture</>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {isAnalyzing ? (
          <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden p-8 shadow-2xl">
            <div className="animate-pulse flex flex-col items-center justify-center py-20">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <Network className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">Analyzing Infrastructure</h3>
              <p className="text-on-surface-variant font-mono text-sm">Building dependency graph and threat models...</p>
              
              <div className="w-full max-w-md mt-12 space-y-3">
                <div className="h-2 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500/50 w-1/3 animate-pulse"></div>
                </div>
                <div className="h-2 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500/30 w-2/3 animate-pulse delay-75"></div>
                </div>
                <div className="h-2 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500/40 w-1/2 animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        ) : hasContent ? (
          <div className="bg-surface/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-[600px] shadow-2xl">
            
            {/* Tabs Header */}
            <div className="flex items-center border-b border-white/10 bg-surface-container-low/50 px-4 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('diagram')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-300",
                  activeTab === 'diagram' 
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" 
                    : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                )}
              >
                <Code2 className="w-4 h-4" /> System Diagram
              </button>
              <button
                onClick={() => setActiveTab('threat-model')}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-300",
                  activeTab === 'threat-model' 
                    ? "border-red-500 text-red-400 bg-red-500/5" 
                    : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                )}
              >
                <ShieldAlert className="w-4 h-4" /> Threat Model
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 relative bg-background/50">
              
              {/* Diagram Tab */}
              <div className={cn(
                "absolute inset-0 overflow-auto p-6 transition-opacity duration-300",
                activeTab === 'diagram' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
                theme === 'dark' ? "bg-[#0a0a0a]" : "bg-white"
              )}>
                {activeTab === 'diagram' && mermaidCode ? (
                  <div 
                    ref={mermaidRef} 
                    className="flex justify-center items-center min-h-full [&>svg]:max-w-full [&>svg]:h-auto"
                  >
                    {/* Mermaid renders here */}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant">
                    No diagram available.
                  </div>
                )}
              </div>

              {/* Threat Model Tab */}
              <div className={cn(
                "absolute inset-0 overflow-auto p-8 transition-opacity duration-300 bg-surface/50",
                activeTab === 'threat-model' ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}>
                {activeTab === 'threat-model' && threatModel ? (
                  <div className="prose prose-sm prose-invert max-w-4xl mx-auto prose-headings:text-on-surface prose-p:text-on-surface-variant prose-a:text-emerald-400 prose-tables:border prose-tables:border-white/10 prose-th:bg-white/5 prose-th:p-3 prose-td:p-3 prose-tr:border-b prose-tr:border-white/10 prose-li:text-on-surface-variant">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{threatModel}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-on-surface-variant">
                    No threat model available.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-surface/30 border border-white/10 border-dashed rounded-xl animate-in fade-in zoom-in-95 backdrop-blur-sm">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <Network className="w-10 h-10 text-on-surface-variant/50" />
            </div>
            <h3 className="text-xl font-semibold text-on-surface mb-3">No Architecture Loaded</h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto text-center leading-relaxed">
              Select a repository from the dropdown above and click <strong className="text-on-surface">Analyze Architecture</strong> to generate an AI-driven system dependency graph and identify macro-level security threats.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

