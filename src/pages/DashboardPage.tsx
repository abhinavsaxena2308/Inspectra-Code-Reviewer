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
import { useAuth } from '@clerk/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DashboardPage = () => {
  const { getToken } = useAuth();
  const { addToast } = useToast();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [reposData, statsData, activityData, historyData] = await Promise.all([
          fetchRepositories(token),
          fetchDashboardStats(token),
          fetchRecentActivity(token),
          import('../lib/dashboardService').then(m => m.fetchHistoryList(token))
        ]);
        setRepositories(reposData);
        setStats(statsData);
        setActivities(activityData);
        
        // Process history data for chart
        const chartData = historyData
          .filter((item: any) => item.score !== null)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((item: any) => ({
            name: item.date.split('/').slice(0, 2).join('/'),
            fullDate: item.date,
            score: item.score,
            repo: item.repoName
          }));
        
        setHistoryList(chartData);
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
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const result = await analyzeRepository(repoUrl, token);
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-semibold tracking-tight text-on-surface">Console</h1>
             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/10 bg-surface-container text-[10px] font-medium text-on-surface-variant">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               Active
             </span>
          </div>
          <p className="text-on-surface-variant text-sm">Orchestrate and monitor your intelligence sequences.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 bg-surface hover:bg-surface-container text-on-surface transition-colors border border-white/10">
              <Filter className="w-3.5 h-3.5 opacity-70" />
              Filter
           </button>
           <button className="px-2.5 py-1.5 rounded-md bg-surface hover:bg-surface-container text-on-surface transition-colors border border-white/10">
              <MoreHorizontal className="w-4 h-4 opacity-70" />
           </button>
        </div>
      </header>

      {/* Main Command Center & Key Metric Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Command Center (Analysis Input) */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.99 }}
           animate={{ opacity: 1, scale: 1 }}
           className="xl:col-span-8 bg-surface border border-white/10 rounded-xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="relative z-10 max-w-xl">
            <h2 className="text-xl font-semibold tracking-tight text-on-surface mb-1">
               Structural Analysis
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">Enter a public GitHub repository to initiate a deep-scan sequence.</p>
            
            {/* Input Group */}
            <div className="relative mt-2">
               <div className="relative flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow flex items-center">
                    <Github className="absolute left-3 w-4 h-4 text-on-surface-variant" />
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant rounded-md py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-outline text-on-surface placeholder:text-on-surface-variant/50 font-mono transition-colors"
                      placeholder="github.com/org/repo"
                      type="text"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                      spellCheck={false}
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !repoUrl.trim()}
                    className="bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-md flex items-center justify-center gap-2 shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Rocket className="w-4 h-4 text-black" />
                    )}
                    <span className="text-xs font-semibold text-black">Trigger Sequence</span>
                  </button>
               </div>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
              >
                {error}
              </motion.div>
            )}
          </div>
          
          <div className="mt-8 flex items-center gap-6 pt-6 border-t border-white/10">
             {[
               { icon: Terminal, label: 'CLI Sync' },
               { icon: BrainCircuit, label: 'LLM-v4.2' },
               { icon: Shield, label: 'SOC2 Ready' }
             ].map((feature, i) => (
                <div key={i} className="flex items-center gap-1.5 text-on-surface-variant">
                   <feature.icon className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-medium tracking-wide uppercase">{feature.label}</span>
                </div>
             ))}
          </div>
        </motion.div>

        {/* Global Health Score Card */}
        <motion.div 
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           className="xl:col-span-4 bg-surface border border-white/10 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-on-surface-variant">Global Integrity</span>
              <TrendingUp className="w-4 h-4 text-on-surface-variant" />
            </div>
            <div className="space-y-2">
               <div className="text-3xl font-semibold tracking-tight text-on-surface">
                 {stats.find(s => s.label === 'Average Score')?.value ?? '—'}
               </div>
               <div className="h-1 w-full bg-white/10 overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${stats.find(s => s.label === 'Average Score')?.value ?? 0}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-white"
                 />
               </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              System health computed across {repositories.length} analyzed repositories.
            </p>
          </div>
          
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-base font-semibold text-on-surface">{repositories.length}</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wide">Repositories</span>
             </div>
             <div className="flex -space-x-1.5">
                {[...Array(Math.min(5, repositories.length || 1))].map((_, i) => (
                   <div key={i} className="w-6 h-6 rounded-md border border-white/10 bg-surface-container flex items-center justify-center overflow-hidden">
                      <Github className="w-3 h-3 text-on-surface-variant" />
                   </div>
                ))}
             </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {bentoStats.map((stat, i) => {
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface border border-white/10 p-5 rounded-xl flex flex-col gap-2 hover:border-white/20 transition-colors"
            >
              <span className="text-xs text-on-surface-variant font-medium">{stat.label}</span>
              <div className="text-2xl font-semibold tracking-tight text-on-surface">{stat.value}</div>
            </motion.div>
          );
        })}
      </section>

      {/* Intelligence Timeline & Trend Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quality Score Trend Chart */}
        <div className="bg-surface border border-white/10 rounded-xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-on-surface">Quality Score Trend</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-primary" />
               <span className="text-xs text-on-surface-variant">Global Avg</span>
            </div>
          </div>
          
          <div className="flex-grow w-full h-[300px]">
            {historyList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historyList}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-on-surface-variant)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    minTickGap={20}
                  />
                  <YAxis 
                    stroke="var(--color-on-surface-variant)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface-container)', borderColor: 'var(--color-outline-variant)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-on-surface)' }}
                    labelStyle={{ color: 'var(--color-on-surface-variant)', fontSize: '12px', marginBottom: '4px' }}
                    formatter={(value: number, name: string, props: any) => [
                      <span key="val" className="font-semibold text-primary">{value}</span>, 
                      <span key="lbl" className="text-on-surface-variant ml-2 text-xs">{props.payload.repo}</span>
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    activeDot={{ r: 6, fill: 'var(--color-magenta)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center">
                 <Box className="w-8 h-8 text-white/10 mb-3" />
                 <p className="text-sm text-on-surface-variant">Not enough data to plot trend.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Ledger */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-sm font-semibold text-on-surface">System Ledger</h2>
            <button 
              onClick={() => navigate('/history')}
              className="text-xs text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-surface border border-white/10 rounded-xl overflow-hidden flex-grow">
          <div className="divide-y divide-white/10">
            {activities.length > 0 ? activities.slice(0, 4).map((activity, i) => (
              <motion.div 
                key={activity.id} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/analysis/${activity.id}`)}
                className="p-4 flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-24 shrink-0">
                    <div className={cn("w-1.5 h-1.5 rounded-full", activity.type === 'analysis-completed' ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                    <span className="text-xs text-on-surface-variant font-mono">
                      {activity.type === 'analysis-completed' ? 'PASS' : 'SYNC'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface hover:underline underline-offset-4">
                      {activity.repoName}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">{activity.timestamp} • ID:{activity.id.slice(0, 8)}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            )) : (
              <div className="p-12 text-center border-t border-white/10">
                <p className="text-sm text-on-surface-variant mb-2">No sequences recorded yet.</p>
                <button 
                   onClick={() => document.querySelector('input')?.focus()}
                   className="text-xs text-on-surface font-medium hover:underline underline-offset-4"
                >
                   Initiate your first scan
                </button>
              </div>
            )}
          </div>
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
