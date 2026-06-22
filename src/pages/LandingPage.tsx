import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Terminal, Shield, Zap as ZapIcon, Brain, Code2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAuth as useClerkAuth } from '@clerk/react';
import { motion } from 'framer-motion';
import { GradientBlinds } from '../components/ui/GradientBlinds';
import Footer from '../components/layout/Footer';
import FloatingNavbar from '../components/layout/FloatingNavbar';

export function LandingPage() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { getToken } = useClerkAuth();

  const handleAnalyze = async () => {
    if (!repoUrl) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    if (!user) {
      navigate('/register');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError('');

      const urlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
      if (!urlPattern.test(repoUrl)) {
        throw new Error('Invalid URL format. Use: https://github.com/owner/repo');
      }

      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const { analyzeRepository } = await import('../lib/api');
      const response = await analyzeRepository(repoUrl, token);
      
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
    <div className="bg-background text-on-surface font-sans min-h-screen relative overflow-x-hidden transition-colors duration-300">
      <FloatingNavbar />

      {/* Hero Section Wrapper */}
      <div className="relative w-full bg-white dark:bg-[#0a0a0c] text-on-surface dark:text-white overflow-hidden transition-colors duration-300">
        
        {/* Light Mode Gradient Blinds */}
        <div className="absolute top-0 left-0 right-0 h-full z-0 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] touch-none pointer-events-none block dark:hidden">
          <GradientBlinds
            gradientColors={['#fbcfe8', '#d8b4fe']}
            angle={-15}
            noise={0.1}
            blindCount={20}
            blindMinWidth={40}
            spotlightRadius={0.6}
            spotlightSoftness={0.8}
            spotlightOpacity={0.5}
            mouseDampening={0.12}
            distortAmount={2}
            shineDirection="left"
            isLightMode={true}
          />
        </div>

        {/* Dark Mode Gradient Blinds */}
        <div className="absolute top-0 left-0 right-0 h-full z-0 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] touch-none pointer-events-none hidden dark:block">
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
            mixBlendMode="normal"
            isLightMode={false}
          />
        </div>

        {/* Clean Hero Section */}
        <main className="relative pt-32 pb-24 md:pt-48 md:pb-32 w-full flex flex-col items-center border-b border-outline-variant/20 dark:border-white/10 z-10">
          <div className="px-6 md:px-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-8 shadow-sm backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium text-black/60 dark:text-white/80 tracking-wide">Inspectra AI Engine v4.2 Online</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-black dark:text-white leading-tight"
            >
              Code Review, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-400 to-purple-400 animate-text-shimmer glow-text">
                Automated by AI.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-black/60 dark:text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Instantly detect vulnerabilities, anti-patterns, and bugs in your GitHub repositories. Connect a repo and let our LLM engine do the heavy lifting in seconds.
            </motion.p>

            {/* Input & CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4"
            >
              <div className="relative w-full group flex flex-col sm:flex-row shadow-[0_0_40px_rgba(217, 70, 239,0.1)] rounded-2xl md:rounded-full bg-surface/40 border border-white/10 p-2 transition-all duration-500 hover:border-primary/50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/20 backdrop-blur-2xl glass-card">
                <div className="relative flex-grow flex items-center">
                  <Terminal className="absolute left-4 w-5 h-5 text-black/40 dark:text-white/40" />
                  <input
                    className="w-full bg-transparent pl-12 pr-4 py-3 text-sm md:text-base outline-none text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    type="text"
                    disabled={isAnalyzing}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                </div>
                <button 
                  onClick={handleAnalyze} 
                  disabled={isAnalyzing} 
                  className="w-full sm:w-auto mt-2 sm:mt-0 px-8 py-3 rounded-xl md:rounded-full ethereal-btn text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
                >
                  {isAnalyzing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Analyze Repo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-error/10 text-error text-sm font-medium w-full text-center border border-error/20">
                  {error}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Features Grid */}
      <section className="py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-on-surface mb-4">Enterprise-grade static analysis</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Everything you need to ship secure, high-quality code faster than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6 text-primary" />,
                title: 'Security First',
                description: 'Detect OWASP top 10 vulnerabilities, exposed secrets, and logic flaws instantly.'
              },
              {
                icon: <Brain className="w-6 h-6 text-magenta" />,
                title: 'Context-Aware AI',
                description: 'Our custom LLM understands the full context of your repository, reducing false positives.'
              },
              {
                icon: <ZapIcon className="w-6 h-6 text-amber-500" />,
                title: 'Lightning Fast',
                description: 'Deep-scan massive codebases in under 30 seconds with our optimized edge workers.'
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="p-8 rounded-2xl glass-card border border-white/5 hover:border-primary/50 transition-all duration-500 group"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_20px_rgba(217, 70, 239,0.4)]">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Social Proof */}
      <section className="py-24 bg-surface-container-low border-t border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-on-surface mb-12 tracking-tight">Trusted by modern engineering teams</h2>
          
          <div className="relative w-full overflow-hidden mt-8">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-surface-container-low to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-surface-container-low to-transparent z-10 pointer-events-none"></div>
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
              className="flex items-center gap-24 w-max opacity-60 hover:opacity-100 transition-opacity duration-500"
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-24 items-center">
                  <div className="text-2xl font-bold font-heading text-on-surface flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary"></div>
                    Acme Corp
                  </div>
                  <div className="text-2xl font-bold font-mono text-on-surface flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(217, 70, 239,0.5)]"></div>
                    GlobalTech
                  </div>
                  <div className="text-2xl font-bold font-sans text-on-surface flex items-center justify-center gap-2">
                    <Code2 className="w-8 h-8 text-secondary" />
                    DevScale
                  </div>
                  <div className="text-2xl font-bold font-serif text-on-surface flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-sm rotate-45 bg-indigo"></div>
                    Nexus
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
