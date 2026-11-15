import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Code2, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinWorkspacePage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(null);

  useEffect(() => {
    async function accept() {
      try {
        setLoading(true);
        const res = await api.post(`/invitations/accept/${token}`);
        setSuccess(true);
        setWorkspaceId(res.data.workspaceId);
        toast.success(res.data.message || 'Joined workspace successfully!');
        // Automatically navigate after 1.5 seconds
        setTimeout(() => {
          navigate(`/workspace/${res.data.workspaceId}`, { replace: true });
        }, 1500);
      } catch (err) {
        setError(err.message || 'Invitation is invalid or expired.');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      accept();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-[#0f172a] border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent p-0.5 mx-auto mb-4 shadow-glow-sm">
          <div className="w-full h-full bg-[#0b0f17] rounded-[14px] flex items-center justify-center">
            <Code2 className="w-6 h-6 text-brand-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Workspace Invitation</h2>

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <span className="text-xs font-mono">Verifying invitation token...</span>
          </div>
        )}

        {error && (
          <div className="py-6 space-y-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        )}

        {success && (
          <div className="py-6 space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 text-left">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>You have joined the workspace! Redirecting to editor...</span>
            </div>
            <Link
              to={`/workspace/${workspaceId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors"
            >
              <span>Enter Workspace Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
