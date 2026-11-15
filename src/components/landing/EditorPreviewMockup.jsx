import React, { useState } from 'react';
import { 
  FileCode, 
  Play, 
  Users, 
  CheckCircle2, 
  Terminal, 
  Copy, 
  Sparkles,
  Layers,
  ChevronRight,
  FolderTree
} from 'lucide-react';

export default function EditorPreviewMockup() {
  const [activeTab, setActiveTab] = useState('index.html');
  const [copied, setCopied] = useState(false);

  const files = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="glow-card">
    <h1>CodeSync Live</h1>
    <p>Zero-latency real-time code editor.</p>
    <button id="counterBtn" class="primary-btn">
      Clicks: <span id="val">0</span>
    </button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    'style.css': `.glow-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.2);
}

.primary-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}`,
    'script.js': `// Real-time synchronization active
let count = 0;
const btn = document.getElementById('counterBtn');
const display = document.getElementById('val');

btn.addEventListener('click', () => {
  count++;
  display.textContent = count;
  console.log('[CodeSync] Counter updated:', count);
});`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="editor-preview" className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-2xl shadow-brand-950/40">
      {/* Top Window Bar */}
      <div className="bg-[#0b0f17] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-xs text-slate-500 font-mono ml-2 hidden sm:inline">
            workspace: production-app / {activeTab}
          </span>
        </div>

        {/* Center Save Status */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          <span>Synced with MongoDB & Yjs</span>
        </div>

        {/* Right Collaborators */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5 overflow-hidden">
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-[10px] font-bold text-white border-2 border-[#0b0f17]" title="Sarah (Owner)">
              S
            </div>
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-[10px] font-bold text-white border-2 border-[#0b0f17]" title="Alex (Editor)">
              A
            </div>
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-[10px] font-bold text-white border-2 border-[#0b0f17]" title="Devin (Viewer)">
              D
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">3 online</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Sidebar File Tree */}
        <div className="hidden md:block lg:col-span-3 bg-[#0c121e] border-r border-slate-800/80 p-3">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-brand-400" />
              Explorer
            </span>
            <span className="text-[10px] text-slate-500">3 files</span>
          </div>

          <div className="space-y-1">
            {Object.keys(files).map((filename) => {
              const isActive = activeTab === filename;
              return (
                <button
                  key={filename}
                  onClick={() => setActiveTab(filename)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors text-left ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-300 font-semibold border-l-2 border-brand-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${
                    filename.endsWith('.html') ? 'text-orange-400' :
                    filename.endsWith('.css') ? 'text-sky-400' : 'text-amber-400'
                  }`} />
                  <span>{filename}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="mt-8 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-brand-400 font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multiplayer CRDT</span>
            </div>
            <p className="leading-relaxed">
              Every keystroke merges deterministically via Yjs without lock contention.
            </p>
          </div>
        </div>

        {/* Center Editor */}
        <div className="lg:col-span-5 bg-[#090d16] flex flex-col border-r border-slate-800/80">
          {/* File Tabs */}
          <div className="flex items-center bg-[#070b12] border-b border-slate-800/80 overflow-x-auto">
            {Object.keys(files).map((filename) => {
              const isActive = activeTab === filename;
              return (
                <button
                  key={filename}
                  onClick={() => setActiveTab(filename)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border-r border-slate-800 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#090d16] text-white border-t-2 border-t-brand-500 font-medium'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <FileCode className="w-3 h-3 text-brand-400" />
                  <span>{filename}</span>
                </button>
              );
            })}

            <div className="ml-auto pr-3">
              <button
                onClick={handleCopy}
                className="text-slate-500 hover:text-slate-300 p-1 rounded"
                title="Copy snippet"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Code Body with Line Numbers & Remote Cursor Simulation */}
          <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto flex-1 leading-relaxed relative">
            <div className="flex">
              {/* Line Numbers */}
              <div className="select-none text-slate-600 pr-4 text-right">
                {files[activeTab].split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Content */}
              <div className="flex-1 whitespace-pre relative">
                {files[activeTab]}

                {/* Simulated Remote Cursor for Alex */}
                {activeTab === 'index.html' && (
                  <div className="absolute top-[88px] left-[170px] pointer-events-none flex items-start">
                    <div className="w-0.5 h-4 bg-violet-400 animate-pulse"></div>
                    <div className="bg-violet-600 text-[9px] font-sans font-semibold text-white px-1.5 py-0.5 rounded shadow-sm -mt-4 ml-0.5 whitespace-nowrap">
                      Alex
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Preview Panel */}
        <div className="lg:col-span-4 bg-[#0d1424] flex flex-col">
          <div className="px-3 py-2 bg-[#0a0f1c] border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              Live Sandboxed Preview
            </span>
            <span className="text-[10px] text-slate-500 font-mono">sandboxed: iframe</span>
          </div>

          {/* Interactive Preview Viewport */}
          <div className="p-6 flex-1 flex flex-col items-center justify-center bg-[#070d19]">
            <div className="w-full max-w-xs rounded-xl bg-slate-900/90 border border-slate-800 p-5 text-center shadow-lg">
              <span className="inline-block px-2 py-0.5 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-[10px] font-semibold uppercase mb-3">
                Live Output
              </span>
              <h4 className="text-base font-bold text-white mb-1">CodeSync Live</h4>
              <p className="text-xs text-slate-400 mb-4">Zero-latency real-time code editor.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-accent text-white text-xs font-semibold shadow-md">
                Clicks: 14
              </div>
            </div>
          </div>

          {/* Embedded Console Bar */}
          <div className="border-t border-slate-800 bg-[#080d17] p-2.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <Terminal className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-slate-500">Console:</span>
              <span className="text-emerald-400">[CodeSync] Runtime preview initialized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
