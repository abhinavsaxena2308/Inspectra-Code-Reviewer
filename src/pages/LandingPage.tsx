import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Github, Zap, Shield, Bug, BarChart3, Star, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { insforge } from '../lib/insforge';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleGitHubSignIn = async () => {
    setIsAuthLoading(true);
    try {
      await insforge.auth.signInWithOAuth({
        provider: 'github',
        redirectTo: window.location.origin + '/dashboard',
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    
    setIsAnalyzing(true);
    
    // Simulate real analysis using InsForge database record creation later
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/analysis/1');
    }, 2500);
  };

  const features = [
    {
      title: 'Code Quality Analysis',
      desc: 'Deep scan for maintainability, readability, and architectural patterns.',
      icon: BarChart3,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
    {
      title: 'Bug Detection',
      desc: 'Identify logical errors, memory leaks, and edge cases before they hit production.',
      icon: Bug,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      title: 'Security Insights',
      desc: 'Detect vulnerabilities, insecure dependencies, and secret leaks.',
      icon: Shield,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Performance Suggestions',
      desc: 'Get actionable advice on optimizing loops, API calls, and resource usage.',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gh-bg text-gh-text selection:bg-gh-blue/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gh-blue/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gh-green/5 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Github className="w-8 h-8 text-gh-text" />
          <span className="font-semibold text-lg tracking-tight text-gh-text">AI Reviewer</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-gh-muted hover:text-gh-blue transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-gh-muted hover:text-gh-blue transition-colors">How it works</a>
          <a href="#pricing" className="text-sm font-medium text-gh-muted hover:text-gh-blue transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-gh-header-accent/50 border border-gh-border mr-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-gh-border bg-gh-bg flex items-center justify-center">
                  <Users className="w-3 h-3 text-gh-muted" />
                </div>
                <span className="text-xs font-semibold text-gh-text">{user.name || user.email?.split('@')[0]}</span>
              </div>
              <Button size="sm" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-8xl font-bold text-gh-text tracking-tight mb-8 leading-[1.05]">
            Build like the <br />
            <span className="text-gh-blue">best in the world</span>
          </h1>
          <p className="text-lg md:text-2xl text-gh-muted max-w-3xl mx-auto mb-12 font-medium">
            The AI-powered code reviewer that helps you ship faster, safer, and more consistent code directly on GitHub.
          </p>

          <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input 
                placeholder="Enter a GitHub repository URL..." 
                icon={<Github className="w-5 h-5" />}
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="h-12 bg-gh-bg border-gh-border text-base"
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="h-12 px-8 text-base"
              isLoading={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing Repository...' : 'Analyze Repo'}
           </Button>
          </form>
          
          <div className="mt-10 flex items-center justify-center gap-8 text-gh-muted text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gh-green" />
              <span>Free for public repos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gh-green" />
              <span>Enterprise ready</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-gh-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full flex flex-col bg-gh-header/30 border-gh-border">
                <div className={cn("w-10 h-10 rounded-md flex items-center justify-center mb-6 border border-gh-border bg-gh-bg", f.color)}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-gh-text mb-2">{f.title}</h3>
                <p className="text-gh-muted text-sm leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-gh-border">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gh-text mb-8">How it works</h2>
            <div className="space-y-10">
              {[
                { step: '01', title: 'Connect Repository', desc: 'Paste your GitHub repo URL or connect your account to browse your repositories.' },
                { step: '02', title: 'AI Deep Scan', desc: 'Our AI engine analyzes every file, understanding context and complex logic patterns.' },
                { step: '03', title: 'Get Insights', desc: 'Receive a comprehensive report with categorized issues and actionable suggestions.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <span className="text-3xl font-bold text-gh-muted/30 leading-none">{item.step}</span>
                  <div>
                    <h4 className="text-lg font-bold text-gh-text mb-2">{item.title}</h4>
                    <p className="text-gh-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="gh-box shadow-2xl shadow-gh-blue/5">
              <div className="gh-box-header flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[10px] text-gh-muted font-mono uppercase tracking-widest">Terminal</span>
              </div>
              <div className="p-6 font-mono text-sm bg-gh-bg">
                <div className="space-y-2">
                  <p className="text-gh-blue">$ reviewer analyze facebook/react</p>
                  <p className="text-gh-muted">Fetching repository data...</p>
                  <p className="text-gh-muted">Running AI analysis engine...</p>
                  <p className="text-gh-green">✓ Found 12 issues in 4 files</p>
                  <p className="text-gh-text mt-4">Analysis complete. View report at:</p>
                  <p className="text-gh-blue underline italic">https://reviewer.ai/report/react-8291</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gh-border pt-20 pb-12 bg-gh-header/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Github className="w-8 h-8 text-gh-text" />
                <span className="font-semibold text-lg tracking-tight text-gh-text">AI Reviewer</span>
              </div>
              <p className="text-gh-muted max-w-sm mb-6 text-sm leading-relaxed">
                The next generation of AI-powered code review. Helping teams ship better code, faster, directly on GitHub.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="text-gh-muted hover:text-gh-text"><Github className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="text-gh-muted hover:text-gh-text"><Users className="w-5 h-5" /></Button>
              </div>
            </div>
            <div>
              <h5 className="text-gh-text font-bold mb-6 text-sm">Product</h5>
              <ul className="space-y-3 text-sm text-gh-muted">
                <li><a href="#" className="hover:text-gh-blue transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-gh-blue transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-gh-blue transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-gh-blue transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-gh-text font-bold mb-6 text-sm">Company</h5>
              <ul className="space-y-3 text-sm text-gh-muted">
                <li><a href="#" className="hover:text-gh-blue transition-colors">About</a></li>
                <li><a href="#" className="hover:text-gh-blue transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-gh-blue transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-gh-blue transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gh-border text-xs text-gh-muted">
            <p>© 2026 GitHub AI Reviewer. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-gh-text transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gh-text transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gh-text transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
