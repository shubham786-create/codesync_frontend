import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workspaceService } from '../services/workspaceService';
import FileTree from '../components/editor/FileTree';
import EditorTabs from '../components/editor/EditorTabs';
import CodeEditor from '../components/editor/CodeEditor';
import EditorStatusBar from '../components/editor/EditorStatusBar';
import { useYjsMonaco } from '../hooks/useYjsMonaco';
import { bundlePreview } from '../services/previewBundler';
import { getSocket } from '../services/socket';
import api from '../services/api';
import { 
  Code2, 
  ArrowLeft, 
  Play, 
  Share2, 
  Settings, 
  Users, 
  Terminal, 
  MessageSquare, 
  Eye, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  Lock,
  ChevronDown,
  X,
  Copy,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

export default function EditorPage() {
  const { id: workspaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Workspace & files state
  const [workspace, setWorkspace] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'offline'
  const [dirtyFiles, setDirtyFiles] = useState({});

  // Editor settings
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState('on');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Right panel tabs: 'preview' | 'console' | 'chat'
  const [activeRightTab, setActiveRightTab] = useState('preview');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Console state
  const [consoleLogs, setConsoleLogs] = useState([]);

  // Collaborators & Presence
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);

  // Share & Invite modal state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteToken, setInviteToken] = useState('');
  const [generatingInvite, setGeneratingInvite] = useState(false);

  // Monaco editor instance state for Yjs binding
  const [editorInstance, setEditorInstance] = useState(null);
  const editorInstanceRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const iframeRef = useRef(null);

  // Memoized handlers to avoid re-triggering hooks or re-renders
  const handleRemoteUsersChange = useCallback((remoteUsers) => {
    if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
      setOnlineUsers((prev) => {
        if (
          prev.length === remoteUsers.length &&
          prev.every((u, i) => u.clientId === remoteUsers[i].clientId && u.name === remoteUsers[i].name)
        ) {
          return prev;
        }
        return remoteUsers;
      });
    }
  }, []);

  const handleEditorMount = useCallback((editor, monaco) => {
    editorInstanceRef.current = editor;
    monacoInstanceRef.current = monaco;
    setEditorInstance(editor);
  }, []);

  const handleCursorChange = useCallback((pos) => {
    setCursorPos((prev) => {
      if (prev.line === pos.line && prev.col === pos.col) {
        return prev; // Identical position, bail out to avoid re-render
      }
      return pos;
    });
  }, []);

  // Yjs Real-Time CRDT Collaboration Hook
  const { synced: isYjsSynced, connecting: isYjsConnecting } = useYjsMonaco({
    workspaceId,
    activeFileId,
    editor: editorInstance,
    user,
    userRole: workspace?.role,
    onRemoteUsersChange: handleRemoteUsersChange,
  });

  // Active file object
  const activeFile = files.find((f) => (f.id || f._id) === activeFileId);

  // Handle Run Preview
  const handleRunPreview = useCallback(() => {
    try {
      const monaco = monacoInstanceRef.current;
      const updatedFiles = files.map((f) => {
        const fId = f.id || f._id;
        if (fId === activeFileId && editorInstanceRef.current) {
          return { ...f, content: editorInstanceRef.current.getValue() };
        }
        if (monaco) {
          const model = monaco.editor.getModels().find((m) => m.uri.toString().includes(fId));
          if (model && !model.isDisposed()) {
            return { ...f, content: model.getValue() };
          }
        }
        return f;
      });

      const preferredHtml = activeFile?.name?.endsWith('.html') ? activeFile.name : 'index.html';
      const bundledHtml = bundlePreview(updatedFiles, preferredHtml);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = bundledHtml;
      }
      toast.success('Preview reloaded successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to generate preview');
    }
  }, [files, activeFile, activeFileId]);

  // PostMessage listener for sandboxed console logs
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'CODESYNC_CONSOLE_LOG') {
        setConsoleLogs((prev) => [
          ...prev.slice(-150), // keep last 150 logs
          {
            level: event.data.level || 'log',
            message: event.data.message || '',
            time: event.data.time || new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initial auto-run preview once files are loaded
  useEffect(() => {
    if (files.length > 0 && iframeRef.current && !iframeRef.current.srcdoc) {
      try {
        const bundledHtml = bundlePreview(files, 'index.html');
        iframeRef.current.srcdoc = bundledHtml;
      } catch (e) {
        // Ignored on initial boot if index.html is still loading
      }
    }
  }, [files]);

  // Load workspace & files
  const loadWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      const [wsData, filesData] = await Promise.all([
        workspaceService.getWorkspace(workspaceId),
        workspaceService.listFiles(workspaceId),
      ]);

      setWorkspace(wsData);
      setFiles(filesData);

      // Default online users (current user + owner)
      setOnlineUsers([
        {
          id: user?.id || user?._id,
          name: user?.name,
          avatarColor: user?.avatarColor || '#6366f1',
          role: wsData.role,
        },
      ]);

      // Open initial file (prefer index.html or first file)
      if (filesData.length > 0) {
        const indexHtml = filesData.find((f) => f.name.toLowerCase() === 'index.html');
        const initialFile = indexHtml || filesData.find((f) => f.type === 'file') || filesData[0];
        const initialId = initialFile.id || initialFile._id;

        // Fetch complete content
        const fullFile = await workspaceService.getFile(workspaceId, initialId);
        setFiles((prev) =>
          prev.map((f) => ((f.id || f._id) === initialId ? fullFile : f))
        );
        setOpenFiles([fullFile]);
        setActiveFileId(initialId);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load workspace.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, user, navigate]);

  useEffect(() => {
    if (user) {
      loadWorkspaceData();
    }
  }, [user, loadWorkspaceData]);

  // Socket.IO real-time connection for presence, chat, and file system synchronization
  useEffect(() => {
    if (!workspaceId) return;

    // Load initial chat history
    api
      .get(`/workspaces/${workspaceId}/messages`)
      .then((res) => {
        setChatMessages(res.data.messages || []);
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }, 60);
      })
      .catch((err) => console.warn('Could not load chat messages:', err));

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('workspace:join', { workspaceId });

    socket.on('workspace:presence', (activeMembers) => {
      if (activeMembers && activeMembers.length > 0) {
        setOnlineUsers(activeMembers);
      }
    });

    socket.on('chat:message', (newMsg) => {
      setChatMessages((prev) => [...prev, newMsg]);
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 60);
    });

    socket.on('file:created', (newFile) => {
      setFiles((prev) => {
        if (prev.some((f) => (f.id || f._id) === (newFile.id || newFile._id))) return prev;
        return [...prev, newFile];
      });
      toast.info(`Teammate created "${newFile.name}"`);
    });

    socket.on('file:renamed', (updated) => {
      const uId = updated.id || updated._id;
      setFiles((prev) => prev.map((f) => ((f.id || f._id) === uId ? updated : f)));
    });

    socket.on('file:deleted', (deletedId) => {
      setFiles((prev) => prev.filter((f) => (f.id || f._id) !== deletedId));
      handleCloseTab(deletedId);
    });

    return () => {
      socket.off('workspace:presence');
      socket.off('chat:message');
      socket.off('file:created');
      socket.off('file:renamed');
      socket.off('file:deleted');
    };
  }, [workspaceId]);

  // Handle file selection from FileTree or Tab
  const handleSelectFile = async (file) => {
    const fileId = file.id || file._id;
    if (file.type === 'folder') return;

    // Persist current editor value before switching active tab
    if (activeFileId && editorInstanceRef.current) {
      const curVal = editorInstanceRef.current.getValue();
      setFiles((prev) =>
        prev.map((f) => ((f.id || f._id) === activeFileId ? { ...f, content: curVal } : f))
      );
      setOpenFiles((prev) =>
        prev.map((f) => ((f.id || f._id) === activeFileId ? { ...f, content: curVal } : f))
      );
    }

    // Check if full content is loaded
    let targetFile = files.find((f) => (f.id || f._id) === fileId);
    if (!targetFile || targetFile.content === undefined) {
      try {
        const full = await workspaceService.getFile(workspaceId, fileId);
        setFiles((prev) =>
          prev.map((f) => ((f.id || f._id) === fileId ? full : f))
        );
        targetFile = full;
      } catch (err) {
        toast.error('Failed to load file content');
        return;
      }
    }

    // Add to open tabs if not present
    if (!openFiles.some((f) => (f.id || f._id) === fileId)) {
      setOpenFiles((prev) => [...prev, targetFile]);
    }
    setActiveFileId(fileId);
  };

  const handleCloseTab = (fileId) => {
    const remaining = openFiles.filter((f) => (f.id || f._id) !== fileId);
    setOpenFiles(remaining);

    if (activeFileId === fileId) {
      if (remaining.length > 0) {
        setActiveFileId(remaining[remaining.length - 1].id || remaining[remaining.length - 1]._id);
      } else {
        setActiveFileId(null);
      }
    }
  };

  // Editor content change
  const handleContentChange = (newContent) => {
    if (!activeFileId) return;

    // Update local state
    setFiles((prev) =>
      prev.map((f) => ((f.id || f._id) === activeFileId ? { ...f, content: newContent } : f))
    );
    setOpenFiles((prev) =>
      prev.map((f) => ((f.id || f._id) === activeFileId ? { ...f, content: newContent } : f))
    );

    setDirtyFiles((prev) => ({ ...prev, [activeFileId]: true }));
    setSaveStatus('saving');

    // Debounced autosave
    debounceSave(activeFileId, newContent);
  };

  const saveTimeoutRef = useRef({});
  const debounceSave = (fileId, content) => {
    if (saveTimeoutRef.current[fileId]) {
      clearTimeout(saveTimeoutRef.current[fileId]);
    }

    saveTimeoutRef.current[fileId] = setTimeout(async () => {
      try {
        await workspaceService.updateFile(workspaceId, fileId, { content });
        setDirtyFiles((prev) => {
          const next = { ...prev };
          delete next[fileId];
          return next;
        });
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('offline');
        console.error('Save failed:', err);
      }
    }, 1000);
  };

  // File CRUD handlers
  const handleCreateFile = async (name, parentId = null) => {
    try {
      const newFile = await workspaceService.createFile(workspaceId, {
        name,
        parentId,
        type: 'file',
        content: '',
      });
      setFiles((prev) => [...prev, newFile]);
      setOpenFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id || newFile._id);
      getSocket().emit('file:created', { workspaceId, file: newFile });
      toast.success(`Created file "${name}"`);
    } catch (err) {
      toast.error(err.message || 'Failed to create file.');
    }
  };

  const handleCreateFolder = async (name, parentId = null) => {
    try {
      const newFolder = await workspaceService.createFile(workspaceId, {
        name,
        parentId,
        type: 'folder',
      });
      setFiles((prev) => [...prev, newFolder]);
      getSocket().emit('file:created', { workspaceId, file: newFolder });
      toast.success(`Created folder "${name}"`);
    } catch (err) {
      toast.error(err.message || 'Failed to create folder.');
    }
  };

  const handleRename = async (fileId, newName) => {
    try {
      const updated = await workspaceService.updateFile(workspaceId, fileId, {
        name: newName,
      });
      setFiles((prev) =>
        prev.map((f) => ((f.id || f._id) === fileId ? updated : f))
      );
      setOpenFiles((prev) =>
        prev.map((f) => ((f.id || f._id) === fileId ? { ...f, name: updated.name, path: updated.path } : f))
      );
      getSocket().emit('file:renamed', { workspaceId, file: updated });
      toast.success('Renamed successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to rename.');
    }
  };

  const handleDelete = async (item) => {
    const itemId = item.id || item._id;
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      await workspaceService.deleteFile(workspaceId, itemId);
      setFiles((prev) => prev.filter((f) => (f.id || f._id) !== itemId));
      handleCloseTab(itemId);
      getSocket().emit('file:deleted', { workspaceId, fileId: itemId });
      toast.success(`Deleted "${item.name}"`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  };

  // Chat message sending
  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const socket = getSocket();
    socket.emit('chat:send', {
      workspaceId,
      content: chatInput.trim(),
    });
    setChatInput('');
  };

  // Generate Invite Link
  const handleGenerateInvite = async () => {
    try {
      setGeneratingInvite(true);
      const res = await api.post(`/workspaces/${workspaceId}/invitations`, {
        role: inviteRole,
      });
      setInviteToken(res.data.inviteUrl);
      toast.success('Invitation link created!');
    } catch (err) {
      toast.error(err.message || 'Failed to create invite link.');
    } finally {
      setGeneratingInvite(false);
    }
  };

  // Manual save trigger (Ctrl+S)
  const handleManualSave = useCallback(async () => {
    if (!activeFileId || !activeFile) return;
    setSaveStatus('saving');
    try {
      const currentContent = editorInstanceRef.current
        ? editorInstanceRef.current.getValue()
        : activeFile.content || '';
      await workspaceService.updateFile(workspaceId, activeFileId, {
        content: currentContent,
      });
      setDirtyFiles((prev) => {
        const next = { ...prev };
        delete next[activeFileId];
        return next;
      });
      setSaveStatus('saved');
      toast.success('File saved');
    } catch (err) {
      setSaveStatus('offline');
      toast.error('Save failed');
    }
  }, [workspaceId, activeFileId, activeFile]);

  const isReadOnly = workspace?.role === 'viewer';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">
          Loading CodeSync Workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0b0f17] text-slate-100 overflow-hidden select-none">
      {/* TOP HEADER NAVIGATION */}
      <header className="h-12 bg-[#0f172a] border-b border-slate-800 px-3 flex items-center justify-between text-xs z-30">
        {/* Left: Back button, Logo & Workspace Title */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight truncate max-w-[200px]">
              {workspace?.name}
            </span>
          </div>

          {/* Save Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-400">Saved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-amber-400">Saving...</span>
              </>
            )}
            {saveStatus === 'offline' && (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="text-slate-500">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Online Collaborator Avatars */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex -space-x-1.5 overflow-hidden">
            {onlineUsers.map((u, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0f172a] shadow"
                style={{ backgroundColor: u.avatarColor || '#6366f1' }}
                title={`${u.name} (${u.role || 'Member'})`}
              >
                {u.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {onlineUsers.length} online
          </span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Run Preview Button */}
          <button
            onClick={() => {
              handleRunPreview();
              setActiveRightTab('preview');
              setRightPanelOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950 transition-all hover:scale-[1.02]"
            title="Execute Code & Refresh Preview"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Settings Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Editor Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#0f172a] border border-slate-800 rounded-xl p-3 shadow-2xl z-50 text-xs">
                <div className="font-semibold text-white mb-2">Editor Preferences</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value={12}>12 px</option>
                      <option value={14}>14 px</option>
                      <option value={16}>16 px</option>
                      <option value={18}>18 px</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Word Wrap</label>
                    <select
                      value={wordWrap}
                      onChange={(e) => setWordWrap(e.target.value)}
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN SPLIT WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: FILE EXPLORER */}
        <div className="w-64 min-w-[180px] max-w-xs h-full flex-shrink-0">
          <FileTree
            files={files}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onRename={handleRename}
            onDelete={handleDelete}
            readOnly={isReadOnly}
          />
        </div>

        {/* CENTER: MONACO CODE EDITOR & TABS */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#090d16] overflow-hidden">
          {/* Multi-file Tabs Bar */}
          <EditorTabs
            openFiles={openFiles}
            activeFileId={activeFileId}
            onSelectTab={handleSelectFile}
            onCloseTab={handleCloseTab}
            dirtyFiles={dirtyFiles}
          />

          {/* Monaco Editor or Empty State */}
          <div className="flex-1 relative overflow-hidden">
            {activeFile ? (
              <CodeEditor
                path={`codesync://${workspaceId}/${activeFileId}/${activeFile.name}`}
                defaultValue={activeFile.content || ''}
                language={activeFile.extension || 'javascript'}
                onSave={handleManualSave}
                onCursorChange={handleCursorChange}
                onEditorMount={handleEditorMount}
                readOnly={isReadOnly}
                fontSize={fontSize}
                wordWrap={wordWrap}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <Code2 className="w-12 h-12 text-slate-700" />
                <p className="text-xs font-mono">No file selected. Choose a file from the explorer.</p>
              </div>
            )}
          </div>

          {/* Editor Status Bar */}
          <EditorStatusBar
            cursorPosition={cursorPos}
            language={activeFile?.extension || 'javascript'}
            connectionStatus={
              saveStatus === 'saved'
                ? isYjsSynced
                  ? 'connected'
                  : isYjsConnecting
                  ? 'syncing'
                  : 'connected'
                : saveStatus
            }
            readOnly={isReadOnly}
            wordWrap={wordWrap}
            onToggleWordWrap={() => setWordWrap((w) => (w === 'on' ? 'off' : 'on'))}
          />
        </div>

        {/* RIGHT PANEL: PREVIEW, CONSOLE & CHAT */}
        {rightPanelOpen && (
          <div className="w-96 lg:w-[480px] h-full flex flex-col border-l border-slate-800 bg-[#0c121e] flex-shrink-0">
            {/* Right Panel Header Tabs */}
            <div className="h-9 bg-[#090d16] border-b border-slate-800 px-2 flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveRightTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    activeRightTab === 'preview'
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => setActiveRightTab('console')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    activeRightTab === 'console'
                      ? 'bg-slate-800 text-amber-400 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Console</span>
                  {consoleLogs.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] text-slate-300">
                      {consoleLogs.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveRightTab('chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    activeRightTab === 'chat'
                      ? 'bg-slate-800 text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>

              <button
                onClick={() => setRightPanelOpen(false)}
                className="p-1 text-slate-500 hover:text-white rounded"
                title="Collapse Panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Panel Tab Contents */}
            <div className="flex-1 relative overflow-hidden bg-[#070b12]">
              {/* TAB 1: PREVIEW (Prepared for Phase 6 Sandboxed Execution) */}
              {activeRightTab === 'preview' && (
                <div className="h-full flex flex-col">
                  <div className="p-2 border-b border-slate-800/80 bg-[#090d16] flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px] text-slate-500">
                      Sandboxed HTML/CSS/JS Environment
                    </span>
                    <button
                      onClick={handleRunPreview}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Reload Preview"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 bg-white relative">
                    <iframe
                      ref={iframeRef}
                      title="CodeSync Live Preview"
                      sandbox="allow-scripts allow-modals"
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CONSOLE */}
              {activeRightTab === 'console' && (
                <div className="h-full flex flex-col font-mono text-xs">
                  <div className="p-2 border-b border-slate-800 bg-[#090d16] flex items-center justify-between text-slate-400">
                    <span className="text-[11px]">Runtime Logs</span>
                    <button
                      onClick={() => setConsoleLogs([])}
                      className="p-1 hover:text-white rounded text-slate-400"
                      title="Clear Console"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-slate-300">
                    {consoleLogs.length === 0 ? (
                      <div className="text-slate-600 text-[11px]">Console is empty. Click "Run" to execute.</div>
                    ) : (
                      consoleLogs.map((log, i) => (
                        <div key={i} className="leading-relaxed">
                          <span className="text-slate-500 text-[10px] mr-2">[{log.time}]</span>
                          <span className={log.level === 'error' ? 'text-rose-400' : log.level === 'warn' ? 'text-amber-400' : 'text-slate-200'}>
                            {log.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CHAT */}
              {activeRightTab === 'chat' && (
                <div className="h-full flex flex-col text-xs">
                  <div className="p-2 border-b border-slate-800 bg-[#090d16] text-slate-400 font-semibold text-[11px] flex items-center justify-between">
                    <span>Workspace Team Chat</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {chatMessages.length} {chatMessages.length === 1 ? 'message' : 'messages'}
                    </span>
                  </div>

                  <div ref={chatScrollRef} className="flex-1 p-3 overflow-y-auto space-y-3">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center text-[11px] py-12">
                        <MessageSquare className="w-8 h-8 text-slate-700 mb-2" />
                        <span>No messages yet. Send a message to chat in real-time!</span>
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => {
                        const isMe = msg.senderId === (user?.id || user?._id);
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: msg.senderColor || '#6366f1' }}
                              />
                              <span className="font-medium text-slate-300">
                                {isMe ? 'You' : msg.senderName}
                              </span>
                              <span className="text-slate-500 text-[9px]">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div
                              className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words shadow-sm leading-relaxed ${
                                isMe
                                  ? 'bg-brand-600 text-white rounded-tr-none'
                                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/80'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form
                    onSubmit={handleSendChat}
                    className="p-2.5 border-t border-slate-800 bg-[#090d16] flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Send message to team..."
                      className="flex-1 px-3 py-1.5 bg-[#0b0f17] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
                      title="Send Message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SHARE / INVITATION MODAL */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsShareOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">Share Workspace</h3>
            <p className="text-xs text-slate-400 mb-4">
              Invite teammates to collaborate in "{workspace?.name}".
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Designated Collaborator Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => {
                    setInviteRole(e.target.value);
                    setInviteToken(''); // Reset generated link on role change
                  }}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="editor">Editor (Can edit files and collaborate)</option>
                  <option value="viewer">Viewer (Read-only access)</option>
                </select>
              </div>

              {/* Generate Invite Link Button or Display */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Invite Link (valid for 7 days)
                </label>
                {inviteToken ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteToken}
                      className="flex-1 px-3 py-2 bg-[#0b0f17] border border-brand-500/50 rounded-lg text-xs text-brand-300 font-mono select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteToken);
                        toast.success('Invitation link copied to clipboard!');
                      }}
                      className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Copy Link"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateInvite}
                    disabled={generatingInvite}
                    className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2"
                  >
                    {generatingInvite && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Generate Shareable Invite Link</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Workspace Unique ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={workspaceId}
                    className="flex-1 px-3 py-1.5 bg-[#0b0f17] border border-slate-800 rounded-lg text-xs text-slate-400 font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(workspaceId);
                      toast.success('Workspace ID copied');
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                    title="Copy ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
