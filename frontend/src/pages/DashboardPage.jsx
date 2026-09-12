import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Cpu, 
  MessageSquare, 
  Activity, 
  PiggyBank, 
  Shield, 
  TrendingUp, 
  Calculator, 
  CreditCard, 
  BookOpen, 
  ArrowRight,
  LogOut,
  HelpCircle,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { healthService } from '../services/healthService';
import ThemeToggle from '../components/ThemeToggle';
import ScopeModal from '../components/ScopeModal';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { conversations, fetchConversations, startNewChat, sendMessage } = useChat();
  const navigate = useNavigate();

  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    status: 'checking',
    model: 'llama3.2',
  });

  // Interactive 50/30/20 mini calculator state
  const [monthlyIncome, setMonthlyIncome] = useState(5000);

  useEffect(() => {
    fetchConversations();
    healthService.getHealth().then((data) => {
      setSystemHealth({
        status: data.status === 'healthy' || data.status === 'degraded' ? 'Online' : 'Offline',
        model: data.ollama?.active_model || data.ollama?.configured_model || 'llama3.2'
      });
    }).catch(() => {
      setSystemHealth({ status: 'Offline', model: 'llama3.2' });
    });
  }, [fetchConversations]);

  const handleLaunchChat = async (initialPrompt = null) => {
    const newConv = await startNewChat();
    if (initialPrompt && newConv) {
      navigate('/chat');
      setTimeout(() => sendMessage(initialPrompt), 300);
    } else {
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Navbar */}
      <header className="h-16 px-4 sm:px-8 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent p-0.5 shadow-md shadow-brand-500/20">
            <div className="w-full h-full bg-slate-900 dark:bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-accent" />
            </div>
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">FinSight AI</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setScopeModalOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300 hover:border-brand-500 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span>Scope Rules</span>
          </button>

          <ThemeToggle />

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-navy-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="truncate max-w-[120px] font-semibold text-slate-800 dark:text-white">{user?.name}</span>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-navy-900 rounded-xl transition-colors text-xs flex items-center gap-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Welcome Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white via-slate-50 to-slate-100 dark:from-navy-900 dark:via-navy-850 dark:to-navy-800 border border-slate-200 dark:border-navy-750 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm dark:shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-accent text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aegis AI Testing Environment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              FinSight AI Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Controlled, observable financial education covering six foundational literacy domains.
            </p>
          </div>

          <button
            onClick={() => handleLaunchChat()}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <span>Open FinSight Chatbot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Core Summary Cards Required in Section 17 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Financial Education */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-accent flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Financial Education</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Learn practical financial concepts
            </p>
          </div>

          {/* Card 2: AI Model */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Model</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
              Ollama &middot; {systemHealth.model}
            </p>
          </div>

          {/* Card 3: Conversations */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversations</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {conversations.length}
            </p>
          </div>

          {/* Card 4: System Status */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Status</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${systemHealth.status === 'Online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {systemHealth.status}
              </p>
            </div>
          </div>
        </div>

        {/* 6 Supported Domains Breakdown Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Supported Educational Domains</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click any domain to immediately explore it with FinSight AI.</p>
            </div>
            <button
              onClick={() => setScopeModalOpen(true)}
              className="text-xs font-semibold text-brand-600 dark:text-brand-accent hover:underline flex items-center gap-1"
            >
              <span>View Full Rules</span> &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Domain 1: Budgeting */}
            <div 
              onClick={() => handleLaunchChat('How should I structure a monthly budget using the 50/30/20 rule?')}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-brand-500/50 cursor-pointer group transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <PiggyBank className="w-6 h-6 text-emerald-500" />
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">50/30/20</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-accent transition-colors">
                1. Personal Budgeting
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                50/30/20 budgeting rule, fixed vs. variable costs, income vs. expenses, and monthly cash flow planning.
              </p>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-accent mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ask about budgeting &rarr;
              </span>
            </div>

            {/* Domain 2: Savings */}
            <div 
              onClick={() => handleLaunchChat('How much should I keep in an emergency fund and where should it be held?')}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-cyan-500/50 cursor-pointer group transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-6 h-6 text-cyan-500" />
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">3-6 Months</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                2. Savings & Emergency Funds
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Target emergency reserve calculation, liquid savings accounts, compounding timelines, and milestones.
              </p>
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ask about emergency reserves &rarr;
              </span>
            </div>

            {/* Domain 3: Investing */}
            <div 
              onClick={() => handleLaunchChat('What is a SIP and how does mutual fund diversification work?')}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-emerald-500/50 cursor-pointer group transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-brand-accent" />
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-accent">SIP & Funds</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-accent transition-colors">
                3. Basic Investing Education
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Systematic Investment Plans (SIP), index & mutual funds fundamentals, asset allocation, and risk.
              </p>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-accent mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ask about SIPs & funds &rarr;
              </span>
            </div>

            {/* Domain 4: Loans & EMIs */}
            <div 
              onClick={() => handleLaunchChat('How is EMI calculated and what is the difference between flat and reducing interest?')}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-amber-500/50 cursor-pointer group transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <Calculator className="w-6 h-6 text-amber-500" />
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">Formula Math</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                4. Loans & EMIs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Principal, interest rate, tenure, EMI mathematical formula, reducing vs flat rate, and amortization.
              </p>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ask about EMI formulas &rarr;
              </span>
            </div>

            {/* Domain 5: Credit Scores */}
            <div 
              onClick={() => handleLaunchChat('What factors affect a credit score and how should I manage credit utilization?')}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-purple-500/50 cursor-pointer group transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-6 h-6 text-purple-500" />
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">Score &lt; 30%</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                5. Credit Scores
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Credit score factors (FICO/CIBIL), utilization ratio, payment history weighting, and responsible habits.
              </p>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ask about credit scores &rarr;
              </span>
            </div>

            {/* Domain 6: Terminology */}
            <div 
              onClick={() => handleLaunchChat('What is the difference between APR, APY, inflation, and compound interest?')}
              className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-blue-500/50 cursor-pointer group transition-all shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">Glossary</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                6. Financial Terminology
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Definitions and examples for APR, APY, Net Worth, Liquidity, Inflation, Diversification, and Risk.
              </p>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-3 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ask about financial terms &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Interactive 50/30/20 Visualizer Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-500" />
                <span>Interactive 50/30/20 Budget Allocator</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualize how a monthly income is balanced across Essential Needs, Wants, and Savings.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Monthly Income:</label>
              <input
                type="number"
                min="500"
                max="50000"
                step="500"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Allocation Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-navy-950 mb-4">
            <div style={{ width: '50%' }} className="bg-emerald-500 h-full" title="Needs (50%)" />
            <div style={{ width: '30%' }} className="bg-cyan-500 h-full" title="Wants (30%)" />
            <div style={{ width: '20%' }} className="bg-purple-500 h-full" title="Savings (20%)" />
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Essential Needs (50%)</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">${Math.round(monthlyIncome * 0.50)}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Housing, groceries, utilities</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/5 dark:bg-cyan-950/20 border border-cyan-500/20">
              <p className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">Discretionary Wants (30%)</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">${Math.round(monthlyIncome * 0.30)}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Dining, entertainment, hobbies</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20">
              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">Savings & Debt (20%)</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">${Math.round(monthlyIncome * 0.20)}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Emergency fund, SIP, debt paydown</p>
            </div>
          </div>
        </div>

        {/* Clear Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm">
          <span className="font-bold text-slate-800 dark:text-slate-200">Important Disclaimer: </span>
          Educational use only — not financial advice.
        </div>
      </main>

      <ScopeModal
        isOpen={scopeModalOpen}
        onClose={() => setScopeModalOpen(false)}
      />
    </div>
  );
}
