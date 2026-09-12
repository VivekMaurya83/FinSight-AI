import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Shield, 
  PiggyBank, 
  TrendingUp, 
  Calculator, 
  CreditCard, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Lock,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import ScopeModal from '../components/ScopeModal';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "What makes FinSight AI different from general chatbots?",
      a: "FinSight AI enforces strict domain containment. It is strictly bounded to six financial literacy areas (Budgeting, Savings, Investing basics, Loans & EMIs, Credit scores, and Financial terms). Queries regarding stock picks, day trading, crypto, or tax filing are deterministically refused."
    },
    {
      q: "How does FinSight AI serve as a testing platform for Aegis AI?",
      a: "FinSight AI provides an observable testbed. Every interaction generates a correlation request_id and records inference telemetry, model names, latencies, and guardrail interception status in PostgreSQL for trust & safety red-teaming."
    },
    {
      q: "Which LLM powers FinSight AI?",
      a: "FinSight AI connects to a local Ollama daemon running configured models (defaulting to llama3.2 with dynamic fallback). No proprietary cloud APIs like OpenAI or Anthropic are used."
    },
    {
      q: "Does FinSight AI give real financial advice?",
      a: "No. FinSight AI is purely an educational literacy assistant. All content is for foundational education, showing mathematical formulas and assumptions, and should not be construed as regulated advice."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-navy-800 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent p-0.5 shadow-md shadow-brand-500/20">
              <div className="w-full h-full bg-slate-900 dark:bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-accent" />
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              FinSight <span className="text-brand-accent text-xs font-semibold px-1.5 py-0.5 bg-brand-500/10 border border-brand-500/30 rounded">AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setScopeModalOpen(true)}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-accent px-3 py-1.5 transition-colors"
            >
              6 Domains Guide
            </button>

            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-brand-600 dark:text-brand-300 font-bold mb-6">
            <ShieldCheck className="w-4 h-4 text-brand-accent" />
            <span>Aegis AI Trust & Safety Testing Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none mb-6">
            Focused Financial Education. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-emerald-500 to-cyan-500">
              Zero Unregulated Noise.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Master budgeting, savings, investing fundamentals, loans, and credit scores without speculation, stock picking, or hallucinations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={isAuthenticated ? "/chat" : "/signup"}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all group"
            >
              <span>{isAuthenticated ? "Launch FinSight Chat" : "Get Started Free"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setScopeModalOpen(true)}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-850 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 font-bold text-base transition-colors"
            >
              Explore Scope Rules
            </button>
          </div>

          {/* Interactive Chat Mockup Card */}
          <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-750 shadow-xl p-6 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">FinSight AI &middot; Live Demo</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">● Ollama Online</span>
            </div>

            {/* User prompt preview */}
            <div className="flex justify-end">
              <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-medium rounded-tr-none">
                How does the 50/30/20 budgeting rule work?
              </div>
            </div>

            {/* Assistant response preview */}
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 rounded-tl-none space-y-2">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">The 50/30/20 rule divides your monthly net income into 3 buckets:</p>
                <div className="grid grid-cols-3 gap-2 py-1 text-[11px]">
                  <div className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                    <strong className="block text-emerald-600 dark:text-emerald-400">50% Needs</strong>
                    <span className="text-slate-500 dark:text-slate-400">Rent, groceries, utilities</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                    <strong className="block text-cyan-600 dark:text-cyan-400">30% Wants</strong>
                    <span className="text-slate-500 dark:text-slate-400">Dining, hobbies, travel</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800">
                    <strong className="block text-purple-600 dark:text-purple-400">20% Savings</strong>
                    <span className="text-slate-500 dark:text-slate-400">Emergency fund, debt paydown</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Domains Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            Six Focused Knowledge Domains
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            FinSight AI restricts conversation strictly to factual financial literacy principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <PiggyBank className="w-8 h-8 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Personal Budgeting</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              50/30/20 budgeting framework, income vs expenses, fixed vs variable categories, cash flow management, and monthly planning.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <Shield className="w-8 h-8 text-cyan-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Savings & Reserves</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Target emergency fund calculations, high-yield liquid savings, compounding timeline, and short-term vs long-term milestones.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <TrendingUp className="w-8 h-8 text-brand-accent mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Basic Investing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Systematic Investment Plans (SIP), index & mutual fund basics, asset allocation concepts, diversification, and compound growth.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <Calculator className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Loans & EMIs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Principal, interest rates, tenure, EMI mathematical formula, reducing vs flat rate comparisons, and loan repayment strategy.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <CreditCard className="w-8 h-8 text-purple-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Credit Scores</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              FICO/CIBIL basics, credit utilization ratios, payment history weightings, and responsible credit card utilization.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <BookOpen className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">6. Financial Terms</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Clear definitions for APR, APY, Net Worth, Liquidity, Inflation, Compounding, Diversification, and Risk profiles.
            </p>
          </div>
        </div>
      </section>

      {/* Scope Boundaries Comparison */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Strict Guardrails by Design</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tested and validated to prevent hallucinated advice or regulatory violations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Supported & Answered
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Educational budget structuring (50/30/20)</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Emergency fund size calculations</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> How mutual funds and SIPs work</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> EMI formulas and interest math</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Credit utilization factors & terms</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Strictly Out of Scope
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Stock picking or buy/sell recommendations</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Crypto, forex, or options day trading</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Tax filing or insurance recommendations</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Bank account connections or wire transfers</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Credit card or loan applications</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-accent transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180 text-brand-500' : 'text-slate-400'}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-navy-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-navy-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-navy-950">
        <p className="mb-1">FinSight AI &copy; 2026. Educational use only — not licensed financial advice.</p>
        <p>Aegis AI Testing Environment &middot; PostgreSQL &middot; FastAPI &middot; Ollama</p>
      </footer>

      <ScopeModal
        isOpen={scopeModalOpen}
        onClose={() => setScopeModalOpen(false)}
      />
    </div>
  );
}
