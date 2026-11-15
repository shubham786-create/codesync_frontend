import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workspaceService } from '../services/workspaceService';
import { 
  Code2, 
  Plus, 
  FolderPlus, 
  Search, 
  Clock, 
  Users, 
  ArrowRight, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Sparkles, 
  LogOut, 
  Loader2,
  Layers,
  Shield,
  FileCode2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../lib/utils';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // Form states
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDesc, setWorkspaceDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('starter');
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await workspaceService.listWorkspaces();
      setWorkspaces(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces;
    return workspaces.filter((ws) =>
      ws.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      ws.description?.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [workspaces, searchQuery]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setSubmitting(true);
    try {
      const newWs = await workspaceService.createWorkspace({
        name: workspaceName.trim(),
        description: workspaceDesc.trim(),
        template: selectedTemplate,
      });
      toast.success(`Workspace "${newWs.name}" created!`);
      setIsCreateOpen(false);
      setWorkspaceName('');
      setWorkspaceDesc('');
      fetchWorkspaces();
      // Navigate straight to the new workspace editor
      navigate(`/workspace/${newWs.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim() || !selectedWorkspace) return;

    setSubmitting(true);
    try {
      await workspaceService.updateWorkspace(selectedWorkspace.id, {
        name: workspaceName.trim(),
      });
      toast.success('Workspace renamed successfully');
      setIsRenameOpen(false);
      setSelectedWorkspace(null);
      setWorkspaceName('');
      fetchWorkspaces();
    } catch (err) {
      toast.error(err.message || 'Failed to rename workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkspace) return;

    setSubmitting(true);
    try {
      await workspaceService.deleteWorkspace(selectedWorkspace.id);
      toast.success(`Deleted workspace "${selectedWorkspace.name}"`);
      setIsDeleteOpen(false);
      setSelectedWorkspace(null);
      fetchWorkspaces();
    } catch (err) {
      toast.error(err.message || 'Failed to delete workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  const openRename = (ws, e) => {
    e.stopPropagation();
    setSelectedWorkspace(ws);
    setWorkspaceName(ws.name);
    setIsRenameOpen(true);
  };

  const openDelete = (ws, e) => {
    e.stopPropagation();
    setSelectedWorkspace(ws);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-brand-500/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent p-0.5 shadow-glow-sm">
              <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
                <Code2 className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="font-bold text-lg text-white tracking-tight">CodeSync</span>
          </Link>

          {/* User profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow"
                style={{ backgroundColor: user?.avatarColor || '#6366F1' }}
              >
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-300 hidden sm:inline">
                {user?.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Hero Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-2">
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span>Workspace Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Build, collaborate, and inspect real-time web code projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setWorkspaceName('');
                setWorkspaceDesc('');
                setSelectedTemplate('starter');
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all hover:shadow-glow-sm hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Workspace</span>
            </button>
          </div>
        </div>

        {/* Search & Statistics Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0f172a] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">{workspaces.length}</span>
              <span>Total Projects</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">
                {workspaces.filter((w) => w.role === 'owner').length}
              </span>
              <span>Owned</span>
            </div>
          </div>
        </div>

        {/* Workspace Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
            <span className="text-xs font-mono">Loading workspaces...</span>
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0f172a]/40 p-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mx-auto flex items-center justify-center mb-4">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {searchQuery ? 'No matching workspaces found' : 'No workspaces yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              {searchQuery
                ? 'Try adjusting your search query or clear the filter.'
                : 'Create your first collaborative code workspace with HTML, CSS, and JS starter template.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workspace</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((ws) => {
              const isOwner = ws.role === 'owner';
              return (
                <div
                  key={ws.id}
                  onClick={() => navigate(`/workspace/${ws.id}`)}
                  className="group relative rounded-xl border border-slate-800 bg-[#0f172a] hover:bg-[#131d36] transition-all duration-200 hover:border-slate-700 hover:shadow-xl hover:shadow-brand-950/40 cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  {/* Card top banner accent */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-brand-600 to-brand-accent group-hover:h-2 transition-all duration-200" />

                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-brand-400 group-hover:border-brand-500/50 transition-colors flex-shrink-0">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                          {ws.name}
                        </h3>
                      </div>

                      {/* Role Pill */}
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isOwner
                            ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {ws.role}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                      {ws.description || 'Collaborative web application workspace.'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
                      <div className="flex items-center gap-1.5" title="Last updated">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(ws.updatedAt)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ws.memberCount || 1} member</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3 bg-[#0a0f1c] border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-400 group-hover:text-brand-300 flex items-center gap-1">
                      Open Editor
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>

                    {isOwner && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => openRename(ws, e)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          title="Rename Workspace"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => openDelete(ws, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Delete Workspace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE WORKSPACE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/80 relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create New Workspace</h3>
            <p className="text-xs text-slate-400 mb-5">
              Configure your project name and starter template.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. portfolio-showcase"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description (optional)
                </label>
                <input
                  type="text"
                  placeholder="Brief description of this project"
                  value={workspaceDesc}
                  onChange={(e) => setWorkspaceDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Project Template
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedTemplate('starter')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'starter'
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-slate-800 bg-[#0b0f17] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileCode2 className={`w-4 h-4 ${selectedTemplate === 'starter' ? 'text-brand-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">Web Starter</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      HTML5, CSS, and JS with an interactive counter.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedTemplate('blank')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === 'blank'
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-slate-800 bg-[#0b0f17] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Layers className={`w-4 h-4 ${selectedTemplate === 'blank' ? 'text-brand-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold">Blank Canvas</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Empty workspace with no predefined files.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENAME WORKSPACE MODAL */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-3">Rename Workspace</h3>
            <form onSubmit={handleRename} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRenameOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE WORKSPACE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-rose-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-rose-400 mb-2">Delete Workspace?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="text-white font-semibold">"{selectedWorkspace?.name}"</span>? All files, collaborative state, and history will be lost.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
