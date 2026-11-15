import React from 'react';
import { Code2, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#070b12] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">CodeSync</span>
              <p className="text-[11px] text-slate-500">Real-time collaborative web code editor</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-6 text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#editor-preview" className="hover:text-white transition-colors">Editor</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Crafted for developers with high standards</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} CodeSync</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
