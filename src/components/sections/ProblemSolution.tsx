import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, ShieldAlert, EyeOff, Zap, ShieldCheck, Eye, 
  ArrowRight 
} from 'lucide-react';

const problems = [
  {
    title: "Manual Code Audits",
    description: "Traditional reviews are slow, inconsistent, and often delay shipping schedules by days.",
    icon: Clock,
  },
  {
    title: "Hidden Vulnerabilities",
    description: "Security gaps often go unnoticed in large codebases until they are exploited in production.",
    icon: ShieldAlert,
  },
  {
    title: "Observability Blind Spots",
    description: "Lack of deep structural insights makes it difficult to understand complex system dependencies.",
    icon: EyeOff,
  }
];

const solutions = [
  {
    title: "AI-Powered Precision",
    description: "Instant, consistent analysis that keeps pace with your development speed.",
    icon: Zap,
  },
  {
    title: "Automated Detection",
    description: "Proactive security scanning identifies vulnerabilities before a single line is merged.",
    icon: ShieldCheck,
  },
  {
    title: "Real-time Insights",
    description: "Deep, live observability that maps every connection and logic flow across your stack.",
    icon: Eye,
  }
];

export default function ProblemSolution() {
  return (
    <section className="px-6 md:px-10 max-w-7xl mx-auto mt-16 md:mt-32 relative z-20">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
          The Future of Code Integrity
        </h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
          Legacy workflows can't handle modern complexity. Inspectra bridges the gap between chaos and clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-8 md:gap-12 items-start relative">
        
        {/* Problems Side */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-px flex-1 bg-outline-variant"></div>
            <span className="text-sm font-medium text-on-surface-variant">The Challenge</span>
          </div>
          
          {problems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="p-6 rounded-2xl bg-surface-container border border-outline-variant/20 group hover:bg-surface-container-high hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-surface-container-low text-on-surface-variant group-hover:text-primary transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider Column */}
        <div className="hidden md:flex flex-col items-center justify-center h-full pt-24">
          <div className="relative flex items-center justify-center h-full">
            <div className="absolute inset-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
            <div className="w-12 h-12 rounded-full bg-surface-container-high border border-primary/20 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(162,201,255,0.1)]">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Solutions Side */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-medium text-primary">The Solution</span>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
          </div>

          {solutions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: (i * 0.1) + 0.3, duration: 0.5, ease: "easeOut" }}
              className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20 backdrop-blur-md group hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 shadow-[0_0_40px_rgba(162,201,255,0.05)]"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
