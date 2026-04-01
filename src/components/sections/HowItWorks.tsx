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
    <section className="px-6 md:px-10 max-w-7xl mx-auto mt-24 md:mt-32 relative z-20">
      {/* Section Header */}
      <div className="text-center mb-16 px-4">
        <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
          How It Works
        </h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
          Four simple steps to transform your development workflow from chaos to clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Flow Connectors (Desktop Only) */}
        <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0"></div>

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center group relative z-10"
          >
            <div className="w-full p-6 rounded-2xl bg-surface-container border border-outline-variant/20 hover:border-primary/30 transition-all duration-300 flex flex-col items-center text-center h-full hover:bg-surface-container-high">
              
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center border border-outline-variant/10 group-hover:border-primary/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <step.icon className="w-6 h-6" />
                  </div>
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary font-bold text-xs border-4 border-surface-container">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-on-surface mb-2">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {step.description}
              </p>
            </div>
            
            {i < steps.length - 1 && (
              <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 text-outline-variant group-hover:text-primary transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
