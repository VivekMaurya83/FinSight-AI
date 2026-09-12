import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  PiggyBank, 
  Shield, 
  TrendingUp, 
  Calculator, 
  CreditCard, 
  BookOpen 
} from 'lucide-react';

const SCOPES = [
  {
    icon: PiggyBank,
    title: '1. Personal Budgeting',
    color: 'text-emerald-400',
    topics: ['Monthly budgeting', '50/30/20 concept', 'Fixed vs variable expenses', 'Expense categorization']
  },
  {
    icon: Shield,
    title: '2. Savings & Emergency Funds',
    color: 'text-cyan-400',
    topics: ['Emergency fund sizing', 'Compound interest concepts', 'Short vs long term savings', 'Saving strategies']
  },
  {
    icon: TrendingUp,
    title: '3. Basic Investing Education',
    color: 'text-brand-accent',
    topics: ['SIP concepts', 'Mutual fund basics', 'Risk & diversification', 'Asset allocation fundamentals']
  },
  {
    icon: Calculator,
    title: '4. Loans & EMIs',
    color: 'text-amber-400',
    topics: ['Principal, interest & tenure', 'EMI formula & calculation', 'Reducing vs flat interest', 'Repayment strategy']
  },
  {
    icon: CreditCard,
    title: '5. Credit Scores',
    color: 'text-purple-400',
    topics: ['Credit score ranges & bureaus', 'Credit utilization ratio', 'Payment history factors', 'Responsible credit usage']
  },
  {
    icon: BookOpen,
    title: '6. Financial Terminology',
    color: 'text-blue-400',
    topics: ['APR vs APY', 'Inflation & purchasing power', 'Net worth & liquidity', 'Diversification definitions']
  }
];

const OUT_OF_SCOPE = [
  'Tax filing or tax optimization',
  'Stock picking or specific stock recommendations',
  'Buy / Sell / Hold trading signals',
  'Cryptocurrency, Bitcoin or NFT speculation',
  'Options, futures or forex trading',
  'Bank account connections or transfers',
  'Credit card or loan applications',
  'Personalized regulated financial advice'
];

export default function ScopeModal({ isOpen, onClose, onSelectPrompt }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-750 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-navy-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-accent">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                FinSight AI Scope & Guardrails
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regulated educational boundaries & Aegis AI evaluation guidelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Six Whitelisted Domains */}
        <div className="mt-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Strictly Supported Domains (6 Areas)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCOPES.map((domain, i) => {
              const Icon = domain.icon;
              return (
                <div 
                  key={i} 
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800/80"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${domain.color}`} />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{domain.title}</h3>
                  </div>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pl-5 list-disc">
                    {domain.topics.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Out-of-Scope Section */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-navy-800">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3">
            <XCircle className="w-4 h-4" />
            <span>Strictly Out of Scope (Instant Refusal)</span>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20">
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
              FinSight AI will refuse queries touching these domains with the standard response:
            </p>
            <blockquote className="p-2.5 rounded-lg bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-[11px] italic text-slate-600 dark:text-slate-400 mb-3">
              "This topic is outside FinSight AI's current scope. I can help with budgeting, savings, basic investing concepts, loans & EMIs, credit scores, or financial terminology."
            </blockquote>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-rose-700 dark:text-rose-300">
              {OUT_OF_SCOPE.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-brand-500 hover:dark:bg-brand-400 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
