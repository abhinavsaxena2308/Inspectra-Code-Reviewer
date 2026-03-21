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

export const AnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'issues' | 'suggestions' | 'security' | 'performance'>('issues');
  const [selectedFile, setSelectedFile] = useState('src/components/Auth.tsx');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/components']));

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const filteredIssues = MOCK_ISSUES.filter(i => {
    if (activeTab === 'issues') return i.type === 'issue';
    if (activeTab === 'suggestions') return i.type === 'suggestion';
    if (activeTab === 'security') return i.type === 'security';
    if (activeTab === 'performance') return i.type === 'performance';
    return true;
  });

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
              <span className="text-gh-blue hover:underline cursor-pointer">facebook</span>
              <span className="text-gh-muted">/</span>
              <span className="text-gh-blue font-bold hover:underline cursor-pointer">react</span>
            </div>
            <Badge variant="neutral" className="ml-2 lowercase">Public</Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </Button>
          <Button size="sm">Share Report</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: File Explorer */}
        <div className="w-72 border-r border-gh-border bg-gh-bg overflow-y-auto p-4 shrink-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-bold text-gh-muted uppercase tracking-wider">Files</span>
          </div>
          <div className="space-y-0.5">
            {renderFileTree(MOCK_FILE_TREE)}
          </div>
        </div>

        {/* Right Panel: Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gh-bg">
          {/* Tabs */}
          <div className="px-8 border-b border-gh-border bg-gh-header flex items-center gap-8 shrink-0">
            {[
              { id: 'issues', label: 'Issues', icon: AlertTriangle, count: 2, color: 'text-gh-red' },
              { id: 'suggestions', label: 'Suggestions', icon: Lightbulb, count: 5, color: 'text-gh-orange' },
              { id: 'security', label: 'Security', icon: ShieldAlert, count: 1, color: 'text-gh-green' },
              { id: 'performance', label: 'Performance', icon: Zap, count: 3, color: 'text-gh-blue' },
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
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Main View Area */}
          <div className="flex-1 overflow-hidden flex">
            {/* Code Editor Side */}
            <div className="flex-1 border-r border-gh-border overflow-y-auto bg-gh-bg p-0 font-mono text-sm leading-relaxed">
              <div className="gh-box-header flex items-center justify-between sticky top-0 z-10 border-b border-gh-border">
                <div className="flex items-center gap-4">
                  <FileCode className="w-4 h-4 text-gh-muted" />
                  <span className="text-gh-text text-xs font-mono">{selectedFile}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="secondary" size="sm" className="h-6 px-2 text-[10px] uppercase font-bold bg-gh-bg border-gh-border">Raw</Button>
                  <Button variant="secondary" size="sm" className="h-6 px-2 text-[10px] uppercase font-bold bg-gh-bg border-gh-border">Blame</Button>
                  <Button variant="secondary" size="sm" className="h-6 px-2 text-[10px] uppercase font-bold bg-gh-bg border-gh-border">History</Button>
                </div>
              </div>
              <div className="relative py-4 bg-gh-bg">
                {(MOCK_FILE_CONTENTS[selectedFile] || "// No content available for this file").split('\n').map((line, i) => {
                  const currentLineNumber = i + 1;
                  const issueOnThisLine = MOCK_ISSUES.find(issue => issue.file === selectedFile && issue.line === currentLineNumber);
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "flex group min-h-[1.5rem]",
                        issueOnThisLine && "bg-gh-red/10 border-l-2 border-gh-red"
                      )}
                    >
                      <span className="w-12 text-gh-muted select-none text-right pr-4 border-r border-gh-border mr-4 text-[11px]">{currentLineNumber}</span>
                      <pre className={cn(
                        "text-gh-text whitespace-pre pl-2",
                        issueOnThisLine && "text-gh-red font-medium"
                      )}>{line || ' '}</pre>
                    </div>
                  );
                })}
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
                      <div key={issue.id}>
                        <Card className="p-4 border-gh-border bg-gh-header/50">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'info'}>
                              {issue.severity}
                            </Badge>
                            <span className="text-[10px] font-mono text-gh-muted">Line {issue.line}</span>
                          </div>
                          <h4 className="font-bold text-gh-text mb-2">{issue.title}</h4>
                          <p className="text-xs text-gh-muted leading-relaxed mb-4">{issue.description}</p>
                          
                          <div className="bg-gh-bg rounded-md p-3 border border-gh-border mb-4">
                            <p className="text-[10px] font-bold text-gh-blue uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Suggested Fix
                            </p>
                            <p className="text-xs text-gh-text italic">"{issue.suggestion}"</p>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="flex-1 text-xs">Ignore</Button>
                            <Button size="sm" variant="secondary" className="flex-1 text-xs">Apply Fix</Button>
                          </div>
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
