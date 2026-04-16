import React, { useState, useEffect } from 'react';
import { 
  Github, Loader2, Rocket, CheckCircle2, TrendingUp, 
  ShieldAlert, Cpu, BrainCircuit, ArrowUpRight, Search, 
  Terminal, Sparkles, Filter, MoreHorizontal, Shield, Box
} from 'lucide-react';
import { fetchRepositories, fetchDashboardStats, fetchRecentActivity, DashboardStats, ActivityItem, Repository } from '../lib/dashboardService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { analyzeRepository } from '../lib/api';
import { useToast } from '../hooks/useToast';
import { motion } from 'framer-motion';

export const DashboardPage = () => {
  const { addToast } = useToast();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reposData, statsData, activityData] = await Promise.all([
          fetchRepositories(),
          fetchDashboardStats(),
          fetchRecentActivity(),
        ]);
        setRepositories(reposData);
        setStats(statsData);
        setActivities(activityData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeRepository(repoUrl);
      if (result.status === 'success') {
        addToast('Intelligence sequence triggered. Syncing...', 'success');
        navigate(`/analysis/${result.data.id}`);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      const msg = err.response?.data?.message || 'Failed to start analysis. Check the URL.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  const bentoStats = [
    {
      label: 'Issues Detected',
      value: stats.find(s => s.label === 'Issues Detected')?.value ?? '—',
      icon: ShieldAlert,
      color: 'text-error',
      bgGlow: 'bg-error/5',
      desc: 'Critical vulnerabilities found',
    },
    {
      label: 'Total Analyses',
      value: stats.find(s => s.label === 'Total Analyses')?.value ?? '—',
      icon: Cpu,
      color: 'text-primary',
      bgGlow: 'bg-primary/5',
      desc: 'Deep-scan sequences',
    },
    {
      label: 'Avg Health Score',
      value: stats.find(s => s.label === 'Average Score')?.value ?? '—',
      icon: BrainCircuit,
      color: 'text-secondary',
      bgGlow: 'bg-secondary/5',
      desc: 'Mean maintainability',
    },
    {
      label: 'Workers Active',
      value: activities.filter(a => a.type !== 'analysis-completed').length.toString() || '0',
      icon: Loader2,
      color: 'text-tertiary',
      bgGlow: 'bg-tertiary/5',
      desc: 'Executing sequences',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
        <div className="relative">
           <div className="w-12 h-12 rounded-2xl border-2 border-primary/20 animate-spin" />
           <div className="absolute inset-0 w-12 h-12 rounded-2xl border-t-2 border-primary animate-spin" />
        </div>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Calibrating Intelligence</p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 space-y-10 max-w-7xl mx-auto w-full">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-heading font-bold tracking-tight text-white">Console</h1>
             <span className="ghost-label">Real-time</span>
          </div>
          <p className="text-white/40 font-medium text-sm">Orchestrate and monitor your codebase intelligence sequences.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="ethereal-btn-outline px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              Filter View
           </button>
           <button className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-xl border border-white/5 transition-all">
              <MoreHorizontal className="w-4 h-4" />
           </button>
        </div>
      </header>

      {/* Main Command Center & Key Metric Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Command Center (Analysis Input) */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="xl:col-span-8 glass-card-premium rounded-[32px] p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[380px]"
        >
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-8">
               <Sparkles className="w-3 h-3 text-primary" />
               <span className="text-[10px] uppercase font-black tracking-widest text-primary">Intelligence Sequence</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 leading-[1.1]">
               Analyze structural <br/> integrity of any repo.
            </h2>
            
            {/* Input Group */}
            <div className="relative mt-8 group">
               <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-magenta/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
               <div className="relative flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Github className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm font-mono focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-white/10 outline-none"
                      placeholder="https://github.com/organization/repository"
                      type="text"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !repoUrl.trim()}
                    className="ethereal-btn px-10 rounded-2xl flex items-center justify-center gap-3 shrink-0 py-5 sm:py-0"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                    <span className="uppercase tracking-[0.1em] text-xs font-black">Trigger Sequence</span>
                  </button>
               </div>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold"
              >
                {error}
              </motion.div>
            )}
          </div>
          
          <div className="mt-12 flex items-center gap-8 border-t border-white/5 pt-8">
             {[
               { icon: Terminal, label: 'CLI Sync' },
               { icon: BrainCircuit, label: 'LLM-v4.2' },
               { icon: Shield, label: 'SOC2 Ready' }
             ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                   <feature.icon className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{feature.label}</span>
                </div>
             ))}
          </div>
          
          {/* Decorative Art */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-magenta/5 rounded-full blur-[100px] -ml-30 -mb-30 pointer-events-none" />
        </motion.div>

        {/* Global Health Score Card */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="xl:col-span-4 glass-card rounded-[32px] p-8 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Global Integrity Score</span>
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shadow-inner">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <div className="space-y-1">
               <div className="text-7xl font-bold text-white tracking-tighter glow-text">
                 {stats.find(s => s.label === 'Average Score')?.value ?? '—'}
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${stats.find(s => s.label === 'Average Score')?.value ?? 0}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-secondary to-primary"
                 />
               </div>
            </div>
            <p className="text-xs text-white/40 leading-relaxed font-medium">
              Average structural health across {repositories.length} analyzed repositories. Progressing towards optimal stability.
            </p>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-xl font-bold text-white">{repositories.length}</span>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Repos Analyzed</span>
             </div>
             <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                   <div key={i} className="w-8 h-8 rounded-lg border-2 border-void bg-surface-container-high flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5" />
                   </div>
                ))}
             </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {bentoStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 rounded-[24px] relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-6">
                <div className={cn("p-3 rounded-xl", stat.bgGlow)}>
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-heading font-bold text-white tracking-tight">{stat.value}</div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{stat.label}</span>
              </div>
              <p className="text-[10px] text-white/40 mt-3 font-medium">{stat.desc}</p>
            </motion.div>
          );
        })}
      </section>

      {/* Intelligence Timeline (Activities) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <Activity className="w-5 h-5 text-primary" />
             <h2 className="text-xl font-heading font-bold tracking-tight text-white">Project Timeline</h2>
          </div>
          <button 
            onClick={() => navigate('/repos')}
            className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            Access Full Archive
          </button>
        </div>

        <div className="glass-card rounded-[32px] overflow-hidden">
          <div className="divide-y divide-white/5">
            {activities.length > 0 ? activities.slice(0, 4).map((activity, i) => (
              <motion.div 
                key={activity.id} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/analysis/${activity.id}`)}
                className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/5 transition-all group-hover:scale-105",
                    activity.type === 'analysis-completed' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                  )}>
                    {activity.type === 'analysis-completed' ? <Box className="w-6 h-6" /> : <Loader2 className="w-6 h-6 animate-spin" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                         {activity.repoName}
                       </p>
                       <span className={cn(
                         "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                         activity.type === 'analysis-completed' ? 'border-secondary/20 text-secondary bg-secondary/5' : 'border-primary/20 text-primary bg-primary/5'
                       )}>
                         {activity.type === 'analysis-completed' ? 'Stabilized' : 'Syncing'}
                       </span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs text-white/30 font-medium">{activity.timestamp}</span>
                       <div className="w-1 h-1 rounded-full bg-white/10" />
                       <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Sequence ID: #{activity.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-4">
                   <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">System Load</span>
                      <div className="flex gap-1 mt-1">
                         {[...Array(4)].map((_, bit) => (
                            <div key={bit} className={cn("w-1 h-3 rounded-full", bit < (activity.type === 'analysis-completed' ? 4 : 2) ? 'bg-primary/50' : 'bg-white/5')} />
                         ))}
                      </div>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                   </div>
                </div>
              </motion.div>
            )) : (
              <div className="p-20 text-center space-y-4">
                <Github className="w-12 h-12 text-white/5 mx-auto" />
                <p className="text-sm font-bold text-white/20 uppercase tracking-[0.2em]">No Intelligence Sequences Found</p>
                <button 
                   onClick={() => document.querySelector('input')?.focus()}
                   className="text-xs font-bold text-primary hover:text-white transition-colors"
                >
                   Initiate First Sequence
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tech Footer */}
      <footer className="pt-10 pb-6 flex flex-col items-center gap-6">
        <div className="flex items-center gap-6 opacity-20">
           <Search className="w-4 h-4 hover:opacity-100 transition-opacity cursor-pointer" />
           <Filter className="w-4 h-4 hover:opacity-100 transition-opacity cursor-pointer" />
           <Settings className="w-4 h-4 hover:opacity-100 transition-opacity cursor-pointer" />
        </div>
        <div className="flex items-center gap-4 text-[10px] text-white/10 uppercase tracking-[0.4em] font-black">
          <div className="w-12 h-px bg-white/5" />
          Neural Integrity Framework
          <div className="w-12 h-px bg-white/5" />
        </div>
      </footer>
    </div>
  );
};

// Re-using Sidebar icons in footer
const Settings = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const Activity = ({ className }: { className?: string }) => (
   <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
     <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
   </svg>
);
