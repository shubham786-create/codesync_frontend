import React from 'react';
import { FileCode, FileJson, FileText, X } from 'lucide-react';

export default function EditorTabs({
  openFiles = [],
  activeFileId = null,
  onSelectTab,
  onCloseTab,
  dirtyFiles = {},
}) {
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'html') return <FileCode className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />;
    if (ext === 'css') return <FileCode className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />;
    if (ext === 'js' || ext === 'jsx') return <FileCode className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
    if (ext === 'json') return <FileJson className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
    return <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />;
  };

  return (
    <div className="flex items-center bg-[#070b12] border-b border-slate-800/80 overflow-x-auto no-scrollbar h-9">
      {openFiles.map((file) => {
        const fileId = file.id || file._id;
        const isActive = activeFileId === fileId;
        const isDirty = !!dirtyFiles[fileId];

        return (
          <div
            key={fileId}
            onClick={() => onSelectTab(file)}
            onAuxClick={(e) => {
              if (e.button === 1) {
                // Middle click closes tab
                e.preventDefault();
                onCloseTab(fileId);
              }
            }}
            className={`group flex items-center gap-2 px-3 h-full text-xs font-mono border-r border-slate-800/80 cursor-pointer select-none transition-colors whitespace-nowrap relative ${
              isActive
                ? 'bg-[#090d16] text-white border-t-2 border-t-brand-500 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {getFileIcon(file.name)}
            <span>{file.name}</span>

            {/* Dirty indicator or close button */}
            <div className="flex items-center ml-1">
              {isDirty && (
                <span className="w-2 h-2 rounded-full bg-brand-400 group-hover:hidden" title="Unsaved changes" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(fileId);
                }}
                className={`p-0.5 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors ${
                  isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Close Tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
