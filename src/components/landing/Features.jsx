import React from 'react';
import { 
  Users2, 
  Code2, 
  PlayCircle, 
  Terminal, 
  FolderTree, 
  ShieldCheck, 
  MessageSquare, 
  Database 
} from 'lucide-react';

export default function Features() {
  const featureList = [
    {
      icon: Users2,
      title: "Real-Time CRDT Collaboration",
      description: "Powered by Yjs and Monaco bindings. Multiple teammates can edit identical files simultaneously with remote cursor presence and zero conflicts.",
      tag: "Multiplayer",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Code2,
      title: "Monaco Editor Experience",
      description: "The identical engine behind VS Code. Enjoy intelligent autocomplete, multiple tabs, syntax highlighting, bracket matching, and smooth indentation.",
      tag: "Editor",
      color: "from-indigo-500 to-violet-500",
    },
    {
      icon: PlayCircle,
      title: "Sandboxed Live Preview",
      description: "Instant web runtime in an isolated, sandboxed iframe. Resolves relative CSS and JavaScript imports safely without leaking cookies or parent DOM.",
      tag: "Runtime",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Terminal,
      title: "Live Console Panel",
      description: "Captures and displays console.log, warnings, and unhandled JavaScript runtime exceptions through a validated postMessage bridge.",
      tag: "Debugging",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: FolderTree,
      title: "Hierarchical File Explorer",
      description: "Create, rename, delete, and nest files and folders. Broadcasts structure mutations instantly across all active collaborators.",
      tag: "File System",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access Control",
      description: "Granular roles for Owners, Editors, and Viewers. Enforced at the REST API, Socket.IO rooms, and binary CRDT sync layers.",
      tag: "Security",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: MessageSquare,
      title: "Workspace Real-Time Chat",
      description: "Collaborative in-editor chat channel powered by Socket.IO with persistent message history and member avatars.",
      tag: "Communication",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Database,
      title: "Durable Cloud Persistence",
      description: "Debounced autosave flushes document states to MongoDB. Reconnect smoothly after disconnects or server restarts with zero data loss.",
      tag: "Storage",
      color: "from-emerald-500 to-cyan-500",
    },
  ];

  return (
    <section id="features" className="py-24 border-t border-slate-800/80 bg-[#090d16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-brand-400 font-semibold mb-3">
            Engineered for Modern Teams
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything you need for seamless collaborative coding
          </h3>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Every layer of CodeSync is built from the ground up for speed, security, and developer joy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-xl border border-slate-800 bg-[#0f172a]/60 hover:bg-[#131d36]/80 p-6 transition-all duration-300 hover:border-slate-700 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-brand-950/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${feature.color} p-0.5 shadow-md`}>
                    <div className="w-full h-full bg-[#0b0f17] rounded-[7px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                    {feature.tag}
                  </span>
                </div>

                <h4 className="text-base font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
