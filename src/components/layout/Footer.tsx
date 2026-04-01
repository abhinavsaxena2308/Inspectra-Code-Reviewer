import React from 'react';
import { Github, Twitter, MessageSquare, Terminal } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Features', href: '#' },
    { name: 'Security', href: '#' },
    { name: 'Integrations', href: '#' },
    { name: 'Enterprise', href: '#' }
  ],
  Company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Contact', href: '#' }
  ],
  Resources: [
    { name: 'Documentation', href: '#' },
    { name: 'API Reference', href: '#' },
    { name: 'Community', href: '#' },
    { name: 'Status', href: '#' }
  ],
  Legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Cookie Policy', href: '#' }
  ]
};

export default function Footer() {
  return (
    <footer className="w-full px-6 md:px-10 max-w-5xl mx-auto mt-20 pb-12 relative z-20 border-t border-white/5">
      <div className="pt-16 grid grid-cols-2 md:grid-cols-5 gap-8">
        
        {/* Brand & Socials */}
        <div className="col-span-2 md:col-span-1 border-r border-white/5 pr-8">
          <div className="flex items-center gap-2 mb-6 group cursor-default">
            <div className="w-8 h-8 rounded-lg bg-cyan shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-void" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tighter text-white">Inspectra</span>
          </div>
          <p className="text-xs text-white/30 leading-relaxed mb-6">
            High-performance analytics and observability for modern codebases.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
              <MessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 mb-6">{title}</h4>
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-xs text-white/30 hover:text-cyan transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] uppercase tracking-widest text-white/20 font-medium">
          © {new Date().getFullYear()} Inspectra Inc. All rights reserved.
        </p>
        <p className="text-[10px] uppercase tracking-widest text-white/20 font-medium group cursor-default">
          Designed with <span className="text-error duration-500 group-hover:scale-125 inline-block">❤</span> for the future.
        </p>
      </div>
    </footer>
  );
}
