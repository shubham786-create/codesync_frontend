import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Terminal, Shield, Zap, Code } from 'lucide-react';
import EditorPreviewMockup from './EditorPreviewMockup';

export default function Hero({ isAuthenticated = false }) {
  return (
    <section className="relative pt-12 pb-24 overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Gen Multiplayer Developer Environment</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Real-Time Collaboration{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-brand-accent bg-clip-text text-transparent">
              Meets Code Editing
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8">
            CodeSync combines the precision of Monaco Editor, the conflict-free multiplayer magic of Yjs, and an instant sandboxed web preview. Build, edit, and debug together without friction.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-accent hover:from-brand-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition-all hover:shadow-glow hover:-translate-y-0.5"
            >
              <span>{isAuthenticated ? "Launch Dashboard" : "Create Workspace Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#editor-preview"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition-all"
            >
              <span>Explore Interactive Editor</span>
            </a>
          </div>

          {/* Feature Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>Yjs CRDT Convergence</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Monaco Editor Core</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Isolated Sandboxed Preview</span>
            </div>
          </div>
        </div>

        {/* Visual Mockup */}
        <EditorPreviewMockup />
      </div>
    </section>
  );
}
