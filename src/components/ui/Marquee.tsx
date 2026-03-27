import React from "react";

const items = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go",
  "⚡ Code Suggestions", "🔒 Security Analysis", "🐛 Bug Detection",
  "📈 Performance Optimization", "🧹 Clean Code", "GitHub Integration",
  "🤖 AI Powered by Gemini", "Git", "Docker", "React", "Node.js"
];

export default function Marquee() {
  return (
    <div className="w-full overflow-hidden py-14 select-none bg-white/[0.02] border-y border-white/5">
      {/* Decorative vertical mask for soft edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-void via-void/90 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-void via-void/90 to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused] items-center">
          {[...items, ...items, ...items].map((item, index) => {
            return (
              <div 
                key={index} 
                className="flex items-center gap-4 mx-12 group transition-all duration-500"
              >
                {/* Simple Dot Placeholder for Logo */}
                <div className="w-1.5 h-1.5 rounded-full bg-cyan/40 group-hover:bg-cyan group-hover:scale-150 transition-all duration-500"></div>
                
                <span className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white/30 group-hover:text-white transition-colors duration-500 whitespace-nowrap">
                  {item}
                </span>
                
                {/* Separator / Dot after text for flow */}
                <div className="ml-4 w-1 h-1 rounded-full bg-white/10"></div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .animate-marquee-slow {
          animation: marquee 80s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}