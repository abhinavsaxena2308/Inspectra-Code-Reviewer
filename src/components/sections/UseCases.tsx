import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, Rocket, ShieldAlert, Globe 
} from 'lucide-react';

const cases = [
  {
    title: "Developers",
    description: "Ship faster with AI-powered code reviews that catch bugs and security flaws in real-time, right from your terminal or CI/CD.",
    icon: Code2,
  },
  {
    title: "Startups",
    description: "Scale your technical debt responsibly. Maintain high code standards while moving at the speed of light.",
    icon: Rocket,
  },
  {
    title: "Security Teams",
    description: "Automate vulnerability discovery and ensure every merge meets your high-security bar without slowing down engineering.",
    icon: ShieldAlert,
  },
  {
    title: "Open Source Maintainers",
    description: "Manage contributions with ease. Use AI to audit PRs for quality, security, and adherence to project patterns.",
    icon: Globe,
  }
];

export default function UseCases() {
  return (
    <section className="px-6 md:px-10 max-w-7xl mx-auto mt-24 md:mt-32 relative z-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="max-w-xl">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
            Built for Everyone
          </h2>
          <p className="text-on-surface-variant text-lg">
            From solo founders to global security teams, Inspectra provides the visibility you need.
          </p>
        </div>
        <div className="hidden md:block h-px flex-1 bg-outline-variant mb-4 ml-8"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cases.map((useCase, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="group h-full"
          >
            <div className="h-full p-8 rounded-2xl bg-surface-container border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-surface-container-high flex flex-col sm:flex-row items-start gap-6">
              
              <div className="w-14 h-14 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/15 transition-transform duration-300">
                <useCase.icon className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-on-surface mb-3">
                  {useCase.title}
                </h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {useCase.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
