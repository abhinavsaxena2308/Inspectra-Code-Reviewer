import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, ShieldCheck, Gauge, 
  Search, GitBranch, Users 
} from 'lucide-react';

const features = [
  {
    title: "AI Code Audits",
    description: "Precision LLM-driven analysis of every line. Detect logic flaws and maintainability issues instantly.",
    icon: Brain,
  },
  {
    title: "Security Scanning",
    description: "Real-time vulnerability detection for OWASP risks, ensuring your code is production-ready.",
    icon: ShieldCheck,
  },
  {
    title: "Performance Insights",
    description: "Identify bottlenecks and get actionable suggestions for optimized data structures and algorithms.",
    icon: Gauge,
  },
  {
    title: "Semantic Search",
    description: "Deep contextual search across your entire codebase. Find exactly what you need in seconds.",
    icon: Search,
  },
  {
    title: "Dependency Mapping",
    description: "Visualize complex connections and logic flows across your microservices and components.",
    icon: GitBranch,
  },
  {
    title: "Team Collaboration",
    description: "Share insights, track architectural progress, and maintain a high-quality codebase together.",
    icon: Users,
  }
];

export default function Features() {
  return (
    <section className="px-6 md:px-10 max-w-5xl mx-auto mt-24 md:mt-32 relative z-20">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-linear-to-b from-cyan/5 via-transparent to-transparent -z-10 blur-3xl opacity-50"></div>
      
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
          Unmatched <span className="font-cursive text-cyan inline-block -rotate-3 px-1">Capability</span>
        </h2>
        <p className="text-white/40 max-w-2xl mx-auto font-medium">
          Deeper insights, faster reviews, and superior code health with our enterprise-grade toolkit.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group"
          >
            <div className="h-full p-8 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-cyan/30 hover:shadow-[0_0_30px_rgba(0,255,255,0.05)] flex flex-col">
              
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center text-cyan mb-6 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="w-6 h-6" />
              </div>

              {/* Text Content */}
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/40 group-hover:text-white/60 transition-colors">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
