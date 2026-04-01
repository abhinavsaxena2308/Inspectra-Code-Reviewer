import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github, Sparkles, Link as LinkIcon, Zap, Brain, Bug, Shield, Gauge,
  ClipboardPaste, LineChart, CheckSquare, Terminal, Code2, Users,
  Menu, X, LogOut, LayoutDashboard, Settings
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { GradientBlinds } from '../components/ui/GradientBlinds';
import Marquee from '../components/ui/Marquee';
import ProblemSolution from '../components/sections/ProblemSolution';
import HowItWorks from '../components/sections/HowItWorks';
import Features from '../components/sections/Features';
import FloatingNavbar from '../components/layout/FloatingNavbar'

export function LandingPage() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

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

      const { analyzeRepository } = await import('../lib/api');
      const response = await analyzeRepository(repoUrl);
      
      if (response.status === 'success') {
        navigate(`/analysis/${response.data.id}`);
      } else {
        throw new Error('Failed to start analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-void text-white font-sans selection:bg-cyan/30 min-h-screen relative overflow-hidden">
      {/* Shadow Overlay */}
      <div className="shadow-overlay absolute inset-0 z-10"></div>
      
      {/* WebGL Gradient Blinds Background */}
      <div className="absolute top-0 left-0 right-0 h-[80vh] md:h-screen max-h-[900px] z-0 mask-[linear-gradient(to_bottom,black_85%,transparent_100%)] touch-none pointer-events-none">
        <GradientBlinds
          gradientColors={['#FF9FFC', '#5227FF']}
          angle={-15}
          noise={0.2}
          blindCount={20}
          blindMinWidth={40}
          spotlightRadius={0.6}
          spotlightSoftness={0.8}
          spotlightOpacity={0.9}
          mouseDampening={0.12}
          distortAmount={2}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      <FloatingNavbar />

      {/* Main Content */}
      <main className="relative z-20 pt-32 pb-20 w-full flex flex-col items-center min-h-[calc(100vh-160px)]">
        {/* Hero Section Container */}
        <div className="px-6 md:px-10 max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/5 bg-white/5 rounded-full mb-6">
            <span className="font-mono text-[9px] text-cyan font-bold uppercase tracking-widest">System Status: Optimal</span>
            <div className="w-1 h-1 rounded-full bg-cyan shadow-[0_0_8px_var(--color-cyan)]"></div>
          </div>

          {/* Hero Headline */}
          <h1 className="font-heading text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 text-white leading-[1.1]">
            Precision Analytics & <br/> Observability
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl font-medium text-white/40 mb-12 max-w-2xl mx-auto leading-relaxed">
            Inspect code, detect issues, and improve quality instantly. Our high-performance LLMs analyze every line for vulnerabilities and patterns.
          </p>

          {/* Input & CTA */}
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 mt-4">
            <div className="relative w-full group">
              <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-cyan transition-colors z-40" />
              <input
                className="w-full bg-black/40 border border-white/10 rounded-full pl-16 pr-52 py-5 text-sm font-mono focus:ring-1 focus:ring-cyan/50 focus:border-cyan outline-none transition-all placeholder:text-white/20 text-white backdrop-blur-md relative z-30"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                type="text"
                disabled={isAnalyzing}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing} 
                className="absolute right-2 top-1/2 -translate-y-1/2 ethereal-btn px-8 py-3.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white flex items-center justify-center gap-2 group z-40 h-[calc(100%-16px)]"
              >
                {isAnalyzing ? 'Initializing...' : 'Start Inspecting'}
                {!isAnalyzing && <Zap className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-md bg-error-container/40 border border-error/20 text-error text-sm font-medium w-full backdrop-blur-md mt-4"
              >
                {error}
              </motion.div>
            )}
          </div>
        </div>

        {/* Full-Width Marquee */}
        <div className="w-full my-20">
          <Marquee />
        </div>

        <ProblemSolution />
        <HowItWorks />
        <Features />

        {/* Global Stats Footer Array Container */}
        <div className="w-full px-6 md:px-10 max-w-5xl mx-auto">
          <div className="mt-8 w-full max-w-4xl mx-auto border-t border-white/10 pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5 text-center">
              <div className="space-y-2">
              <div className="text-4xl font-heading font-bold tracking-tighter text-white">4M+</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Lines Analyzed</div>
              </div>
              <div className="space-y-2">
              <div className="text-4xl font-heading font-bold tracking-tighter text-white">12k</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Vulns Caught</div>
              </div>
              <div className="space-y-2">
              <div className="text-4xl font-heading font-bold tracking-tighter text-cyan glow-text">99.9%</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Uptime</div>
              </div>
              <div className="space-y-2">
              <div className="text-4xl font-heading font-bold tracking-tighter text-white">0.4s</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Avg latency</div>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}