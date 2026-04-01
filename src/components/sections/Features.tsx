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
    <section className="px-6 md:px-10 max-w-7xl mx-auto mt-24 md:mt-32 relative z-20">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10 blur-3xl opacity-50"></div>
      
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
          Unmatched Capability
        </h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
          Deeper insights, faster reviews, and superior code health with our enterprise-grade toolkit.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="group h-full"
          >
            <div className="h-full p-8 rounded-2xl bg-surface-container border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-surface-container-high flex flex-col">
              
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary/15 transition-transform duration-300">
                <feature.icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-semibold text-on-surface mb-3">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant flex-grow">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
