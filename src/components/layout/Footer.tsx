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
              <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="#b61693" stroke="#b61693">
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path fill="none" stroke="#b80faa" strokeWidth="2" d="M5.5,21 C7.98528137,21 10,18.9852814 10,16.5 C10,14.0147186 7.98528137,12 5.5,12 C3.01471863,12 1,14.0147186 1,16.5 C1,18.9852814 3.01471863,21 5.5,21 Z M1,16 L1,7 L1,6.5 C1,4.01471863 3.01471863,2 5.5,2 L6,2 M23,16 L23,7 L23,6.5 C23,4.01471863 20.9852814,2 18.5,2 L18,2 M18.5,21 C20.9852814,21 23,18.9852814 23,16.5 C23,14.0147186 20.9852814,12 18.5,12 C16.0147186,12 14,14.0147186 14,16.5 C14,18.9852814 16.0147186,21 18.5,21 Z M10,17 C10,17 10,15 12,15 C14,15 14,17 14,17"></path>
                </g>
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
          Designed for the future.
        </p>
      </div>
    </footer>
  );
}
