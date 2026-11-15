import React from 'react';
import { Wifi, WifiOff, Lock, AlignLeft } from 'lucide-react';

export default function EditorStatusBar({
  cursorPosition = { line: 1, col: 1 },
  language = 'javascript',
  connectionStatus = 'connected', // 'connected' | 'syncing' | 'offline'
  readOnly = false,
  wordWrap = 'on',
  onToggleWordWrap,
}) {
  const getLanguageLabel = (lang) => {
    const map = {
      javascript: 'JavaScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      markdown: 'Markdown',
    };
    return map[lang] || lang.toUpperCase();
  };

  return (
    <div className="h-6 bg-[#070b12] border-t border-slate-800/80 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
      {/* Left side: Connection status & read-only lock */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" title={`Real-time sync: ${connectionStatus}`}>
          {connectionStatus === 'connected' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-sans text-[10px] font-medium">Connected</span>
            </>
          )}
          {connectionStatus === 'syncing' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 font-sans text-[10px] font-medium">Syncing...</span>
            </>
          )}
          {connectionStatus === 'offline' && (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-500 font-sans text-[10px] font-medium">Offline</span>
            </>
          )}
        </div>

        {readOnly && (
          <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px] font-sans">
            <Lock className="w-3 h-3" />
            <span>Read Only (Viewer)</span>
          </div>
        )}
      </div>

      {/* Right side: Cursor, indentation, encoding, language, word wrap */}
      <div className="flex items-center gap-4">
        <div className="hover:text-slate-200 transition-colors cursor-default">
          Ln {cursorPosition.line}, Col {cursorPosition.col}
        </div>

        <div className="hover:text-slate-200 transition-colors cursor-default hidden sm:inline">
          Spaces: 2
        </div>

        <div className="hover:text-slate-200 transition-colors cursor-default hidden sm:inline">
          UTF-8
        </div>

        <button
          onClick={onToggleWordWrap}
          className={`hover:text-white transition-colors flex items-center gap-1 ${
            wordWrap === 'on' ? 'text-brand-400' : 'text-slate-500'
          }`}
          title="Toggle Word Wrap"
        >
          <AlignLeft className="w-3 h-3" />
          <span className="hidden md:inline">Wrap: {wordWrap}</span>
        </button>

        <div className="font-semibold text-slate-300">
          {getLanguageLabel(language)}
        </div>
      </div>
    </div>
  );
}
