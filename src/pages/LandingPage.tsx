import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github, Sparkles, Link as LinkIcon, Zap, Brain, Bug, Shield, Gauge,
  ClipboardPaste, LineChart, CheckSquare, Terminal, Code2, Users
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { GradientBlinds } from '../components/ui/GradientBlinds';

export function LandingPage() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleAnalyze = async () => {
    if (!repoUrl) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError('');

      const urlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
      if (!urlPattern.test(repoUrl)) {
        throw new Error('Invalid URL format. Use: https://github.com/owner/repo');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockId = Math.random().toString(36).substring(7);
      navigate(`/analysis/${mockId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-[#000000] text-[#FFFFFF] font-sans selection:bg-[#00E5FF]/30 min-h-screen relative overflow-hidden">
      {/* Shadow Overlay */}
      <div className="shadow-overlay absolute inset-0 z-10"></div>
      
      {/* WebGL Gradient Blinds Background */}
      <div className="absolute inset-0 z-0">
        <GradientBlinds
          gradientColors={['#292929', '#00D1FF', '#FF00FF']}
          angle={-15}
          noise={0.12}
          blindCount={18}
          blindMinWidth={40}
          spotlightRadius={0.7}
          spotlightSoftness={2.0}
          spotlightOpacity={0.9}
          mouseDampening={0.05}
          distortAmount={1}
          mixBlendMode="lighten"
        />
      </div>


      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav h-20 px-8">
        <nav className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#00E5FF]/50 flex items-center justify-center p-1">
              <div className="w-full h-full rounded-full bg-[#00E5FF] animate-pulse"></div>
            </div>
            <span className="text-xl font-heading font-bold tracking-tighter uppercase tracking-[0.2em] glow-text text-white">Inspectra</span>
          </div>
          <div className="hidden md:flex items-center gap-10 z-50">
            <button className="text-[10px] text-white uppercase tracking-[0.3em] font-bold opacity-40 hover:opacity-100 transition-opacity">Infrastructure</button>
            <button className="text-[10px] text-white uppercase tracking-[0.3em] font-bold opacity-40 hover:opacity-100 transition-opacity">Observability</button>
            <button className="text-[10px] text-white uppercase tracking-[0.3em] font-bold opacity-40 hover:opacity-100 transition-opacity">Security</button>
          </div>
          <div className="flex items-center gap-6 z-50 relative">
            {user ? (
               <>
                 <span 
                   className="text-[10px] text-white uppercase tracking-[0.3em] font-bold opacity-60 hover:text-[#00E5FF] hover:opacity-100 transition-all cursor-pointer" 
                   onClick={() => navigate('/settings')}
                 >
                   {user.name || user.email?.split('@')[0]}
                 </span>
                 <button 
                   onClick={() => navigate('/dashboard')} 
                   className="px-6 py-2 border border-white/10 text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all"
                 >
                   Access_Core
                 </button>
               </>
            ) : (
               <>
                 <button 
                   onClick={() => navigate('/login')} 
                   className="text-[10px] uppercase text-white tracking-[0.3em] font-bold opacity-60 hover:text-[#00E5FF] hover:opacity-100 transition-all z-50"
                 >
                   Sign In
                 </button>
                 <button 
                   onClick={() => navigate('/register')} 
                   className="px-6 py-2 border border-white/10 text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all z-50"
                 >
                   Deploy Now
                 </button>
               </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-20 pt-32 pb-20 px-6 md:px-10 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/5 bg-white/5 rounded-full mb-6">
          <span className="font-mono text-[9px] text-[#00E5FF] font-bold uppercase tracking-widest">System Status: Optimal</span>
          <div className="w-1 h-1 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"></div>
        </div>

        {/* Hero Headline */}
        <h1 className="font-heading text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 glow-text text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF00FF] leading-[1.1]">
          Precision Analytics & <br/> Observability
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl font-medium text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed">
          Inspect code, detect issues, and improve quality instantly. Our high-performance LLMs analyze every line for vulnerabilities and patterns.
        </p>

        {/* Input & CTA */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 mt-4">
           <div className="relative w-full group">
             <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#00E5FF] transition-colors" />
             <input
               className="w-full bg-black/40 border border-white/10 rounded-full pl-16 pr-8 py-5 text-sm font-mono focus:ring-1 focus:ring-[#00E5FF]/50 focus:border-[#00E5FF] outline-none transition-all placeholder:text-white/20 text-white backdrop-blur-md relative z-30"
               placeholder="https://github.com/username/repository"
               value={repoUrl}
               onChange={(e) => setRepoUrl(e.target.value)}
               type="text"
               disabled={isAnalyzing}
               onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
             />
           </div>

           {error && (
             <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-md bg-[#93000a]/40 border border-[#ffb4ab]/20 text-[#ffb4ab] text-sm font-medium w-full backdrop-blur-md"
              >
               {error}
             </motion.div>
           )}

           <div className="flex flex-col sm:flex-row gap-6 mt-4 relative z-30">
             <button 
               onClick={handleAnalyze} 
               disabled={isAnalyzing} 
               className="ethereal-btn px-12 py-5 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold text-white flex items-center justify-center gap-3 group"
             >
               {isAnalyzing ? 'Initializing Core...' : 'Start Inspecting'}
               {!isAnalyzing && <Zap className="w-4 h-4 group-hover:rotate-45 transition-transform" />}
             </button>
             <button className="px-12 py-5 border border-white/5 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all">
               Read Manifesto
             </button>
           </div>
        </div>

        {/* Global Stats Footer Array */}
        <div className="mt-28 w-full max-w-4xl mx-auto border-t border-white/10 pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5 text-center">
            <div className="space-y-2">
            <div className="text-4xl font-heading font-bold tracking-tighter text-white">4M+</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Lines Analyzed</div>
            </div>
            <div className="space-y-2">
            <div className="text-4xl font-heading font-bold tracking-tighter text-white">12k</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Vulns Caught</div>
            </div>
            <div className="space-y-2">
            <div className="text-4xl font-heading font-bold tracking-tighter text-[#00E5FF] glow-text">99.9%</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Uptime</div>
            </div>
            <div className="space-y-2">
            <div className="text-4xl font-heading font-bold tracking-tighter text-white">0.4s</div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Avg latency</div>
            </div>
        </div>
      </main>
    </div>
  );
}