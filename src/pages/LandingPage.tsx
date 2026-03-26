import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Github, Zap, Shield, Bug, BarChart3, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { insforge } from '../lib/insforge';
import { useAuth } from '../hooks/useAuth';
import { analyzeRepository } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';

export const LandingPage = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const debouncedRepoUrl = useDebounce(repoUrl, 500);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    
    try {
      const result = await analyzeRepository(repoUrl);
      if (result.status === 'success') {
        navigate(`/analysis/${result.data.id}`);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to start analysis. Please check the URL.');
    } finally {
      setIsAnalyzing(false);
    }
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
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Github className="w-8 h-8 text-on-surface" />
          <span className="font-semibold text-lg tracking-tight text-on-surface">AI Reviewer</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">How it works</a>
          <a href="#pricing" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface-container-accent/50 border border-transparent mr-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-transparent bg-surface flex items-center justify-center">
                  <Users className="w-3 h-3 text-on-surface-variant" />
                </div>
                <span className="text-xs font-semibold text-on-surface">{user.name || user.email?.split('@')[0]}</span>
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
          <h1 className="text-5xl md:text-8xl font-bold text-on-surface tracking-tight mb-8 leading-[1.05]">
            Build like the <br />
            <span className="text-primary">best in the world</span>
          </h1>
          <p className="text-lg md:text-2xl text-on-surface-variant max-w-3xl mx-auto mb-12 font-medium">
            The AI-powered code reviewer that helps you ship faster, safer, and more consistent code directly on GitHub.
          </p>

          <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input 
                placeholder="Enter a GitHub repository URL..." 
                icon={<Github className="w-5 h-5" />}
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="h-12 bg-surface border-transparent text-base"
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
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm font-medium max-w-2xl mx-auto"
            >
              {error}
            </motion.div>
          )}
          
          <div className="mt-10 flex items-center justify-center gap-8 text-on-surface-variant text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Free for public repos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Enterprise ready</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-transparent">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full flex flex-col bg-surface-container/30 border-transparent">
                <div className={cn("w-10 h-10 rounded-md flex items-center justify-center mb-6 border border-transparent bg-surface", f.color)}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-on-surface mb-2">{f.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-transparent">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-on-surface mb-8">How it works</h2>
            <div className="space-y-10">
              {[
                { step: '01', title: 'Connect Repository', desc: 'Paste your GitHub repo URL or connect your account to browse your repositories.' },
                { step: '02', title: 'AI Deep Scan', desc: 'Our AI engine analyzes every file, understanding context and complex logic patterns.' },
                { step: '03', title: 'Get Insights', desc: 'Receive a comprehensive report with categorized issues and actionable suggestions.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <span className="text-3xl font-bold text-on-surface-variant/30 leading-none">{item.step}</span>
                  <div>
                    <h4 className="text-lg font-bold text-on-surface mb-2">{item.title}</h4>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="gh-box shadow-2xl shadow-primary/5">
              <div className="gh-box-header flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">Terminal</span>
              </div>
              <div className="p-6 font-mono text-sm bg-surface">
                <div className="space-y-2">
                  <p className="text-primary">$ reviewer analyze facebook/react</p>
                  <p className="text-on-surface-variant">Fetching repository data...</p>
                  <p className="text-on-surface-variant">Running AI analysis engine...</p>
                  <p className="text-secondary">✓ Found 12 issues in 4 files</p>
                  <p className="text-on-surface mt-4">Analysis complete. View report at:</p>
                  <p className="text-primary underline italic">https://reviewer.ai/report/react-8291</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-transparent pt-20 pb-12 bg-surface-container/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <Github className="w-8 h-8 text-on-surface" />
                <span className="font-semibold text-lg tracking-tight text-on-surface">AI Reviewer</span>
              </div>
              <p className="text-on-surface-variant max-w-sm mb-6 text-sm leading-relaxed">
                The next generation of AI-powered code review. Helping teams ship better code, faster, directly on GitHub.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-on-surface"><Github className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="text-on-surface-variant hover:text-on-surface"><Users className="w-5 h-5" /></Button>
              </div>
            </div>
            <div>
              <h5 className="text-on-surface font-bold mb-6 text-sm">Product</h5>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-on-surface font-bold mb-6 text-sm">Company</h5>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-transparent text-xs text-on-surface-variant">
            <p>© 2026 GitHub AI Reviewer. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-on-surface transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-on-surface transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-on-surface transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};