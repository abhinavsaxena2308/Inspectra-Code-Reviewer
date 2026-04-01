import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardPaste, Scan, Bug, LineChart, ChevronRight } from 'lucide-react';

const steps = [
  {
    number: "01",
    title: "Paste GitHub Repo",
    description: "Simply drop your repository URL into the inspector to begin the analysis.",
    icon: ClipboardPaste,
  },
  {
    number: "02",
    title: "Scan Codebase",
    description: "Our high-performance LLMs perform a deep structural audit of every file.",
    icon: Scan,
  },
  {
    number: "03",
    title: "Detect Issues",
    description: "Identify security vulnerabilities, bugs, and performance bottlenecks instantly.",
    icon: Bug,
  },
  {
    number: "04",
    title: "Get Insights",
    description: "Receive actionable suggestions and optimized code patterns for your stack.",
    icon: LineChart,
  }
];

export default function HowItWorks() {
  return (
    <section className="px-6 md:px-10 max-w-5xl mx-auto mt-24 md:mt-32 relative z-20">
      {/* Section Header */}
      <div className="text-center mb-16 px-4">
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
          How It <span className="font-cursive text-cyan inline-block -rotate-3 px-1">Works</span>
        </h2>
        <p className="text-white/40 max-w-2xl mx-auto font-medium">
          Four simple steps to transform your development workflow from chaos to clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {/* Flow Connectors (Desktop Only) */}
        <div className="hidden md:block absolute top-[68px] left-[15%] right-[15%] h-px bg-linear-to-r from-transparent via-cyan/20 to-transparent z-0"></div>

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center md:items-start group relative z-10"
          >
            {/* Glass Card */}
            <div className="w-full p-6 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-md group-hover:bg-white/4 group-hover:border-white/10 transition-all duration-500 flex flex-col items-center md:items-start text-center md:text-left h-full">
              
              {/* Step Icon & Number */}
              <div className="flex items-center justify-between w-full mb-6 relative">
                <div className="p-3 rounded-xl bg-cyan/10 text-cyan group-hover:scale-110 transition-transform duration-500">
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/20 font-bold">
                  Step {step.number}
                </span>
                
                {/* Desktop Flow Arrow */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 text-white/10 group-hover:text-cyan/40 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan transition-colors">
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-white/40 group-hover:text-white/60 transition-colors">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
