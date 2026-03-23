import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronDown, 
  FileCode, 
  Folder, 
  AlertTriangle, 
  Lightbulb, 
  ShieldAlert, 
  Zap,
  ArrowLeft,
  ExternalLink,
  MoreHorizontal,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { MOCK_FILE_TREE, MOCK_ISSUES, MOCK_FILE_CONTENTS, FileNode } from '../mock/data';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getAnalysisStatus, AnalysisResult, AnalysisIssue } from '../lib/api';

export const AnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'suggestions' | 'security' | 'performance'>('issues');
  const [selectedFile, setSelectedFile] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;

    let pollInterval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const result = await getAnalysisStatus(id);
        if (result.status === 'success') {
          setAnalysis(result.data);
          
          // Stop polling if finished or failed
          if (result.data.status === 'completed' || result.data.status === 'failed') {
            setIsLoading(false);
            clearInterval(pollInterval);
            
            // Set initial selected file if issues exist
            if (result.data.issues && result.data.issues.length > 0 && !selectedFile) {
              setSelectedFile(result.data.issues[0].file_name);
            }
          } else {
             // Still pending or processing
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

    // Initial fetch
    fetchStatus();

    // Start polling every 3 seconds
    pollInterval = setInterval(fetchStatus, 3000);

    return () => clearInterval(pollInterval);
  }, [id, selectedFile]);

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  const renderFileTree = (nodes: FileNode[], path = '') => {
    return nodes.map((node) => {
      const currentPath = path ? `${path}/${node.name}` : node.name;
      const isExpanded = expandedFolders.has(currentPath);
      const isSelected = selectedFile === currentPath;

      if (node.type === 'directory') {
        return (
          <div key={currentPath}>
            <button
              onClick={() => toggleFolder(currentPath)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 rounded-md transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Folder className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
              <span>{node.name}</span>
            </button>
            {isExpanded && node.children && (
              <div className="ml-4 border-l border-slate-800/50">
                {renderFileTree(node.children, currentPath)}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={currentPath}
          onClick={() => setSelectedFile(currentPath)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-all duration-200 ml-4 group/file",
            isSelected 
              ? "bg-indigo-600/10 text-indigo-400 font-medium" 
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/30"
          )}
        >
          <FileCode className={cn("w-4 h-4 transition-colors", isSelected ? "text-indigo-400" : "text-slate-600 group-hover/file:text-slate-400")} />
          <span>{node.name}</span>
          {isSelected && (
            <motion.div 
              layoutId="activeFile"
              className="ml-auto w-1 h-1 rounded-full bg-indigo-500" 
            />
          )}
        </button>
      );
    });
  };

  const filteredIssues = (analysis?.issues || []).filter(i => {
    const typeMap: Record<string, string> = {
      'issues': 'bug',
      'suggestions': 'suggestion',
      'security': 'security',
      'performance': 'performance'
    };
    return i.type === typeMap[activeTab];
  });

  const getTabCount = (type: string) => {
     return (analysis?.issues || []).filter(i => i.type === type).length;
  };

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <XCircle className="w-12 h-12 text-gh-red mb-4" />
        <h2 className="text-xl font-bold text-gh-text mb-2">Error</h2>
        <p className="text-gh-muted mb-6">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3 space-y-4">
            <Skeleton className="w-full h-8" />
            <Skeleton className="w-full h-64" />
          </div>
          <div className="col-span-9 space-y-6">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Header */}
      <div className="px-8 py-4 border-b border-gh-border bg-gh-header flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-1.5 hover:bg-gh-muted/10 rounded-md text-gh-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-gh-muted" />
            <div className="flex items-center gap-1 text-lg">
              <span className="text-gh-blue hover:underline cursor-pointer">
                {analysis?.repository?.owner || '...'}
              </span>
              <span className="text-gh-muted">/</span>
              <span className="text-gh-blue font-bold hover:underline cursor-pointer">
                {analysis?.repository?.repo_name || '...'}
              </span>
            </div>
            <Badge variant="neutral" className="ml-2 lowercase">Public</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            className="gap-2"
            onClick={() => window.open(analysis?.repository?.repo_url, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </Button>
          <Button size="sm">Share Report</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: File Explorer (Simplified for now) */}
        <div className="w-72 border-r border-gh-border bg-gh-bg overflow-y-auto p-4 shrink-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-bold text-gh-muted uppercase tracking-wider">Files</span>
          </div>
          <div className="space-y-0.5">
             {/* Dynamic file list based on issues */}
             {Array.from(new Set((analysis?.issues || []).map(i => i.file_name))).map(file => (
                <button
                  key={file}
                  onClick={() => setSelectedFile(file)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-all duration-200 group/file",
                    selectedFile === file 
                      ? "bg-gh-blue/10 text-gh-blue font-medium" 
                      : "text-gh-muted hover:text-gh-text hover:bg-gh-muted/5 font-mono text-[11px]"
                  )}
                >
                  <FileCode className={cn("w-4 h-4", selectedFile === file ? "text-gh-blue" : "text-gh-muted")} />
                  <span className="truncate">{file}</span>
                </button>
             ))}
          </div>
        </div>

        {/* Right Panel: Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gh-bg">
          {/* Tabs */}
          <div className="px-8 border-b border-gh-border bg-gh-header flex items-center gap-8 shrink-0">
            {[
              { id: 'issues', label: 'Issues', icon: AlertTriangle, key: 'bug', color: 'text-gh-red' },
              { id: 'suggestions', label: 'Suggestions', icon: Lightbulb, key: 'suggestion', color: 'text-gh-orange' },
              { id: 'security', label: 'Security', icon: ShieldAlert, key: 'security', color: 'text-gh-green' },
              { id: 'performance', label: 'Performance', icon: Zap, key: 'performance', color: 'text-gh-blue' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-3 border-b-2 transition-all duration-100 relative",
                  activeTab === tab.id 
                    ? "border-[#f78166] text-gh-text" 
                    : "border-transparent text-gh-muted hover:text-gh-text hover:border-gh-muted/50"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "")} />
                <span className="text-sm font-medium">{tab.label}</span>
                <span className={cn(
                  "text-[11px] px-1.5 py-0.5 rounded-full font-bold",
                  activeTab === tab.id ? "bg-gh-muted/20 text-gh-text" : "bg-gh-muted/10 text-gh-muted"
                )}>
                  {getTabCount(tab.key)}
                </span>
              </button>
            ))}
          </div>

          {/* Main View Area */}
          <div className="flex-1 overflow-hidden flex">
            {/* Code Editor Side / Processing State */}
            <div className="flex-1 border-r border-gh-border overflow-y-auto bg-gh-bg p-0 font-mono text-sm leading-relaxed relative">
              {(analysis?.status === 'pending' || analysis?.status === 'processing') ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gh-bg/50 backdrop-blur-sm z-20">
                   <div className="w-16 h-16 mb-6 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-gh-blue/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-gh-blue animate-spin" />
                   </div>
                   <h2 className="text-2xl font-bold text-gh-text mb-2">Analyzing Repository...</h2>
                   <p className="text-gh-muted max-w-sm">We are currently scanning your codebase for bugs, security vulnerabilities and quality improvements.</p>
                   <div className="mt-8 flex items-center gap-2 text-xs text-gh-blue font-bold uppercase tracking-widest">
                      <span className="animate-pulse">Phase: {analysis?.status === 'pending' ? 'Queuing' : 'Deep Scanning'}</span>
                   </div>
                </div>
              ) : null}

              <div className="gh-box-header flex items-center justify-between sticky top-0 z-10 border-b border-gh-border">
                <div className="flex items-center gap-4">
                  <FileCode className="w-4 h-4 text-gh-muted" />
                  <span className="text-gh-text text-xs font-mono">{selectedFile || 'Select a file to view issues'}</span>
                </div>
              </div>
              
              <div className="relative py-8 px-12 text-gh-muted italic text-center">
                {selectedFile ? (
                  <div className="space-y-4">
                    <p>Source code retrieval for preview is not yet implemented.</p>
                    <p className="text-sm not-italic">Reporting issues for: <span className="text-gh-blue font-mono">{selectedFile}</span></p>
                  </div>
                ) : (
                  <p>Select a file from the sidebar or click an issue to see details.</p>
                )}
              </div>
            </div>

            {/* Review Sidebar */}
            <div className="w-96 overflow-y-auto p-6 space-y-4 bg-gh-bg border-l border-gh-border">
              <h3 className="text-xs font-bold text-gh-muted uppercase tracking-widest mb-4">Review Findings</h3>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredIssues.length > 0 ? (
                    filteredIssues.map((issue) => (
                      <div key={issue.id} onClick={() => setSelectedFile(issue.file_name)} className="cursor-pointer">
                        <Card className={cn(
                          "p-4 border-gh-border bg-gh-header/50 transition-all",
                          selectedFile === issue.file_name && "border-gh-blue/50 ring-1 ring-gh-blue/20 bg-gh-blue/5"
                        )}>
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant={issue.severity === 'high' || issue.severity === 'critical' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}>
                              {issue.severity}
                            </Badge>
                            {issue.line && <span className="text-[10px] font-mono text-gh-muted">Line {issue.line}</span>}
                          </div>
                          <h4 className="font-bold text-gh-text mb-2 leading-tight">{issue.message}</h4>
                          <p className="text-[10px] text-gh-muted font-mono truncate mb-3">{issue.file_name}</p>
                          
                          {issue.suggestion && (
                            <div className="bg-gh-bg rounded-md p-3 border border-gh-border mb-2">
                              <p className="text-[10px] font-bold text-gh-blue uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                Suggested Fix
                              </p>
                              <p className="text-xs text-gh-text italic">"{issue.suggestion}"</p>
                            </div>
                          )}
                        </Card>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-12 h-12 rounded-full bg-gh-header flex items-center justify-center mx-auto mb-4 border border-gh-border">
                        <CheckCircle2 className="w-6 h-6 text-gh-green" />
                      </div>
                      <p className="text-sm font-medium text-gh-text">No {activeTab} found</p>
                      <p className="text-xs text-gh-muted mt-1">Everything looks good in this category.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
