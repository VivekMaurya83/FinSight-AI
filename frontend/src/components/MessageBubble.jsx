import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ShieldAlert, Sparkles, User, ArrowRight, BookOpen } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const { sendMessage } = useChat();
  const isUser = message.role === 'user';
  const isOutOfScope = message.content.includes("This topic is outside FinSight AI's current scope");

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggestedPrompt = (prompt) => {
    sendMessage(prompt);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-fade-in`}>
      <div className={`flex space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
          isUser 
            ? 'bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700' 
            : isOutOfScope
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
              : 'bg-brand-500/10 text-brand-600 dark:text-brand-accent border border-brand-500/30'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : isOutOfScope ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </div>

        {/* Bubble Content */}
        <div className="relative group min-w-[240px]">
          <div className={`rounded-2xl px-5 py-4 shadow-sm ${
            isUser
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-none shadow-md shadow-emerald-900/10'
              : isOutOfScope
                ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-600/30 text-slate-800 dark:text-amber-100 rounded-tl-none'
                : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
          }`}>
            {/* Out-of-scope Guardrail Banner */}
            {!isUser && isOutOfScope && (
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2.5 pb-2 border-b border-amber-200 dark:border-amber-500/20">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Aegis AI Guardrail Triggered: Topic Out of Scope</span>
              </div>
            )}

            {/* Message Body */}
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
            ) : (
              <div className="prose-fintech text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Out-of-scope Redirection Suggestions */}
            {!isUser && isOutOfScope && (
              <div className="mt-3.5 pt-3 border-t border-amber-200/80 dark:border-amber-500/20">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Try asking one of our 6 supported financial education areas:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSuggestedPrompt('How should I structure a monthly budget using the 50/30/20 rule?')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-accent transition-colors flex items-center gap-1"
                  >
                    <span>Budgeting</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleSuggestedPrompt('How is EMI calculated on a loan?')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-accent transition-colors flex items-center gap-1"
                  >
                    <span>Loan & EMI</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleSuggestedPrompt('What affects my credit score?')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-accent transition-colors flex items-center gap-1"
                  >
                    <span>Credit Score</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Assistant Action Toolbar & Telemetry Badge */}
          {!isUser && (
            <div className="flex items-center justify-between mt-1.5 px-1 text-slate-400 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                  FinSight Assistant
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors"
                title="Copy text"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
