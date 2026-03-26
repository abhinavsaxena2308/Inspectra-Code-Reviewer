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

export const AnalysisPage = () => {
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
        const result = await getAnalysisStatus(id);
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
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      default:
        return 'text-on-surface-variant bg-on-surface-variant/10 border-on-surface-variant/20';
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
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-none bg-surface-container/50 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')} className="p-2 h-auto">
            <ArrowLeft className="w-4 h-4" />
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

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant mb-1">Health Score</span>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-32 bg-surface-container border border-none rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  className={cn(
                    "h-full transition-colors",
                    analysis.score > 80 ? 'bg-secondary' : analysis.score > 50 ? 'bg-tertiary' : 'bg-error'
                  )}
                />
              </div>
              <span className="text-sm font-bold text-on-surface">{analysis.score}</span>
            </div>
          </div>
          <Button size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            GitHub
          </Button>
        </div>
      </header>

      {/* Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Categories & Files */}
        <aside className="w-72 border-r border-none bg-surface flex flex-col overflow-hidden">
          <div className="p-4 border-b border-none bg-surface-container/20">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Categories</h3>
            <div className="space-y-1">
              {['issues', 'suggestions', 'security', 'performance'].map((tab) => {
                const Icon = tab === 'issues' ? AlertTriangle : tab === 'suggestions' ? Lightbulb : tab === 'security' ? ShieldAlert : Zap;
                const isActive = activeTab === tab;
                const count = getTabCount(tab);
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="capitalize">{tab}</span>
                    </div>
                    {count > 0 && (
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", isActive ? "bg-primary/20 text-primary" : "bg-surface-container text-on-surface-variant")}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Files</h3>
            <div className="space-y-0.5">
              {(analysis.files || []).map((file) => (
                <button
                  key={file.file_name}
                  onClick={() => setSelectedFile(file.file_name)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-all text-left truncate",
                    selectedFile === file.file_name
                      ? "bg-surface-container text-on-surface font-medium border border-none shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30"
                  )}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.file_name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content: Issues */}
        <main className="flex-1 bg-surface overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-on-surface capitalize mb-1">{activeTab} Details</h2>
              <p className="text-on-surface-variant text-xs">Analysis results for <span className="text-primary font-mono">{selectedFile || 'selected file'}</span></p>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredIssues.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 bg-surface-container/10 rounded-xl border border-dashed border-transparent"
                >
                  <CheckCircle2 className="w-8 h-8 text-secondary mb-4 opacity-30" />
                  <p className="text-sm text-on-surface-variant">No {activeTab} detected here.</p>
                </motion.div>
              ) : (
                filteredIssues
                  .filter(i => !selectedFile || i.file_name === selectedFile)
                  .map((issue, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card className="p-5 border-l-4 bg-surface-container/20" 
                        style={{ borderLeftColor: issue.severity === 'high' ? '#ef4444' : issue.severity === 'medium' ? '#eab308' : '#22c55e' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={cn("text-[9px] uppercase font-extrabold px-1.5 py-0.5", getSeverityColor(issue.severity))}>
                            {issue.severity}
                          </Badge>
                          <span className="text-[10px] text-on-surface-variant font-mono">{issue.file_name}</span>
                        </div>
                        <h4 className="text-sm font-bold text-on-surface mb-4 leading-relaxed">{issue.message}</h4>
                        
                        <div className="bg-surface/50 border border-none rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-2 text-primary">
                            <Lightbulb className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Recommended Fix</span>
                          </div>
                          <pre className="text-xs text-on-surface font-mono whitespace-pre-wrap leading-relaxed opacity-90">{issue.suggestion}</pre>
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
