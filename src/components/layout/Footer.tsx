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
    <footer className="w-full px-6 md:px-10 max-w-7xl mx-auto mt-24 pb-12 relative z-20 border-t border-outline-variant/20">
      <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 md:gap-8">
        
        {/* Brand & Socials */}
        <div className="col-span-1 sm:col-span-2 md:col-span-1 md:border-r border-outline-variant/20 md:pr-8">
          <div className="flex items-center gap-3 mb-6 group cursor-default">
            <div className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center p-1.5 bg-gradient-to-br from-surface-container-high to-surface-container">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3.5 7V17L12 22L20.5 17V7L12 2Z" className="stroke-on-surface-variant/50" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 6V18" className="stroke-outline-variant" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3" className="fill-primary/50"/>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-widest uppercase text-on-surface">
              Inspectra
            </span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            High-performance analytics and observability for modern codebases.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all">
              <MessageSquare className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Links Columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-sm font-semibold text-on-surface mb-6">{title}</h4>
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-on-surface-variant/50">
          © {new Date().getFullYear()} Inspectra Inc. All rights reserved.
        </p>
        <p className="text-xs text-on-surface-variant/50 group cursor-default">
          Designed with <span className="text-error duration-500 group-hover:scale-125 inline-block">❤</span> for the future.
        </p>
      </div>
    </footer>
  );
}
