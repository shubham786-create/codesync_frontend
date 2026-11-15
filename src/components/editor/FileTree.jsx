import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileJson, 
  FileText, 
  FilePlus, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  Check, 
  X 
} from 'lucide-react';

export default function FileTree({
  files = [],
  activeFileId = null,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  readOnly = false,
}) {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [creatingType, setCreatingType] = useState(null); // 'file' | 'folder' | null
  const [creatingParentId, setCreatingParentId] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const toggleFolder = (folderId, e) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'html') return <FileCode className="w-4 h-4 text-orange-400 flex-shrink-0" />;
    if (ext === 'css') return <FileCode className="w-4 h-4 text-sky-400 flex-shrink-0" />;
    if (ext === 'js' || ext === 'jsx') return <FileCode className="w-4 h-4 text-amber-400 flex-shrink-0" />;
    if (ext === 'json') return <FileJson className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    return <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />;
  };

  const handleStartCreate = (type, parentId = null, e) => {
    e?.stopPropagation();
    setCreatingType(type);
    setCreatingParentId(parentId);
    setNewItemName('');
    if (parentId) {
      setExpandedFolders((prev) => ({ ...prev, [parentId]: true }));
    }
  };

  const handleConfirmCreate = () => {
    if (!newItemName.trim()) {
      setCreatingType(null);
      return;
    }
    if (creatingType === 'file') {
      onCreateFile(newItemName.trim(), creatingParentId);
    } else {
      onCreateFolder(newItemName.trim(), creatingParentId);
    }
    setCreatingType(null);
    setNewItemName('');
  };

  const handleStartRename = (item, e) => {
    e.stopPropagation();
    setEditingId(item.id || item._id);
    setEditingName(item.name);
  };

  const handleConfirmRename = () => {
    if (editingName.trim() && editingId) {
      onRename(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  // Build tree hierarchy
  const buildTree = (parentId = null) => {
    return files.filter((f) => {
      const pId = f.parentId ? (f.parentId.toString ? f.parentId.toString() : f.parentId) : null;
      const targetPId = parentId ? (parentId.toString ? parentId.toString() : parentId) : null;
      return pId === targetPId;
    });
  };

  const renderItems = (parentId = null, depth = 0) => {
    const items = buildTree(parentId);
    const idStr = parentId ? (parentId.toString ? parentId.toString() : parentId) : null;
    const isCreatingHere = creatingParentId === idStr && creatingType !== null;

    return (
      <div className="space-y-0.5">
        {items.map((item) => {
          const itemId = item.id || item._id;
          const isFolder = item.type === 'folder';
          const isExpanded = !!expandedFolders[itemId];
          const isActive = activeFileId === itemId;
          const isEditing = editingId === itemId;

          return (
            <div key={itemId}>
              <div
                onClick={() => (isFolder ? toggleFolder(itemId, { stopPropagation: () => {} }) : onSelectFile(item))}
                style={{ paddingLeft: `${depth * 12 + 10}px` }}
                className={`group flex items-center justify-between py-1.5 pr-2 rounded text-xs cursor-pointer select-none transition-colors ${
                  isActive
                    ? 'bg-brand-600/25 text-brand-200 font-semibold border-l-2 border-brand-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
                  {isFolder ? (
                    <>
                      <span className="text-slate-500">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </span>
                      {isExpanded ? (
                        <FolderOpen className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      )}
                    </>
                  ) : (
                    <>
                      <span className="w-3.5" />
                      {getFileIcon(item.name)}
                    </>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full px-1.5 py-0.5 bg-[#0b0f17] border border-brand-500 rounded text-xs text-white focus:outline-none"
                      />
                      <button onClick={handleConfirmRename} className="text-emerald-400 hover:text-emerald-300">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="truncate font-mono">{item.name}</span>
                  )}
                </div>

                {/* Hover Action Buttons */}
                {!readOnly && !isEditing && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    {isFolder && (
                      <button
                        onClick={(e) => handleStartCreate('file', itemId, e)}
                        className="p-1 hover:text-brand-300 hover:bg-slate-700/60 rounded"
                        title="New File Inside Folder"
                      >
                        <FilePlus className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleStartRename(item, e)}
                      className="p-1 hover:text-slate-200 hover:bg-slate-700/60 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                      className="p-1 hover:text-rose-400 hover:bg-rose-500/20 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Recursive child items */}
              {isFolder && isExpanded && renderItems(itemId, depth + 1)}
            </div>
          );
        })}

        {/* Inline input for creating new file/folder */}
        {isCreatingHere && (
          <div
            style={{ paddingLeft: `${depth * 12 + 24}px` }}
            className="flex items-center gap-1 py-1 pr-2"
          >
            {creatingType === 'file' ? (
              <FileCode className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            )}
            <input
              type="text"
              autoFocus
              placeholder={creatingType === 'file' ? 'filename.js' : 'folder-name'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate();
                if (e.key === 'Escape') setCreatingType(null);
              }}
              className="w-full px-1.5 py-0.5 bg-[#0b0f17] border border-brand-500 rounded text-xs text-white focus:outline-none font-mono"
            />
            <button onClick={handleConfirmCreate} className="text-emerald-400 hover:text-emerald-300 p-0.5">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={() => setCreatingType(null)} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0c121e] border-r border-slate-800 select-none">
      {/* File Explorer Header Toolbar */}
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
          Explorer
        </span>

        {!readOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => handleStartCreate('file', null, e)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="New File (Root)"
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleStartCreate('folder', null, e)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="New Folder (Root)"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {files.length === 0 && !creatingType ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No files in workspace.
            {!readOnly && (
              <button
                onClick={(e) => handleStartCreate('file', null, e)}
                className="mt-2 block mx-auto text-brand-400 hover:underline"
              >
                + Create file
              </button>
            )}
          </div>
        ) : (
          renderItems(null, 0)
        )}
      </div>
    </div>
  );
}
