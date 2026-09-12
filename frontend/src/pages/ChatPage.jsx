import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import SuggestionCards from '../components/SuggestionCards';
import { useChat } from '../context/ChatContext';
import { Loader2, RefreshCw } from 'lucide-react';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, loading, sending, regenerateResponse } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white dark:bg-slate-950">
        <ChatHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
              <p className="text-xs">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <SuggestionCards />
          ) : (
            <div className="max-w-3xl mx-auto w-full">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* In-Flight Generation Indicator */}
              {sending && (
                <div className="flex items-center space-x-2.5 text-xs text-slate-400 py-3 animate-pulse">
                  <div className="w-6 h-6 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
                  </div>
                  <span>FinSight AI is thinking...</span>
                </div>
              )}

              {/* Regenerate Action */}
              {!sending && messages.length >= 2 && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={regenerateResponse}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Minimalist Input Composer */}
        <ChatInput />
      </div>
    </div>
  );
}
