import React, { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function ChatInput() {
  const [text, setText] = useState('');
  const { sendMessage, sending } = useChat();
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || sending) return;
    sendMessage(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="p-4 sm:p-6 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex flex-col bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-navy-750 focus-within:border-brand-500/80 dark:focus-within:border-brand-500/80 rounded-2xl shadow-sm transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={sending}
            placeholder="Ask about budgeting, savings, investing, loans, or credit..."
            className="w-full px-4 pt-3.5 pb-2 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-sm focus:outline-none resize-none max-h-44 overflow-y-auto leading-relaxed"
          />

          <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-400 select-none">
              <span className="hidden sm:inline">Press </span>Enter ↵ <span className="hidden sm:inline">to send</span>
            </span>

            <button
              onClick={handleSubmit}
              disabled={!text.trim() || sending}
              className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                text.trim() && !sending
                  ? 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-sm active:scale-95'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-400 mt-2.5">
          FinSight AI can make mistakes &middot; Educational use only &middot; Not financial advice
        </p>
      </div>
    </div>
  );
}
