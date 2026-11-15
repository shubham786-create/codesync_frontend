import React from 'react';
import { PlusCircle, UserPlus, Code2, Play } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: PlusCircle,
      title: "Initialize Workspace",
      description: "Spin up a new workspace in one click. Start with an empty project or an interactive HTML/CSS/JS template ready for instant execution."
    },
    {
      step: "02",
      icon: UserPlus,
      title: "Invite Your Teammates",
      description: "Generate cryptographically secure invitation links. Set role permissions to Editor or Viewer to control write capabilities."
    },
    {
      step: "03",
      icon: Code2,
      title: "Code Simultaneously",
      description: "Collaborate inside the Monaco editor with real-time remote cursors, selections, and zero-conflict CRDT synchronization."
    },
    {
      step: "04",
      icon: Play,
      title: "Run & Inspect Instantly",
      description: "Click Run to preview your web application in an isolated sandbox with a connected browser console catching logs and runtime errors."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-slate-800/80 bg-[#0b0f17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-3">
            Workflow Overview
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            From creation to multiplayer execution in seconds
          </h3>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            No local development setup or complex git merges required. Just open your browser and build.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="relative flex flex-col items-start p-6 rounded-xl border border-slate-800 bg-[#0e1626]/40 hover:bg-[#111b2f] transition-colors">
                <div className="flex items-center justify-between w-full mb-5">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-700 select-none">
                    {item.step}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
