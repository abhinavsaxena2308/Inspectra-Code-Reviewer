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
    <section className="px-6 md:px-10 max-w-5xl mx-auto mt-24 md:mt-32 relative z-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="max-w-xl">
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
            Built for <span className="font-cursive text-cyan inline-block -rotate-3 px-1">Everyone</span>
          </h2>
          <p className="text-white/40 font-medium">
            From solo founders to global security teams, Inspectra provides the visibility you need.
          </p>
        </div>
        <div className="hidden md:block h-px flex-1 bg-white/5 mb-4 ml-8"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cases.map((useCase, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group"
          >
            <div className="h-full p-8 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-cyan/30 hover:shadow-[0_0_30px_rgba(0,255,255,0.05)] flex flex-col sm:flex-row items-start gap-6">
              
              {/* Icon */}
              <div className="w-14 h-14 shrink-0 rounded-xl bg-cyan/10 flex items-center justify-center text-cyan group-hover:scale-110 transition-transform duration-500">
                <useCase.icon className="w-7 h-7" />
              </div>

              {/* Text Content */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/40 group-hover:text-white/60 transition-colors">
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
