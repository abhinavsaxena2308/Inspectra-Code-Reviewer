import React, { useState, useEffect } from 'react';
import { fetchHistoryStats, fetchHistoryList, HistoryStat, HistoryListRow } from '../lib/dashboardService';
import { cn } from '../lib/utils';
import { 
  FolderOpen, 
  AlertTriangle, 
  MoreVertical, 
  Download, 
  Filter, 
  Search,
  Bell,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';

export const HistoryPage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<HistoryStat[]>([]);
  const [history, setHistory] = useState<HistoryListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [statsData, listData] = await Promise.all([
          fetchHistoryStats(token),
          fetchHistoryList(token)
        ]);
        setStats(statsData);
        setHistory(listData);
      } catch (err) {
        console.error('Error loading history data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredHistory = history.filter(item => 
    item.repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.commitHash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 space-y-10 max-w-7xl mx-auto w-full">
      {/* Page Header Area */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-on-surface">Analysis Ledger</h2>
          <p className="text-on-surface-variant text-sm max-w-2xl">
            Review and manage all historical intelligence sequences.
          </p>
        </div>
      </header>

      {/* Dashboard Controls & Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {isLoading && stats.length === 0 ? (
             <div className="col-span-3 text-center text-on-surface-variant py-8 border border-white/10 rounded-xl border-dashed">Loading history stats...</div>
          ) : (
            stats.map((stat, index) => (
              <div key={index} className="bg-surface border border-white/10 p-5 rounded-xl flex flex-col gap-2 hover:border-white/20 transition-colors">
                <span className="text-xs text-on-surface-variant font-medium">{stat.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-on-surface">{stat.value}</span>
                  <span className={cn("text-[10px] font-mono", stat.colorClass.replace('bg-', 'text-').replace('error', 'red-400').replace('secondary', 'emerald-400'))}>{stat.subtext}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table Section */}
        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-between border-b border-white/10 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-on-surface">System Logs</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-container border border-white/5 rounded text-on-surface-variant">ARCHIVE_{new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 bg-surface hover:bg-surface-container text-on-surface transition-colors border border-white/10">
                <Filter className="w-3.5 h-3.5 opacity-70" />
                Filter
              </button>
              <button className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 bg-white text-black hover:bg-zinc-200 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* GitHub Inspired Minimal Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-on-surface-variant text-[10px] uppercase tracking-wide font-medium bg-surface-container-low">
                  <th className="px-6 py-3">Repository</th>
                  <th className="px-6 py-3">Commit</th>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Integrity Score</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-outline">
                       <div className="flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-outline">
                       No history records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((row) => {
                    const isSuccess = row.status === 'completed' && (row.score || 0) >= 60;
                    const isWarning = row.status === 'completed' && (row.score || 0) < 60;
                    const isFailed = row.status === 'failed';
                    const isRunning = row.status === 'running';

                    const dotClass = isSuccess || isRunning ? 'bg-secondary' : isWarning ? 'bg-tertiary' : 'bg-error';
                    const textClass = isSuccess || isRunning ? 'text-secondary' : isWarning ? 'text-tertiary' : 'text-error';
                    const score = row.score ?? '--';
                    
                    return (
                      <tr 
                        key={row.id} 
                        className="hover:bg-surface-container transition-colors duration-150 group cursor-pointer"
                        onClick={() => navigate(`/analysis/${row.id}`)}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                            <span className="text-on-surface font-medium text-sm hover:underline underline-offset-4">{row.repoName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-mono text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                            {row.commitHash}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-sm text-on-surface">{row.date}</span>
                            <span className="text-[10px] font-mono text-on-surface-variant mt-0.5">{row.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", dotClass.replace('bg-', 'bg-').replace('secondary', 'emerald-500').replace('tertiary', 'amber-500').replace('error', 'red-500'))}></div>
                            <span className="text-xs font-mono text-on-surface-variant group-hover:text-on-surface transition-colors">
                              {row.status === 'completed' && isSuccess ? 'PASS' : row.status === 'completed' ? 'WARN' : row.status === 'failed' ? 'FAIL' : 'SYNC'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          {isFailed ? (
                             <div className="flex items-center gap-2 text-on-surface-variant">
                               <span className="font-mono text-sm">--</span>
                             </div>
                          ) : (
                             <div className="flex items-center gap-3">
                               <div className="w-20 h-1 bg-white/10 overflow-hidden">
                                 <div className={cn("h-full", dotClass.replace('bg-', 'bg-').replace('secondary', 'white').replace('tertiary', 'amber-500').replace('error', 'red-500'))} style={{ width: `${Math.max(0, Math.min(100, row.score || 0))}%` }}></div>
                               </div>
                               <span className="font-mono text-xs text-on-surface">{score}</span>
                             </div>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); /* TODO options menu */ }}
                            className="text-on-surface-variant hover:text-on-surface p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination / Footer */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-white/10 bg-surface-container-low text-xs font-medium text-on-surface-variant">
             <span>Showing {Math.min(filteredHistory.length, 10)} of {filteredHistory.length}</span>
             <div className="flex items-center gap-1.5">
               <button className="px-2 py-1 bg-surface border border-white/5 rounded hover:bg-surface-container text-on-surface transition-colors disabled:opacity-50" disabled>Prev</button>
               <button className="px-2.5 py-1 bg-white text-black rounded font-medium">1</button>
               <button className="px-2 py-1 bg-surface border border-white/5 rounded hover:bg-surface-container text-on-surface transition-colors disabled:opacity-50" disabled>Next</button>
             </div>
          </div>
        </div>

        {/* Side Commentary / Bento Detail */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
          <div className="md:col-span-2">
            <div className="bg-surface border border-white/10 p-6 rounded-xl flex flex-col h-full">
              <h3 className="text-sm font-semibold text-on-surface mb-4">Historical Integrity Trend</h3>
              <div className="flex-1 w-full bg-[#050505] border border-white/5 rounded-lg flex items-end p-2 gap-1 relative overflow-hidden h-40">
                {/* Visual placeholder for a line chart */}
                {[20, 40, 30, 60, 50, 80, 40, 70, 90, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/10 rounded-t-sm relative overflow-hidden hover:bg-white/20 transition-colors" style={{ height: `${h}%` }}>
                    <div className="absolute bottom-0 left-0 w-full bg-white h-1/4 opacity-50"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="md:col-span-1 space-y-4">
            <div className="bg-surface border border-white/10 p-6 rounded-xl h-full">
              <h4 className="text-xs font-semibold text-on-surface-variant mb-4 flex items-center justify-between">
                <span>Integrations</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-surface-container rounded-md border border-white/5">
                  <span className="text-sm text-on-surface">GitHub Actions</span>
                  <span className="text-[10px] font-mono text-on-surface-variant">PASS</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-surface-container rounded-md border border-white/5">
                  <span className="text-sm text-on-surface">Jira Cloud</span>
                  <span className="text-[10px] font-mono text-on-surface-variant">PASS</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-surface-container rounded-md border border-white/5 opacity-50">
                  <span className="text-sm text-on-surface">Slack Webhooks</span>
                  <span className="text-[10px] font-mono text-on-surface-variant">WARN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};
