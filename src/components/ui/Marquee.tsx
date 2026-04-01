import React from "react";
import { 
  Terminal, ShieldCheck, Bug, Zap, Activity, Search, 
  Database, Layout, Cpu, Globe, Infinity, Sparkles 
} from 'lucide-react';

const technologies = [
  { name: "JavaScript", color: "#F7DF1E" },
  { name: "TypeScript", color: "#3178C6" },
  { name: "Python", color: "#3776AB" },
  { name: "React", color: "#61DAFB" },
  { name: "Node.js", color: "#339933" },
  { name: "Docker", color: "#2496ED" },
  { name: "PostgreSQL", color: "#4169E1" },
  { name: "Framer", color: "#0055FF" },
  { name: "Vite", color: "#646CFF" },
  { name: "GitHub", color: "#FFFFFF" },
  { name: "OpenAI", color: "#74AA9C" },
  { name: "Gemini", color: "#8E75FF" },
];

const features = [
  { name: "Code Suggestions", Icon: Zap },
  { name: "Security Analysis", Icon: ShieldCheck },
  { name: "Bug Detection", Icon: Bug },
  { name: "Performance", Icon: Activity },
  { name: "Observability", Icon: Search },
  { name: "Deep Scanning", Icon: Sparkles },
];

export default function Marquee() {
  return (
    <div className="w-full overflow-hidden py-10 select-none bg-black/20 backdrop-blur-3xl border-y border-white/5">
      <div className="relative group">
        {/* Superior Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-void via-void/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-void via-void/90 to-transparent z-20 pointer-events-none"></div>
        
        <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused] items-center py-4">
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>
              {technologies.map((tech) => (
                <div 
                  key={`${tech.name}-${i}`} 
                  className="flex items-center gap-4 mx-10 opacity-40 hover:opacity-100 group transition-all duration-700 cursor-default"
                >
                  <div className="relative">
                    <div 
                      className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-700" 
                      style={{ backgroundColor: tech.color }}
                    ></div>
                    <div className="w-10 h-10 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-700 scale-90 group-hover:scale-105">
                      <TechLogo name={tech.name} color={tech.color} />
                    </div>
                  </div>
                  <span className="text-lg md:text-2xl font-bold tracking-tight text-white/60 group-hover:text-white transition-all duration-700 whitespace-nowrap" style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}>
                    {tech.name}
                  </span>
                  <div className="ml-4 md:ml-10 w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-cyan/40 transition-colors duration-700 shadow-[0_0_8px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_12px_var(--color-cyan)]"></div>
                </div>
              ))}
              
              {features.map((feature) => (
                <div 
                  key={`${feature.name}-${i}`} 
                  className="flex items-center gap-3 md:gap-4 mx-6 md:mx-10 opacity-30 hover:opacity-100 group transition-all duration-700 cursor-default"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-cyan/30 group-hover:bg-cyan/10 transition-all duration-700">
                    <feature.Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 group-hover:text-cyan transition-colors duration-700" />
                  </div>
                  <span className="text-base md:text-xl font-medium tracking-tight text-white/40 group-hover:text-white transition-all duration-700 whitespace-nowrap">
                    {feature.name}
                  </span>
                  <div className="ml-4 md:ml-10 w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-cyan/40 transition-colors duration-700"></div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style jsx>{`
        .animate-marquee-slow {
          animation: marquee 120s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}

function TechLogo({ name, color }: { name: string; color: string }) {
  switch (name) {
    case "JavaScript":
      return (
        <svg viewBox="0 0 448 512" className="w-full h-full" style={{ fill: color }}>
          <path d="M0 32v448h448V32H0zm243.8 349.4c0 43.6-25.6 63.5-62.9 63.5-33.7 0-53.2-17.4-63.2-38.5l34.3-20.7c6.6 11.7 12.6 21.6 27.1 21.6 13.8 0 22.6-5.4 22.6-26.5V232.6h39.1v148.8zm114.5 63.5c-39.6 0-66.3-17.7-77.4-42.3l33.1-19.2c6.3 10.8 17.1 21.3 35.5 21.3 14.1 0 24-5.1 24-19.5 0-11.7-10.2-15.6-28.5-23.4l-11.4-4.8c-28.5-12-46.5-27.3-46.5-54.3 0-28.2 23.1-48.9 56.7-48.9 29.1 0 46.5 10.5 56.4 30.3l-30.6 18.6c-5.1-10.2-13.2-14.7-24.9-14.7-10.2 0-16.5 5.1-16.5 12.9 0 10.2 6.6 14.1 21.3 20.4l11.4 4.8c31.5 13.5 53.7 27.9 53.7 58.8 0 31.1-23.2 53.1-60.8 53.1z"/>
        </svg>
      );
    case "TypeScript":
      return (
        <svg viewBox="0 0 448 512" className="w-full h-full" style={{ fill: color }}>
          <path d="M0 32v448h448V32H0zm190.7 344.4c-12.3 10.1-28.3 15.6-43.2 15.6-32 0-53.2-17.4-63.2-38.5l34.3-20.7c6.6 11.7 12.6 21.6 27.1 21.6 8.6 0 13.8-3.4 13.8-10.1 0-7-5.1-10.5-16.5-15.1l-10.2-4.1c-28.2-11.7-45.9-26.7-45.9-52.9 0-27.4 22.1-47.8 54-47.8 24.3 0 45.3 10.2 55.5 27.3l-30.6 18.9c-4.8-8.1-11.7-13.2-22.1-13.2-7.5 0-12.3 3.6-12.3 9.3 0 5.4 3.9 8.1 14.1 12.3l10.2 4.1c28.2 11.7 48.3 25.8 48.3 53.1 .1 31.5-24.9 50.1-53.3 50.1zm170.1-2.4c-13.8 0-23.7-5.1-23.7-22.3v-120h-46.8v-35.1h139.6v35.1h-46.1v120c0 17.2-9.9 22.3-23 22.3z"/>
        </svg>
      );
    case "Python":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M11.97 0C5.151 0 0 5.151 0 11.97c0 6.819 5.151 11.97 11.97 11.97s11.97-5.151 11.97-11.97C23.94 5.151 18.789 0 11.97 0zm.03 2.1c5.44 0 9.87 4.43 9.87 9.87s-4.43 9.87-9.87 9.87-9.87-4.43-9.87-9.87A9.87 9.87 0 0 1 12 2.1z" fill="white" opacity="0.1"/>
          <path d="M12.188 5.45c-2.73 0-2.56 1.185-2.56 1.185l.006 1.23h2.61v.37H8.596s-1.85-.213-1.85 2.503c0 2.716 1.6 2.627 1.6 2.627h.958v-1.34s-.04-1.6 1.574-1.6c1.614 0 2.66.002 2.66.002s1.513-.02 1.513-1.48V7.472c0-1.464-1.332-2.022-2.953-2.022zm-1.077.8c.453 0 .82.367.82.82 0 .452-.367.82-.82.82a.822.822 0 0 1-.82-.82c0-.453.367-.82.82-.82zm5.82 5.084c.454 0 .82.367.82.822 0 .453-.366.82-.82.82a.82.82 0 0 1-.82-.82c0-.455.367-.822.82-.822zM12.11 18.49c2.73 0 2.56-1.185 2.56-1.185l-.006-1.23h-2.61v-.37h3.648s1.85.213 1.85-2.503c0-2.716-1.6-2.627-1.6-2.627h-.958v1.34s.04 1.6-1.574 1.6c-1.614 0-2.66-.002-2.66-.002s-1.513.02-1.513 1.48v1.474c0 1.464 1.332 2.022 2.953 2.022z" fill={color}/>
        </svg>
      );
    case "React":
      return (
        <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-full h-full fill-none stroke-[1.2]" style={{ stroke: color }}>
          <circle cx="0" cy="0" r="2" fill={color}/>
          <g>
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      );
    case "Node.js":
      return (
        <svg viewBox="0 0 128 128" className="w-full h-full" style={{ fill: color }}>
          <path d="M117.445 33.642l-50.04-28.847c-2.148-1.241-5.666-1.241-7.814 0l-50.027 28.847c-2.148 1.241-3.908 4.288-3.908 6.772v57.683c0 2.481 1.76 5.529 3.908 6.771l50.028 28.857c2.148 1.251 5.666 1.251 7.824 0l50.03-28.857c2.148-1.242 3.908-4.29 3.908-6.771V40.414c0-2.484-1.751-5.531-3.909-6.772zM67.11 93.91l-14.717 8.52V52.793l14.717-8.5v49.617zm32.842-18.969l-14.712 8.514V42.176l14.712-8.512v41.277z"/>
        </svg>
      );
    case "Docker":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: color }}>
          <path d="M13.983 11.078h2.119c.102 0 .186-.083.186-.185V9.032a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.859c0 .103.083.188.185.188zm-2.954 5.43h2.118a.186.186 0 00.186-.186V14.46a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.859c0 .102.083.186.185.186zm0-2.954h2.118a.186.186 0 00.186-.185v-1.859a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.859c0 .103.083.186.185.186zm0-2.955h2.118a.186.186 0 00.186-.185V8.55a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.186v1.859c0 .102.083.185.185.185zm-2.954 5.43h2.119c.102 0 .185-.083.185-.186V14.46a.187.187 0 00-.185-.185H8.075a.186.186 0 00-.186.185v1.859c0 .102.084.186.186.186zM15 18c-3.75 0-6.75-3-6.75-6.75S11.25 4.5 15 4.5s6.75 3 6.75 6.75S18.75 18 15 18zm0-12c-2.897 0-5.25 2.353-5.25 5.25s2.353 5.25 5.25 5.25 5.25-2.353 5.25-5.25S17.897 6 15 6z" />
        </svg>
      );
    case "GitHub":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: "white" }}>
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      );
    case "OpenAI":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: color }}>
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5153-4.9089 6.0462 6.0462 0 0 0-5.385-3.2354 5.9868 5.9868 0 0 0-5.1118 2.8105 6.0024 6.0024 0 0 0-4.6933-.5107 6.0508 6.0508 0 0 0-4.3435 5.3418 5.988 5.988 0 0 0 2.23 5.4194 6.0033 6.0033 0 0 0 .5153 4.9089 6.0462 6.0462 0 0 0 5.385 3.2354 5.9868 5.9868 0 0 0 5.1118-2.8105 6.0024 6.0024 0 0 0 4.6933.5107 6.0508 6.0508 0 0 0 4.3435-5.3418 5.988 5.988 0 0 0-2.23-5.4194zm-9.0147 9.345a4.238 4.238 0 0 1-2.2155-.6214l.0349-.0201 4.5108-2.6041a.8856.8856 0 0 0 .4441-.769v-6.3682l2.3086 1.3327a.0163.0163 0 0 1 .0082.014v5.3372a4.269 4.269 0 0 1-5.0911 3.6989zm-8.1568-1.5034a4.2365 4.2365 0 0 1-.2235-2.2891l.0349.0201 4.5108 2.6041a.8856.8856 0 0 0 .8881 0l5.5152-3.1837v2.6653a.0164.0164 0 0 1-.0082.014l-4.6219 2.6682a4.269 4.269 0 0 1-6.1054-2.5029zm-1.042-8.5281a4.238 4.238 0 0 1 1.992-1.6677l-.0349.0201-4.5108 2.6041a.8856.8856 0 0 0-.4441.769v6.3682l-2.3086-1.3327a.0164.0164 0 0 1-.0082-.014v-5.3372a4.269 4.269 0 0 1 5.3146-1.4098zm11.2388-3.0729l-4.6219-2.6682a4.269 4.269 0 0 1 6.1054 2.5029 4.2365 4.2365 0 0 1 .2235 2.2891l-.0349-.0201-4.5108-2.6041a.8856.8856 0 0 0-.8881 0l-5.5152 3.1837v-2.6653a.0163.0163 0 0 1 .0082-.014zm3.0841 8.5281a4.238 4.238 0 0 1-1.992 1.6677l.0349-.0201 4.5108-2.6041a.8856.8856 0 0 0 .4441-.769V6.4426l2.3086 1.3327a.0163.0163 0 0 1 .0082.014v5.3372a4.269 4.269 0 0 1-5.3146 1.4098zM9.489 12.446l-2.3086-1.3327a.0163.0163 0 0 1-.0082-.014V5.7621a4.269 4.269 0 0 1 5.0911-3.6989 4.238 4.238 0 0 1 2.2155.6214l-.0349.0201-4.5108 2.6041a.8856.8856 0 0 0-.4441.769v6.3682zm.877 2.0366l3.634-2.0982 3.634 2.0982v4.1965l-3.634 2.0982-3.634-2.0982v-4.1965z"/>
        </svg>
      );
    case "Gemini":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: color }}>
          <path d="M12 0c.34 3.32 2.94 5.91 6.27 6.25-3.32.34-5.91 2.94-6.25 6.27-.34-3.32-2.94-5.91-6.27-6.25 3.32-.34 5.91-2.94 6.25-6.27zm0 24c-.34-3.32-2.94-5.91-6.27-6.25 3.32-.34 5.91-2.94 6.25-6.27.34 3.32 2.94 5.91 6.27 6.25-3.32.34-5.91 2.94-6.25 6.27z"/>
        </svg>
      );
    case "PostgreSQL":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: color }}>
          <path d="M12 2C13.5 2 15.1 2.4 16.5 3.2L11 8.7V2.1C11.3 2 11.7 2 12 2ZM2.1 11H8.7L3.2 16.5C2.4 15.1 2 13.5 2 12C2 11.7 2 11.3 2.1 11ZM12 22C10.5 22 8.9 21.6 7.5 20.8L13 15.3V21.9C12.7 22 12.3 22 12 22ZM21.9 13H15.3L20.8 7.5C21.6 8.9 22 10.5 22 12C22 12.3 22 12.7 21.9 13ZM12 14.5C10.6 14.5 9.5 13.4 9.5 12C9.5 10.6 10.6 9.5 12 9.5C13.4 9.5 14.5 10.6 14.5 12C14.5 13.4 13.4 14.5 12 14.5Z"/>
        </svg>
      );
    case "Vite":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M19.914 5.586l-7.914-4-7.914 4-2.086 12.414 10 6 10-6z" fill={color} opacity="0.8"/>
          <path d="M12 3.6l6 3-1.6 9.6-4.4 2.8-4.4-2.8-1.6-9.6z" fill="white" opacity="0.2"/>
        </svg>
      );
    case "Framer":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: color }}>
          <path d="M12 12l8-8V0H4v8l8 8v8l8-8z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ fill: "currentColor" }}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}