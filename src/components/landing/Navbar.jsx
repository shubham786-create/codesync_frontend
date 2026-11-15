import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight, Sparkles } from 'lucide-react';

export default function Navbar({ isAuthenticated = false, user = null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent p-0.5 shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
            <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-brand-400 group-hover:scale-110 transition-transform duration-200" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              CodeSync
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                v1.0
              </span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#editor-preview" className="hover:text-white transition-colors">
            Editor
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium shadow-md shadow-brand-600/20 transition-all hover:-translate-y-0.5"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-violet-500 text-white text-sm font-medium shadow-md shadow-brand-500/25 transition-all hover:shadow-glow-sm hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
