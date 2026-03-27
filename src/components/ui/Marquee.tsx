import React from "react";

const items = [
  { name: "JavaScript", icon: JSIcon },
  { name: "TypeScript", icon: TSIcon },
  { name: "Python", icon: PythonIcon },
  { name: "Java", icon: JavaIcon },
  { name: "C++", icon: CppIcon },
  { name: "Go", icon: GoIcon },
  { name: "GitHub", icon: GithubIcon },
  { name: "Git", icon: GitIcon },
  { name: "Docker", icon: DockerIcon },
  { name: "React", icon: ReactIcon },
  { name: "Node.js", icon: NodeIcon },
];

export default function Marquee() {
  return (
    <div className="w-full overflow-hidden bg-black py-3 border-y border-gray-800">
      <div className="flex w-max animate-marquee">
        {[...items, ...items].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-2 mx-6">
              <Icon />
              <span className="text-white text-sm">{item.name}</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ================= SVG ICONS ================= */

function JSIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M3 3h18v18H3zM13 17c0 2 3 2 3 0v-6h-2v6c0 .6-1 .6-1 0h-2zM8 17c0 2 3 2 3 0 0-2-3-2-3-4 0-.6 1-.6 1 0h2c0-2-3-2-3 0 0 2 3 2 3 4 0 .6-1 .6-1 0H8z"/>
    </svg>
  );
}

function TSIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M3 3h18v18H3zM9 8h6v2h-2v6h-2v-6H9zM16 10c0-2 4-2 4 0h-2c0-.5-2-.5-2 0 0 1 4 1 4 3 0 2-4 2-4 0h2c0 .5 2 .5 2 0 0-1-4-1-4-3z"/>
    </svg>
  );
}

function PythonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2c-4 0-4 2-4 4v2h8V6c0-2 0-4-4-4zm-4 6c-4 0-4 2-4 4s0 4 4 4h2v-4H6v-2h6v6c0 2 0 4 4 4s4-2 4-4v-2h-8v2h6v2c0 2 0 4-4 4s-4-2-4-4H8c-4 0-4-2-4-4s0-4 4-4z"/>
    </svg>
  );
}

function JavaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 22c4-1 6-2 6-3s-2-2-6-3c-4 1-6 2-6 3s2 2 6 3zm0-6c3-1 5-2 5-3s-2-2-5-3c-3 1-5 2-5 3s2 2 5 3zm0-6c2-1 3-2 3-3s-1-2-3-3c-2 1-3 2-3 3s1 2 3 3z"/>
    </svg>
  );
}

function CppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2l9 5v10l-9 5-9-5V7l9-5zm-2 7H8v6h2v-2h2v-2h-2V9zm6 0h-2v2h2v2h-2v2h2v-2h2v-2h-2V9z"/>
    </svg>
  );
}

function GoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <circle cx="8" cy="12" r="3"/>
      <circle cx="16" cy="12" r="3"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6 2 2 6 2 12c0 5 3 9 7 10v-3c-3 1-4-2-4-2 0-1-1-2-1-2-1-1 0-1 0-1 1 0 2 1 2 1 1 2 3 1 3 1 0-1 1-2 1-2-2 0-4-1-4-5 0-1 0-2 1-3 0 0-1-2 0-3 0 0 2 0 3 1 1 0 2 0 3 0s2 0 3 0c1-1 3-1 3-1 1 1 0 3 0 3 1 1 1 2 1 3 0 4-2 5-4 5 1 1 1 2 1 3v4c4-1 7-5 7-10 0-6-4-10-10-10z"/>
    </svg>
  );
}

function GitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M2 12l10-10 10 10-10 10L2 12zm10-6l-6 6 6 6 6-6-6-6z"/>
    </svg>
  );
}

function DockerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <rect x="2" y="10" width="4" height="4"/>
      <rect x="6" y="10" width="4" height="4"/>
      <rect x="10" y="10" width="4" height="4"/>
      <rect x="14" y="10" width="4" height="4"/>
    </svg>
  );
}

function ReactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white">
      <circle cx="12" cy="12" r="2" fill="white"/>
      <ellipse cx="12" cy="12" rx="10" ry="4"/>
      <ellipse cx="12" cy="12" rx="4" ry="10"/>
    </svg>
  );
}

function NodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2l9 5v10l-9 5-9-5V7l9-5zm0 2.2L5 8v8l7 3.8 7-3.8V8l-7-3.8z"/>
    </svg>
  );
}