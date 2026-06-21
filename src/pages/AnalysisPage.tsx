import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, 
  AlertTriangle, 
  Lightbulb, 
  ShieldAlert, 
  Zap,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getAnalysisStatus, AnalysisResult } from '../lib/api';
import { useAuth } from '@clerk/react';

export const AnalysisPage = () => {
  const { getToken } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'suggestions' | 'security' | 'performance'>('issues');
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    if (!id) return;

    let pollInterval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const result = await getAnalysisStatus(id, token);
        if (result.status === 'success') {
          setAnalysis(result.data);
          
          if (result.data.status === 'completed' || result.data.status === 'failed') {
            setIsLoading(false);
            clearInterval(pollInterval);
            
            // Set initial selected file if files exist
            if (result.data.files && result.data.files.length > 0 && !selectedFile) {
              setSelectedFile(result.data.files[0].file_name);
            }
          } else {
             setIsLoading(true);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch status:', err);
        setError('Failed to load analysis results. The job might not exist.');
        setIsLoading(false);
        clearInterval(pollInterval);
      }
    };

    fetchStatus();
    pollInterval = setInterval(fetchStatus, 3000);
    return () => clearInterval(pollInterval);
  }, [id, selectedFile]);

  const typeMap: Record<string, string> = {
    'issues': 'bug',
    'suggestions': 'suggestion',
    'security': 'security',
    'performance': 'performance'
  };

  const allIssues = (analysis?.files || []).flatMap(f => f.issues.map(i => ({ ...i, file_name: f.file_name })));
  const filteredIssues = allIssues.filter(i => i.type === typeMap[activeTab]);

  const getTabCount = (tab: string) => {
     const type = typeMap[tab];
     return allIssues.filter(i => i.type === type).length;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'text-red-400 bg-red-500/10 ring-1 ring-red-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/20';
      case 'low':
        return 'text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20';
      default:
        return 'text-on-surface-variant bg-surface-container ring-1 ring-outline-variant/30';
    }
  };

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center bg-surface">
        <XCircle className="w-12 h-12 text-error mb-4" />
        <h2 className="text-xl font-bold text-on-surface mb-2">Error</h2>
        <p className="text-on-surface-variant mb-6">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (isLoading || !analysis) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen bg-surface">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-8"
        />
        <h2 className="text-2xl font-bold text-on-surface mb-2">Analyzing Repository...</h2>
        <p className="text-on-surface-variant text-sm max-w-sm text-center mb-12">
          We're performing a deep scan of the codebase to identify bugs, security vulnerabilities, and quality improvements.
        </p>
        <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2 opacity-100">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Scanning</span>
            </div>
            <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Scoring</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none opacity-50" />

      {/* Header */}
      <header className="border-b border-white/5 bg-surface/50 backdrop-blur-xl px-8 py-5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-5">
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')} className="p-2.5 h-auto rounded-xl bg-surface-container-high/50 hover:bg-surface-container-high border-none transition-colors">
            <ArrowLeft className="w-4 h-4 text-on-surface" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-semibold text-on-surface">{analysis.repo}</h1>
              <Badge variant="neutral" className="lowercase text-[10px] px-1.5 py-0">Public</Badge>
            </div>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-tighter">
              Scan ID: {analysis.id.slice(0, 8)} • {new Date(analysis.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Health Score</span>
              <span className={cn(
                "text-sm font-black tracking-tight",
                analysis.score > 80 ? 'text-secondary' : analysis.score > 50 ? 'text-tertiary' : 'text-error'
              )}>{analysis.score}</span>
            </div>
            <div className="h-1.5 w-40 bg-surface-container-high rounded-full overflow-hidden ring-1 ring-inset ring-black/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analysis.score}%` }}
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  analysis.score > 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : analysis.score > 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                )}
              />
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <Button size="sm" className="gap-2 rounded-lg font-medium px-4 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-white/5 transition-all">
            <ExternalLink className="w-4 h-4 text-on-surface-variant" />
            View Repository
          </Button>
        </div>
      </header>

      {/* Content Layout */}
      <div className="flex-1 flex overflow-hidden z-10">
        {/* Sidebar: Categories & Files */}
        <aside className="w-80 border-r border-white/5 bg-surface/30 backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary/50" /> Categories
            </h3>
            <div className="space-y-1.5">
              {['issues', 'suggestions', 'security', 'performance'].map((tab) => {
                const Icon = tab === 'issues' ? AlertTriangle : tab === 'suggestions' ? Lightbulb : tab === 'security' ? ShieldAlert : Zap;
                const isActive = activeTab === tab;
                const count = getTabCount(tab);
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium ring-1 ring-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")} />
                      <span className="capitalize">{tab}</span>
                    </div>
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors", 
                        isActive ? "bg-primary/20 text-primary" : "bg-surface-container-highest text-on-surface-variant group-hover:bg-white/10 group-hover:text-on-surface"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <h3 className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-secondary/50" /> Analyzed Files
            </h3>
            <div className="space-y-1">
              {(analysis.files || []).map((file) => (
                <button
                  key={file.file_name}
                  onClick={() => setSelectedFile(file.file_name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all text-left truncate group",
                    selectedFile === file.file_name
                      ? "bg-surface-container-high text-on-surface font-medium ring-1 ring-white/10 shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/30"
                  )}
                >
                  <FileCode className={cn("w-4 h-4 shrink-0 transition-colors", selectedFile === file.file_name ? "text-primary" : "text-on-surface-variant/50 group-hover:text-on-surface-variant")} />
                  <span className="truncate">{file.file_name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content: Issues */}
        {/* Main Content: Issues */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 lg:p-14">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-10 pb-6 border-b border-white/5">
              <h2 className="text-3xl font-bold text-on-surface capitalize mb-3 tracking-tight">{activeTab} Details</h2>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span>Displaying findings for</span>
                <Badge variant="neutral" className="font-mono bg-surface-container px-2 py-1 border-white/5 text-primary/90">{selectedFile || 'selected file'}</Badge>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredIssues.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-24 bg-surface-container/20 rounded-2xl border border-dashed border-white/10"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2">Clean Bill of Health</h3>
                  <p className="text-on-surface-variant">No {activeTab} detected in this file. Great job!</p>
                </motion.div>
              ) : (
                filteredIssues
                  .filter(i => !selectedFile || i.file_name === selectedFile)
                  .map((issue, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, ease: "easeOut" }}
                      className="mb-6"
                    >
                      <Card className="overflow-hidden bg-surface-container-low/50 backdrop-blur-sm border-white/5 shadow-xl hover:border-white/10 transition-colors group">
                        <div className="p-6 md:p-8">
                          <div className="flex items-center justify-between mb-5">
                            <Badge className={cn("text-[10px] font-black px-2.5 py-1 tracking-wider", getSeverityColor(issue.severity))}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            {issue.line && (
                              <span className="text-xs text-on-surface-variant font-mono bg-surface-container px-2 py-1 rounded-md ring-1 ring-white/5">Line {issue.line}</span>
                            )}
                          </div>
                          
                          <h4 className="text-base md:text-lg font-medium text-on-surface mb-6 leading-relaxed opacity-90">{issue.message}</h4>
                          
                          <div className="bg-[#050505] rounded-xl border border-white/[0.08] shadow-inner overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.05]">
                              <Lightbulb className="w-3.5 h-3.5 text-primary/80" />
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Recommended Fix</span>
                            </div>
                            <div className="p-4 md:p-5 overflow-x-auto custom-scrollbar">
                              <pre className="text-sm font-mono text-on-surface/80 leading-loose whitespace-pre-wrap">{issue.suggestion}</pre>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
