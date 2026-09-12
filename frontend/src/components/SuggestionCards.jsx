import React from 'react';
import { 
  PiggyBank, 
  Shield, 
  TrendingUp, 
  Calculator, 
  CreditCard, 
  BookOpen, 
  ArrowUpRight 
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

const PROMPTS = [
  {
    icon: PiggyBank,
    category: 'Budgeting',
    text: 'How should I structure a monthly budget with the 50/30/20 rule?'
  },
  {
    icon: Shield,
    category: 'Savings',
    text: 'How much should I keep in an emergency fund?'
  },
  {
    icon: TrendingUp,
    category: 'Investing',
    text: 'What is a SIP and how does compound interest work?'
  },
  {
    icon: Calculator,
    category: 'Loans & EMIs',
    text: 'How is an EMI calculated on a reducing interest rate?'
  },
  {
    icon: CreditCard,
    category: 'Credit Scores',
    text: 'What factors have the biggest impact on a credit score?'
  },
  {
    icon: BookOpen,
    category: 'Terminology',
    text: 'What is the difference between APR and APY?'
  }
];

export default function SuggestionCards() {
  const { sendMessage, sending } = useChat();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center text-center animate-fade-in">
      {/* Clean Minimalist Hero */}
      <div className="space-y-3 mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Where would you like to start?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          FinSight AI answers questions across budgeting, savings, investing concepts, loans, and credit scores.
        </p>
      </div>

      {/* Clean Minimalist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => !sending && sendMessage(item.text)}
              disabled={sending}
              className="p-4 rounded-xl bg-white dark:bg-navy-900/60 hover:bg-slate-50 dark:hover:bg-navy-850/80 border border-slate-200/80 dark:border-navy-800/80 hover:border-slate-300 dark:hover:border-navy-700 text-left transition-all duration-150 group flex items-start justify-between gap-3 shadow-sm hover:shadow active:scale-[0.99]"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  <span>{item.category}</span>
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-accent transition-colors leading-snug">
                  {item.text}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 shrink-0 mt-0.5 transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Subtle scope caption */}
      <p className="mt-8 text-xs text-slate-400 dark:text-slate-400">
        Educational use only &middot; Not financial advice &middot; Stock picking and crypto are out of scope
      </p>
    </div>
  );
}
