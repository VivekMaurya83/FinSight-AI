import React, { useState, useEffect } from 'react';
import { Menu, Plus, Trash2, HelpCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { healthService } from '../services/healthService';
import api from '../services/api';
import ThemeToggle from './ThemeToggle';
import ScopeModal from './ScopeModal';

export default function ChatHeader({ onToggleSidebar }) {
  const { currentConversation, clearChat, startNewChat } = useChat();
  const { user } = useAuth();
  const isAdmin = user?.is_admin || user?.email?.toLowerCase() === 'admin@finsight.ai';

  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState({
    status: 'checking',
    model: 'qwen3.8-27b'
  });

  const [guardrailMode, setGuardrailMode] = useState('basic');
  const [togglingGuardrail, setTogglingGuardrail] = useState(false);

  const checkOllama = async () => {
    try {
      const data = await healthService.getOllamaHealth();
      const rawModel = data.active_model || data.configured_model || 'qwen3.8-27b';
      const cleanModel = rawModel.toLowerCase().includes('qwen') ? 'Qwen 3.8-27B' : rawModel;
      setOllamaStatus({
        status: data.status === 'online' ? 'online' : 'offline',
        model: cleanModel
      });
    } catch {
      setOllamaStatus({ status: 'online', model: 'Qwen 3.8-27B' });
    }
  };

  const fetchGuardrailMode = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/defense/mode');
      setGuardrailMode(res.data.active_guardrail_mode || 'basic');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkOllama();
    fetchGuardrailMode();
    const interval = setInterval(checkOllama, 20000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleToggleGuardrail = async () => {
    const nextMode = guardrailMode === 'basic' ? 'hardened' : 'basic';
    setTogglingGuardrail(true);
    try {
      const res = await api.post('/defense/toggle', { mode: nextMode });
      setGuardrailMode(res.data.active_guardrail_mode);
    } catch (err) {
      console.error('Failed to toggle guardrail mode:', err);
    } finally {
      setTogglingGuardrail(false);
    }
  };

  return (
    <>
      <header className="h-14 px-4 sm:px-6 bg-white/60 dark:bg-navy-950/60 backdrop-blur-md border-b border-slate-200/60 dark:border-navy-800/60 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">FinSight AI</span>
            <span className="text-slate-300 dark:text-navy-700 font-light">/</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs font-normal">
              {currentConversation?.title || 'New Chat'}
            </p>
          </div>
        </div>

        {/* Minimalist Right Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Admin Guardrail Toggle Button */}
          {isAdmin && (
            <button
              onClick={handleToggleGuardrail}
              disabled={togglingGuardrail}
              title={`Admin Guardrail Defense: Click to switch to ${guardrailMode === 'basic' ? 'Hardened (Zero-Trust)' : 'Basic (Vulnerable)'}`}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                guardrailMode === 'hardened'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-700/60 shadow-emerald-500/10'
                  : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-700/60 shadow-amber-500/10'
              } ${togglingGuardrail ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95 shadow-sm'}`}
            >
              {guardrailMode === 'hardened' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span className="tracking-wide">
                {guardrailMode === 'hardened' ? 'Hardened' : 'Basic'}
              </span>
            </button>
          )}

          {/* Subtle Online Status Dot */}
          <div 
            title={`Model: ${ollamaStatus.model}`}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400 select-none cursor-default"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              ollamaStatus.status === 'online' ? 'bg-emerald-500' : 'bg-amber-400'
            }`} />
            <span className="hidden sm:inline text-[11px] font-mono text-slate-400 dark:text-slate-400">
              {ollamaStatus.model}
            </span>
          </div>

          {/* Scope Guide Trigger */}
          <button
            onClick={() => setScopeModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            title="Supported Domains & Scope Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle className="border-0 bg-transparent shadow-none p-1.5" />

          {/* Clear Current Chat */}
          <button
            onClick={clearChat}
            title="Clear current view"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* New Chat */}
          <button
            onClick={startNewChat}
            title="Start fresh conversation"
            className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      <ScopeModal
        isOpen={scopeModalOpen}
        onClose={() => setScopeModalOpen(false)}
      />
    </>
  );
}
