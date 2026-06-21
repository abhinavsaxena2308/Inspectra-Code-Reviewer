import React, { useState, useEffect, useRef } from 'react';
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
  XCircle,
  Clock,
  Shield,
  RefreshCw,
  Terminal,
  Download,
  Wand2,
  GitPullRequest
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getAnalysisStatus, AnalysisResult } from '../lib/api';
import { useAuth } from '@clerk/react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import { fetchHistoryList } from '../lib/dashboardService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export const AnalysisPage = () => {
  const { getToken } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'suggestions' | 'security' | 'performance'>('issues');
  const [selectedFile, setSelectedFile] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [fixingIssues, setFixingIssues] = useState<Record<string, boolean>>({});
  const logsEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleAutoFix = async (issueIdx: number) => {
    setFixingIssues(prev => ({ ...prev, [issueIdx]: true }));
    try {
      const issueToFix = filteredIssues.filter(i => !selectedFile || i.file_name === selectedFile)[issueIdx];
      const token = await getToken();
      
      const res = await fetch('/api/autofix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          repoUrl: `https://github.com/${analysis?.repo}`,
          filePath: issueToFix.file_name,
          issueDescription: `${issueToFix.message}\n\nSuggestion: ${issueToFix.suggestion}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate auto-fix PR');

      toast.success('Auto-Fix PR Generated!', {
        description: (
          <div className="mt-2 flex flex-col gap-2">
            <span>A pull request with the suggested fix has been pushed to GitHub.</span>
            <a href={data.data.prUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium">
              <GitPullRequest className="w-4 h-4" /> View Pull Request
            </a>
          </div>
        ),
        duration: 8000
      });
    } catch (err: any) {
      toast.error('Auto-Fix Failed', { description: err.message });
    } finally {
      setFixingIssues(prev => ({ ...prev, [issueIdx]: false }));
    }
  };

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Inspectra-Report-${analysis?.repo.replace('/', '-')}`,
  });

  useEffect(() => {
    if (!id || !isLoading) return;

    const eventSource = new EventSource(`/api/analysis/${id}/logs`);
    eventSource.onmessage = (event) => {
      setLogs((prev) => {
        if (prev.includes(event.data)) return prev;
        return [...prev, event.data];
      });
    };

    return () => {
      eventSource.close();
    };
  }, [id, isLoading]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

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

  useEffect(() => {
    if (!analysis || !getToken) return;
    const fetchHistory = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const allHistory = await fetchHistoryList(token);

        const repoHistory = allHistory
          .filter(h => h.repoName === analysis.repo && h.score != null)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-10); // Last 10 scans

        setHistoryData(repoHistory);
      } catch (err) {
        console.error('Failed to fetch repo history:', err);
      }
    };
    fetchHistory();
  }, [analysis?.repo, getToken]);

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
      <div className="p-8 flex flex-col min-h-screen bg-background">
        <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
          <div className="flex items-center justify-between mb-4 mt-8">
            <h2 className="text-xl font-semibold text-on-surface flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Analysis Console
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Running</span>
            </div>
          </div>

          <div className="h-[600px] bg-[#050505] border border-white/10 rounded-xl font-mono text-sm p-6 overflow-y-auto flex flex-col shadow-2xl relative">
            <div className="flex-1 space-y-2 text-[#8b949e]">
              {logs.length === 0 ? (
                <div className="animate-pulse text-on-surface-variant">Connecting to analysis worker...</div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i}
                    className={cn(
                      "break-words",
                      log.includes('[ERROR]') ? 'text-red-400' : 'text-[#c9d1d9]'
                    )}
                  >
                    {log}
                  </motion.div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Terminal decorative overlay */}
            <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#050505] to-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col md:flex-row">
      <aside className="w-72 bg-surface-container-low border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="w-full justify-start gap-2 text-on-surface-variant">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

        <div className="p-4 border-b border-white/10">
          <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Categories</h3>
          <div className="space-y-1">
            {['issues', 'suggestions', 'security', 'performance'].map((tab) => {
              const Icon = tab === 'issues' ? AlertTriangle : tab === 'suggestions' ? Lightbulb : tab === 'security' ? ShieldAlert : Zap;
              const count = getTabCount(tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === tab ? "bg-surface border border-white/10 text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{tab}</span>
                  </div>
                  {count > 0 && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Files</h3>
          {(analysis.files || []).map((file) => (
            <button
              key={file.file_name}
              onClick={() => setSelectedFile(file.file_name)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md truncate transition-colors",
                selectedFile === file.file_name ? "bg-surface border border-white/10 text-on-surface" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <FileCode className="w-4 h-4 shrink-0" />
              <span className="truncate">{file.file_name}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-on-surface-variant" />
            <h1 className="text-lg font-semibold font-mono">{analysis.repo}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 bg-white text-black hover:bg-zinc-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Sync
            </button>
            <button onClick={handlePrint as any} className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 bg-surface hover:bg-surface-container text-on-surface border border-white/10">
              <Download className="w-3.5 h-3.5 opacity-70" /> Export PDF
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8" ref={contentRef}>
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Overview */}
              <div className="col-span-1 lg:col-span-2 bg-surface border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-on-surface mb-1">Integrity Score</h3>
                <div className="mt-6 flex flex-col gap-2">
                  <span className="text-4xl font-semibold">{analysis.score}</span>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white" style={{ width: `${analysis.score}%` }} />
                  </div>
                </div>
              </div>
              {/* Analysis Metadata */}
              <div className="bg-surface border border-white/10 rounded-xl p-6 flex flex-col gap-4 justify-center">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-on-surface-variant" />
                  <p className="text-xs font-mono">{new Date(analysis.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-on-surface-variant" />
                  <p className="text-xs font-mono uppercase">Completed</p>
                </div>
              </div>
            </div>

            {/* Phase 3: Historical Trend Chart */}
            {historyData.length > 1 && (
              <div className="bg-surface border border-white/10 rounded-xl p-6 h-[250px]">
                <h3 className="text-sm font-semibold text-on-surface mb-4">Historical Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" stroke="var(--color-on-surface-variant)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-on-surface-variant)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'var(--color-surface-container)', borderColor: 'var(--color-outline-variant)', borderRadius: '8px' }}
                      cursor={{ stroke: 'var(--color-outline-variant)', strokeWidth: 1 }}
                    />
                    <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-primary)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {filteredIssues.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-surface border border-white/10 rounded-xl border-dashed">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-4" />
                  <h3 className="text-lg font-semibold text-on-surface mb-1">Clean Bill of Health</h3>
                  <p className="text-sm text-on-surface-variant">No issues found in this file.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredIssues.filter(i => !selectedFile || i.file_name === selectedFile).map((issue, idx) => (
                    <div key={idx} className="bg-surface border border-white/10 rounded-xl p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={cn("w-5 h-5", issue.severity === 'critical' ? 'text-red-500' : 'text-amber-500')} />
                          <div>
                            <h4 className="text-sm font-semibold text-on-surface">{issue.message}</h4>
                            <span className="text-[10px] text-on-surface-variant font-mono">Line {issue.line}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAutoFix(idx)}
                          disabled={fixingIssues[idx]}
                          className="px-3 py-1.5 shrink-0 rounded-md text-xs font-semibold flex items-center gap-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-colors disabled:opacity-50"
                        >
                          {fixingIssues[idx] ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                              Fixing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3.5 h-3.5" />
                              Auto-Fix
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-[#050505] rounded-md p-4 border border-white/5 relative overflow-hidden group">
                        <p className="text-xs font-mono text-on-surface-variant z-10 relative">{issue.suggestion}</p>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};