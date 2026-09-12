import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MessageSquare, 
  LayoutDashboard, 
  Trash2, 
  LogOut, 
  Sparkles,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import ScopeModal from './ScopeModal';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const { 
    conversations, 
    currentConversation, 
    fetchConversations, 
    selectConversation, 
    startNewChat, 
    deleteConversation 
  } = useChat();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewChat = async () => {
    await startNewChat();
    if (location.pathname !== '/chat') {
      navigate('/chat');
    }
    if (onClose) onClose();
  };

  const handleSelectChat = async (id) => {
    await selectConversation(id);
    if (location.pathname !== '/chat') {
      navigate('/chat');
    }
    if (onClose) onClose();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 
        bg-slate-50/90 dark:bg-navy-950/90 backdrop-blur-md 
        border-r border-slate-200/80 dark:border-navy-800/80 
        flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-200/60 dark:border-navy-800/60 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-brand-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              FinSight AI
            </span>
          </Link>
        </div>

        {/* Minimalist Primary Actions */}
        <div className="p-3 space-y-1">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-brand-500" />
              <span>New Chat</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">⌘N</span>
          </button>

          <Link
            to="/dashboard"
            className={`w-full flex items-center space-x-2.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-slate-200/70 dark:bg-navy-850 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <button
            onClick={() => setScopeModalOpen(true)}
            className="w-full flex items-center space-x-2.5 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span>Scope Rules</span>
          </button>
        </div>

        {/* Conversations History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Recent Chats</span>
            <span className="text-[10px] font-mono text-slate-400">{conversations.length}</span>
          </div>

          {conversations.length === 0 ? (
            <div className="py-6 px-2 text-center text-xs text-slate-400">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = currentConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectChat(conv.id)}
                  className={`group flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-200/80 dark:bg-navy-850 text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-900/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate min-w-0">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                    <span className="truncate text-xs">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    title="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Minimalist User Profile Footer */}
        <div className="p-3 border-t border-slate-200/60 dark:border-navy-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-brand-500" />
                  <span>Aegis Testbed</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <ScopeModal
        isOpen={scopeModalOpen}
        onClose={() => setScopeModalOpen(false)}
      />
    </>
  );
}
