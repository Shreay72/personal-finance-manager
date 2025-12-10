import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const transactionsRes = await api.get('/transactions/');
      const txns = transactionsRes.data.transactions || [];
      
      const income = txns
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expenses = txns
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        netSavings: income - expenses,
      });

      setTransactions(txns.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-lg sticky top-0 z-20">
        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-semibold tracking-tight text-slate-50">Overview</h1>
          <p className="text-[11px] md:text-xs text-slate-400">Personal Finance Manager · Clean insights for smarter decisions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] text-slate-300">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3Zm-1 6v12h12V8H6Zm2 2h2v2H8v-2Z" />
              </svg>
            </span>
            <span>This Month</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-5 md:py-6 space-y-6 md:space-y-7 max-w-6xl mx-auto fade-in">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {/* Total Income */}
          <article className="soft-card relative p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Total Income</p>
                <p className="mt-1 text-lg md:text-xl font-semibold text-emerald-300">
                  ${stats.totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M11 4h2v2h1a3 3 0 0 1 0 6h-4a1 1 0 0 0 0 2h5v2h-3v2h-2v-2h-1a3 3 0 0 1 0-6h4a1 1 0 0 0 0-2h-5V6h3V4Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Money received
              </span>
              <span className="text-slate-400">This month</span>
            </div>
          </article>

          {/* Total Expenses */}
          <article className="soft-card relative p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Total Expenses</p>
                <p className="mt-1 text-lg md:text-xl font-semibold text-rose-300">
                  ${stats.totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-400/40 flex items-center justify-center text-rose-300">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 .001 4.001A2 2 0 0 0 17 18ZM4 4h2l2.5 9.5h9.75L20 8H9.21l-.57-2H4Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-rose-100/80">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Money spent
              </span>
              <span className="text-slate-400">This month</span>
            </div>
          </article>

          {/* Net Savings */}
          <article className="soft-card relative p-4 md:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Net Savings</p>
                <p className="mt-1 text-lg md:text-xl font-semibold text-sky-300">
                  ${stats.netSavings.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-400/40 flex items-center justify-center text-sky-300">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M16 5a4 4 0 0 0-7.87-1H7a3 3 0 0 0-3 3v1.19A4 4 0 0 0 2 11v3h2.08A6 6 0 0 0 10 19h2v2h2v-2h1a3 3 0 0 0 2.83-2H21v-2h-1v-3a3 3 0 0 0-3-3h-1.13A4 4 0 0 0 16 5Zm-2-1a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm1 6.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-sky-100/80">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                {stats.totalIncome > 0 ? ((stats.netSavings / stats.totalIncome) * 100).toFixed(1) : 0}% saved
              </span>
              <span className="text-slate-400">Keep going!</span>
            </div>
          </article>
        </div>

        {/* Recent Transactions */}
        <section className="gradient-border">
          <div className="gradient-border-inner p-4 md:p-5 rounded-[1.4rem]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm md:text-base font-semibold text-slate-50">Recent Transactions</h2>
                <p className="text-xs text-slate-400 mt-0.5">Your latest financial activity</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
              <table className="min-w-full text-xs md:text-sm text-left text-slate-200">
                <thead className="bg-slate-950/90 border-b border-slate-800/90">
                  <tr>
                    <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Date</th>
                    <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Description</th>
                    <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Category</th>
                    <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Amount</th>
                    <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                        No transactions yet. Start adding your income and expenses!
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.transaction_id} className="hover:bg-slate-900/70">
                        <td className="px-4 md:px-5 py-2.5 whitespace-nowrap text-slate-300">
                          {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 md:px-5 py-2.5">
                          <p className="font-medium text-slate-100">{txn.description}</p>
                        </td>
                        <td className="px-4 md:px-5 py-2.5">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                            txn.type === 'income' 
                              ? 'bg-emerald-500/10 border border-emerald-400/40 text-emerald-200'
                              : 'bg-slate-900 border border-slate-700 text-slate-200'
                          }`}>
                            {txn.category_name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className={`px-4 md:px-5 py-2.5 font-semibold ${
                          txn.type === 'income' ? 'text-emerald-300' : 'text-rose-300'
                        }`}>
                          {txn.type === 'income' ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
                        </td>
                        <td className="px-4 md:px-5 py-2.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] ${
                            txn.type === 'income' ? 'text-emerald-200' : 'text-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              txn.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}></span>
                            {txn.type === 'income' ? 'Inflow' : 'Outflow'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
