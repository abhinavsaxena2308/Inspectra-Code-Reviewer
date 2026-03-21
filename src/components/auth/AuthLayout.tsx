import React from 'react';
import { motion } from 'motion/react';
import { Github, Code2, Sparkles, Shield, Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const floatingItems = [
  { icon: Code2, label: 'Smart Code Analysis', top: '15%', left: '10%', delay: 0 },
  { icon: Shield, label: 'Security Scanning', top: '40%', left: '5%', delay: 0.4 },
  { icon: Zap, label: 'Instant Feedback', top: '65%', left: '12%', delay: 0.8 },
  { icon: Sparkles, label: 'AI-Powered Review', top: '80%', left: '35%', delay: 1.2 },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0d1117]">

      {/* ── Left Panel (3/4 on desktop, hidden behind blur on mobile) ── */}
      <div
        className="
          hidden md:flex md:w-3/4 relative
          flex-col items-center justify-center overflow-hidden
        "
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(88, 101, 242, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(88, 166, 255, 0.14) 0%, transparent 55%),
            radial-gradient(ellipse at 60% 80%, rgba(139, 92, 246, 0.16) 0%, transparent 50%),
            linear-gradient(135deg, #0d1117 0%, #0f1730 40%, #0d1117 100%)
          `,
        }}
      >
        {/* Animated grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(88,166,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(88,166,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-[20%] left-[30%] w-72 h-72 rounded-full bg-indigo-600/10 blur-[80px] animate-pulse" />
        <div className="absolute bottom-[25%] right-[20%] w-56 h-56 rounded-full bg-blue-500/10 blur-[60px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[55%] left-[15%] w-40 h-40 rounded-full bg-violet-500/10 blur-[50px] animate-pulse" style={{ animationDelay: '0.8s' }} />

        {/* Floating feature badges */}
        {floatingItems.map((item) => (
          <motion.div
            key={item.label}
            className="absolute flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs text-white/60 font-medium"
            style={{ top: item.top, left: item.left }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.delay + 0.5, duration: 0.6 }}
          >
            <item.icon className="w-3 h-3 text-blue-400" />
            {item.label}
          </motion.div>
        ))}

        {/* Center content */}
        <motion.div
          className="relative z-10 text-center px-16 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Logo mark */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Github className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Inspectra</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            AI Code Reviews,
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Supercharged
            </span>
          </h1>
          <p className="text-white/40 text-base leading-relaxed mb-10">
            Get instant, intelligent code feedback. Detect bugs, security issues, and performance bottlenecks before they ship.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8">
            {[
              { value: '10K+', label: 'Code reviews' },
              { value: '99%', label: 'Accuracy' },
              { value: '<2s', label: 'Response time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Mobile background (only visible on small screens) ── */}
      <div
        className="md:hidden absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(88, 101, 242, 0.22) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.18) 0%, transparent 50%),
            linear-gradient(135deg, #0d1117 0%, #0f1730 100%)
          `,
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      {/* ── Right Panel (form) — 1/4 desktop, full-width mobile ── */}
      <div className="relative z-10 w-full md:w-1/4 min-w-0 md:min-w-[380px] flex items-center justify-center p-6 md:p-8 border-l border-white/5 bg-[#0d1117]/90 backdrop-blur-md">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Github className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Inspectra</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-white/40">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};
