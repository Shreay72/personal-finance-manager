import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly',
  });

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/transactions/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/budgets/');
      setBudgets(response.data.budgets || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget.budget_id}`, formData);
      } else {
        await api.post('/budgets/', formData);
      }
      setShowAddForm(false);
      setEditingBudget(null);
      setFormData({ category_id: '', amount: '', period: 'monthly' });
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount,
      period: budget.period,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
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
          <h1 className="text-base md:text-lg font-semibold tracking-tight text-slate-50">Budgets</h1>
          <p className="text-[11px] md:text-xs text-slate-400">Set spending limits and track your budget progress</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingBudget(null);
            setFormData({ category_id: '', amount: '', period: 'monthly' });
          }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-500 hover:bg-indigo-400 px-3.5 py-1.5 text-xs md:text-sm font-medium text-white shadow-lg shadow-indigo-900/60 focus-ring"
        >
          <span className="w-5 h-5 rounded-full bg-white/10 border border-indigo-300/70 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
            </svg>
          </span>
          Set Budget
        </button>
      </header>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-5 md:py-6 space-y-5 md:space-y-6 max-w-6xl mx-auto fade-in">
        {/* Add/Edit Form */}
        {showAddForm && (
          <section className="glass-card p-4 md:p-5 space-y-3 md:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-50">
                {editingBudget ? 'Edit Budget' : 'Set New Budget'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBudget(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-100 focus-ring"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m7 7 10 10M7 17 17 7" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="budget-category" className="text-[11px] font-medium text-slate-300">Category</label>
                <select
                  id="budget-category"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="budget-amount" className="text-[11px] font-medium text-slate-300">Budget Amount</label>
                <input
                  id="budget-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="budget-period" className="text-[11px] font-medium text-slate-300">Period</label>
                <select
                  id="budget-period"
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex items-end gap-2 md:col-span-3">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-medium text-white focus-ring"
                >
                  {editingBudget ? 'Update' : 'Set'} Budget
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Budget Cards */}
        <section className="space-y-4">
          {budgets.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 border border-indigo-400/40 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-300" fill="currentColor">
                  <path d="M4 5h16v3H4zm0 5h10v9H4zM16 10h4v9h-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">No Budgets Set</h3>
              <p className="text-sm text-slate-400 mb-4">Start tracking your spending by setting budgets for different categories</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-medium text-white focus-ring"
              >
                Set Your First Budget
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => {
                const percentage = budget.spent && budget.amount 
                  ? Math.min((parseFloat(budget.spent) / parseFloat(budget.amount)) * 100, 100)
                  : 0;
                const isOverBudget = percentage > 100;
                const isWarning = percentage > 80 && percentage <= 100;

                return (
                  <article key={budget.budget_id} className="soft-card p-4 md:p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-100">{budget.category_name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{budget.period} Budget</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-slate-400 hover:text-indigo-300 focus-ring"
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(budget.budget_id)}
                          className="w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-slate-400 hover:text-rose-300 focus-ring"
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-400">Spent</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-semibold ${
                            isOverBudget ? 'text-rose-300' : isWarning ? 'text-orange-300' : 'text-slate-100'
                          }`}>
                            ${parseFloat(budget.spent || 0).toFixed(2)}
                          </span>
                          <span className="text-slate-500">/ ${parseFloat(budget.amount).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-slate-900/80 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget
                              ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                              : isWarning
                              ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${
                          isOverBudget ? 'text-rose-300' : isWarning ? 'text-orange-300' : 'text-emerald-300'
                        }`}>
                          {percentage.toFixed(1)}% used
                        </span>
                        <span className="text-slate-400">
                          ${(parseFloat(budget.amount) - parseFloat(budget.spent || 0)).toFixed(2)} remaining
                        </span>
                      </div>
                    </div>

                    {isOverBudget && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-400/30">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-rose-300" fill="currentColor">
                          <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                        </svg>
                        <span className="text-xs text-rose-200">Over budget!</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Budgets;
