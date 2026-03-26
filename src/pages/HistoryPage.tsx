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

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<HistoryStat[]>([]);
  const [history, setHistory] = useState<HistoryListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, listData] = await Promise.all([
          fetchHistoryStats(),
          fetchHistoryList()
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header Area */}
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-[#c9d1d9] mb-3">Analysis History</h2>
        <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
          Review and manage all historical code analysis runs across your enterprise infrastructure.
        </p>
      </div>

      {/* Dashboard Controls & Metrics Grid */}
      <div className="grid grid-cols-12 gap-6 mb-8">
          {isLoading && stats.length === 0 ? (
             <div className="col-span-12 text-center text-outline py-8">Loading history stats...</div>
          ) : (
            stats.map((stat, index) => (
              <div key={index} className="col-span-12 md:col-span-4 bg-[#181c22] p-6 rounded-lg relative overflow-hidden group">
                <div className={cn("absolute top-0 left-0 w-1 h-full", stat.colorClass)}></div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#8b949e] mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-mono font-bold text-[#c9d1d9]">{stat.value}</span>
                  <span className={cn("text-sm font-medium", stat.colorClass.replace('bg-', 'text-'))}>{stat.subtext}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Table Section */}
        <div className="bg-[#181c22] rounded-lg overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="px-6 py-5 flex flex-wrap items-center justify-between bg-[#1c2026] gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#c9d1d9]">Showing:</span>
              <span className="text-xs font-mono px-2 py-1 bg-[#262a31] rounded text-primary">ALL_RUNS_{new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#262a31] hover:bg-[#31353c] text-[#c9d1d9] text-sm font-medium rounded transition-all active:scale-95">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold uppercase tracking-wider rounded transition-all hover:brightness-110 active:scale-95">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* GitHub Inspired Minimal Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10 text-[#8b949e] text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Repo Name</th>
                  <th className="px-6 py-4">Commit</th>
                  <th className="px-6 py-4">Date/Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Health Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
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
                        className="hover:bg-[#262a31] transition-colors duration-150 group cursor-pointer"
                        onClick={() => navigate(`/analysis/${row.id}`)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <FolderOpen className="w-5 h-5 text-[#8b949e] group-hover:text-primary transition-colors" />
                            <span className="text-[#c9d1d9] font-semibold text-sm">{row.repoName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs text-primary px-2 py-0.5 bg-primary/10 rounded">
                            {row.commitHash}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm text-[#dfe2eb]">{row.date}</span>
                            <span className="text-xs text-[#8b949e]">{row.time}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", dotClass)}></div>
                            <span className={cn("text-xs font-bold uppercase", textClass)}>
                              {row.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {isFailed ? (
                             <div className="flex items-center gap-3 text-error">
                               <AlertTriangle className="w-4 h-4" />
                               <span className="font-mono text-sm">--</span>
                             </div>
                          ) : (
                             <div className="flex items-center gap-3">
                               <div className="w-24 h-1.5 bg-[#262a31] rounded-full overflow-hidden">
                                 <div className={cn("h-full", dotClass)} style={{ width: `${Math.max(0, Math.min(100, row.score || 0))}%` }}></div>
                               </div>
                               <span className="font-mono text-sm text-[#c9d1d9]">{score}</span>
                             </div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); /* TODO options menu */ }}
                            className="text-[#8b949e] hover:text-[#c9d1d9] p-1"
                          >
                            <MoreVertical className="w-5 h-5" />
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
          <div className="px-6 py-4 flex items-center justify-between bg-[#1c2026] text-xs font-medium text-[#8b949e]">
             <span>Showing 1 to {Math.min(filteredHistory.length, 10)} of {filteredHistory.length} runs</span>
             <div className="flex items-center gap-2">
               <button className="px-3 py-1 bg-[#262a31] rounded hover:text-[#c9d1d9] transition-colors disabled:opacity-50" disabled>Previous</button>
               <div className="flex items-center gap-1">
                 <button className="w-7 h-7 flex items-center justify-center bg-primary text-on-primary rounded">1</button>
               </div>
               <button className="px-3 py-1 bg-[#262a31] rounded hover:text-[#c9d1d9] transition-colors disabled:opacity-50" disabled>Next</button>
             </div>
          </div>
        </div>

        {/* Side Commentary / Bento Detail */}
        <div className="mt-12 grid grid-cols-12 gap-8 pb-12">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-gradient-to-r from-surface-container-low to-surface-container p-8 rounded-lg border-l-4 border-primary">
              <h3 className="text-xl font-bold text-[#c9d1d9] mb-4">Historical Trends</h3>
              <div className="w-full aspect-[21/9] bg-[#0a0e14] rounded flex items-end p-4 gap-2 relative group overflow-hidden">
                <img 
                  alt="Chart Background" 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAM0O_4_wfgSHuXy8fRQhORYAs9PoWvzW7CJqnord-RtkqrFNQbPFJ2TcN5DFokLICAqC-Cv0NyttPNAk4q1qoagXR1Lk0KEgT6VbSExwTLAV39ZA_9DggcBgrWfcytjnQe9FSBUziISfnkipvyd_yi8NSE0Bm0fysKZKt43s_8qqYD8P8SNU_BQGB2dzeidbbVwLQUj_8W5xrdHcLrTUU91qwreTxWje5v0rA36Bw2FkuGdCY1Q5rC3kt0LnqL2FOHZUmFuEVRoKKd"
                />
                {/* Visual placeholder for a line chart */}
                <div className="flex-1 h-1/4 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-1/2 bg-primary"></div></div>
                <div className="flex-1 h-2/4 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-1/3 bg-primary"></div></div>
                <div className="flex-1 h-1/3 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-3/4 bg-primary"></div></div>
                <div className="flex-1 h-3/4 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-1/2 bg-primary"></div></div>
                <div className="flex-1 h-2/3 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-2/3 bg-primary"></div></div>
                <div className="flex-1 h-4/5 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-3/4 bg-primary"></div></div>
                <div className="flex-1 h-1/2 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-1/4 bg-primary"></div></div>
                <div className="flex-1 h-2/3 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-2/3 bg-primary"></div></div>
                <div className="flex-1 h-1/3 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-1/2 bg-primary"></div></div>
                <div className="flex-1 h-3/4 bg-primary/20 rounded-t relative overflow-hidden"><div className="absolute bottom-0 left-0 w-full h-3/4 bg-primary"></div></div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-[#1c2026] p-6 rounded-lg">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Integrations</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#10141a] rounded">
                  <span className="text-sm font-medium">GitHub Actions</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary/10 text-secondary rounded">CONNECTED</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#10141a] rounded">
                  <span className="text-sm font-medium">Jira Cloud</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary/10 text-secondary rounded">CONNECTED</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#10141a] rounded">
                  <span className="text-sm font-medium">Slack Webhooks</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-error/10 text-error rounded">OFFLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};
