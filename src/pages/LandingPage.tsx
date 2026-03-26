import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github, Sparkles, Link as LinkIcon, Zap, Brain, Bug, Shield, Gauge,
  ClipboardPaste, LineChart, CheckSquare, Terminal, Code2, Users
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

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
    <div className="bg-surface text-on-surface font-sans selection:bg-primary-container/30 min-h-screen">
      {/* TopAppBar Navigation */}
      <header className="sticky top-0 w-full z-50 bg-[#10141a]/80 backdrop-blur-xl">
        <nav className="flex items-center justify-between h-14 px-4 md:px-8 gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tighter text-[#c9d1d9] font-cursive">Inspectra</span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-primary border border-outline-variant/20 uppercase tracking-widest">v1.0.4</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-sans text-sm font-medium tracking-tight">
            <a className="text-[#a2c9ff] border-b-2 border-[#a2c9ff] pb-1" href="#">Dashboard</a>
            <a className="text-[#c9d1d9]/70 hover:bg-[#262a31] transition-colors duration-200 px-2 py-1 rounded" href="#">Analyses</a>
            <a className="text-[#c9d1d9]/70 hover:bg-[#262a31] transition-colors duration-200 px-2 py-1 rounded" href="#">Settings</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30 mr-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-outline-variant/30 bg-surface flex items-center justify-center">
                    <Users className="w-3 h-3 text-on-surface-variant" />
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{user.name || user.email?.split('@')[0]}</span>
                </div>
                <Button size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
                <Button size="sm" onClick={() => navigate('/register')} className="hidden sm:inline-flex">Get Started</Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[870px] flex flex-col items-center justify-center px-4 overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #262a31 1px, transparent 0)', backgroundSize: '40px 40px' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none"></div>
          <div className="relative z-10 max-w-4xl w-full text-center space-y-8 py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/20 text-xs font-mono text-primary mb-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ENGINE v2.0 NOW LIVE
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-7xl font-bold tracking-tight text-on-surface leading-[1.1]"
            >
              AI Code Reviews for Your <br />
              <span className="text-primary italic font-cursive pr-2">GitHub Repositories</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed"
            >
              Inspect code, detect issues, and improve quality instantly. Our high-performance LLMs analyze every line for vulnerabilities and patterns.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 flex flex-col md:flex-row items-center justify-center gap-3 w-full max-w-2xl mx-auto"
            >
              <div className="relative w-full group">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg pl-12 pr-4 py-4 text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  type="text"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-gradient-to-br from-[#a2c9ff] to-[#58a6ff] text-on-primary font-bold px-8 py-4 rounded-lg whitespace-nowrap active:scale-95 transition-transform text-sm uppercase tracking-wider flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Repository'}
                {!isAnalyzing && <Zap className="w-4 h-4 fill-current" />}
              </button>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm font-medium max-w-2xl mx-auto"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center gap-8 pt-12 text-outline/40 grayscale opacity-50"
            >
              <span className="font-bold text-xl tracking-tighter">GITHUB</span>
              <span className="font-bold text-xl tracking-tighter">GITLAB</span>
              <span className="font-bold text-xl tracking-tighter">BITBUCKET</span>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Engineered for Precision</h2>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Large Feature */}
            <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <Brain className="text-primary w-10 h-10" />
                  <h3 className="text-2xl font-bold">Smart Analysis</h3>
                  <p className="text-on-surface-variant leading-relaxed">Context-aware reviews that understand your project's architecture. We don't just find syntax errors; we identify logic flaws and design pattern mismatches.</p>
                </div>
                <div className="flex-1 w-full bg-surface-container-lowest p-4 rounded-lg font-mono text-xs border border-outline-variant/20">
                  <div className="text-primary-container mb-2 font-cursive text-lg leading-none tracking-wider">// Inspectra suggestion</div>
                  <div className="flex gap-2 text-error">
                    <span>- return data.filter(x =&gt; x.active)</span>
                  </div>
                  <div className="flex gap-2 text-secondary">
                    <span>+ return data.reduce((acc, x) =&gt; x.active ? [...acc, x] : acc, [])</span>
                  </div>
                  <div className="mt-4 text-[10px] text-outline italic">Recommendation: Improve memory efficiency on large arrays.</div>
                </div>
              </div>
            </div>

            {/* Secondary Feature */}
            <div className="md:col-span-4 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-error"></div>
              <div className="space-y-4">
                <Bug className="text-error w-10 h-10" />
                <h3 className="text-2xl font-bold">Bug Detection</h3>
                <p className="text-on-surface-variant text-sm">Automated tracing of edge cases and potential null pointer exceptions before they hit production.</p>
              </div>
            </div>

            {/* Security Feature */}
            <div className="md:col-span-6 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-tertiary"></div>
              <div className="flex gap-6 items-start">
                <Shield className="text-tertiary w-10 h-10 shrink-0" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Security Insights</h3>
                  <p className="text-on-surface-variant text-sm">Detect hardcoded secrets, insecure API endpoints, and outdated dependencies automatically.</p>
                </div>
              </div>
            </div>

            {/* Performance Feature */}
            <div className="md:col-span-6 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
              <div className="flex gap-6 items-start">
                <Gauge className="text-secondary w-10 h-10 shrink-0" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Performance</h3>
                  <p className="text-on-surface-variant text-sm">Identify inefficient loops, heavy memory allocations, and blocking I/O operations in real-time.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* How it Works / Operational Workflow */}
        <section className="bg-surface-container-lowest py-24 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-20 space-y-4">
              <h2 className="text-3xl font-bold">Operational Workflow</h2>
              <p className="text-on-surface-variant max-w-xl">Our three-step process integrates seamlessly with your existing development cycle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="relative group">
                <div className="text-6xl font-black text-outline/10 absolute -top-8 -left-4 font-mono select-none">01</div>
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant/30 text-primary">
                    <ClipboardPaste className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold">Paste repo link</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Connect any public or private repository using a standard URL or SSH link.</p>
                </div>
              </div>

              <div className="relative group">
                <div className="text-6xl font-black text-outline/10 absolute -top-8 -left-4 font-mono select-none">02</div>
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant/30 text-primary">
                    <LineChart className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold">Analyze code</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Our AI engine scans the entire codebase, building a semantic map of dependencies.</p>
                </div>
              </div>

              <div className="relative group">
                <div className="text-6xl font-black text-outline/10 absolute -top-8 -left-4 font-mono select-none">03</div>
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant/30 text-primary">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold">Get insights</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">Receive a detailed report with actionable PR comments and severity-scored issues.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="bg-surface-container-high/80 backdrop-blur-xl border border-outline-variant/20 rounded-2xl p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full"></div>

            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl font-bold tracking-tight font-cursive md:text-5xl text-primary">Ready to ship cleaner code?</h2>
              <p className="text-on-surface-variant max-w-lg mx-auto">Join 5,000+ developers who use Inspectra to automate their peer review process.</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-br from-[#a2c9ff] to-[#58a6ff] text-on-primary font-bold px-10 py-4 rounded-lg active:scale-95 transition-transform uppercase tracking-wider text-sm hover:opacity-90"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-surface-container-highest border border-outline-variant/30 text-on-surface px-10 py-4 rounded-lg hover:bg-surface-container transition-colors uppercase tracking-wider text-sm"
                >
                  View Demo Repo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant/10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-2xl font-bold tracking-tighter text-[#c9d1d9] font-cursive">Inspectra</div>
            <p className="text-xs text-outline font-mono">© 2026 AI CODE ANALYSIS ENGINE. ALL RIGHTS RESERVED.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs font-mono text-outline/60">
            <a className="hover:text-primary transition-colors" href="#">PRIVACY_POLICY</a>
            <a className="hover:text-primary transition-colors" href="#">TERMS_OF_SERVICE</a>
            <a className="hover:text-primary transition-colors" href="#">API_DOCS</a>
            <a className="hover:text-primary transition-colors" href="#">SECURITY</a>
          </div>

          <div className="flex gap-4">
            <Terminal className="w-5 h-5 text-outline/40 hover:text-on-surface cursor-pointer" />
            <Code2 className="w-5 h-5 text-outline/40 hover:text-on-surface cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}