import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, ShieldAlert, EyeOff, Zap, ShieldCheck, Eye, 
  ChevronRight, ArrowRight 
} from 'lucide-react';

const problems = [
  {
    title: (
      <>
        Manual Code Audits
      </>
    ),
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
    <section className="px-6 md:px-10 max-w-5xl mx-auto mt-16 md:mt-24 relative z-20">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
          The Future of <span className="font-cursive text-cyan inline-block -rotate-3 px-1">Code</span> Integrity
        </h2>
        <p className="text-white/40 max-w-2xl mx-auto font-medium">
          Legacy workflows can't handle modern complexity. Inspectra bridges the gap between chaos and clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,60px,1fr] gap-8 items-stretch relative">
        
        {/* Problems Side */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2 px-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">The Challenge</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          
          {problems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md group hover:bg-white/[0.04] transition-all duration-500"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 text-white/40 group-hover:text-white/60 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white/80 group-hover:text-white transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-white/30 group-hover:text-white/50 transition-colors">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Divider Column */}
        <div className="hidden md:flex flex-col items-center justify-center relative">
          <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan/20 to-transparent"></div>
          <div className="w-10 h-10 rounded-full bg-void border border-cyan/30 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
            <ArrowRight className="w-4 h-4 text-cyan" />
          </div>
        </div>

        {/* Solutions Side */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2 px-4">
            <div className="h-px flex-1 bg-cyan/10"></div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-cyan/60">The Solution</span>
          </div>

          {solutions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i * 0.1) + 0.3 }}
              className="p-6 rounded-2xl bg-cyan/5 border border-cyan/10 backdrop-blur-md group hover:bg-cyan/10 hover:border-cyan/30 transition-all duration-500 shadow-[0_0_30px_rgba(0,255,255,0.02)]"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-cyan/10 text-cyan group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white group-hover:text-cyan transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-white/50 group-hover:text-white transition-colors">
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
