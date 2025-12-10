import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showContributeModal, setShowContributeModal] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    deadline: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/goals/');
      setGoals(response.data.goals || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
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
      if (editingGoal) {
        await api.put(`/goals/${editingGoal.goal_id}`, formData);
      } else {
        await api.post('/goals/', formData);
      }
      setShowAddForm(false);
      setEditingGoal(null);
      setFormData({ name: '', target_amount: '', deadline: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal');
    }
  };

  const handleContribute = async (goalId) => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      await api.post(`/goals/${goalId}/contribute`, { amount: contributeAmount });
      setShowContributeModal(null);
      setContributeAmount('');
      fetchGoals();
    } catch (error) {
      console.error('Error contributing to goal:', error);
      alert('Failed to add contribution');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount,
      deadline: goal.deadline,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
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
          <h1 className="text-base md:text-lg font-semibold tracking-tight text-slate-50">Savings Goals</h1>
          <p className="text-[11px] md:text-xs text-slate-400">Set targets and track your progress toward financial milestones</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingGoal(null);
            setFormData({ name: '', target_amount: '', deadline: '' });
          }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-500 hover:bg-indigo-400 px-3.5 py-1.5 text-xs md:text-sm font-medium text-white shadow-lg shadow-indigo-900/60 focus-ring"
        >
          <span className="w-5 h-5 rounded-full bg-white/10 border border-indigo-300/70 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
            </svg>
          </span>
          New Goal
        </button>
      </header>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-5 md:py-6 space-y-5 md:space-y-6 max-w-6xl mx-auto fade-in">
        {/* Add/Edit Form */}
        {showAddForm && (
          <section className="glass-card p-4 md:p-5 space-y-3 md:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-50">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGoal(null);
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
                <label htmlFor="goal-name" className="text-[11px] font-medium text-slate-300">Goal Name</label>
                <input
                  id="goal-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                  placeholder="e.g., Emergency Fund"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="goal-target" className="text-[11px] font-medium text-slate-300">Target Amount</label>
                <input
                  id="goal-target"
                  name="target_amount"
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="goal-deadline" className="text-[11px] font-medium text-slate-300">Deadline</label>
                <input
                  id="goal-deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                />
              </div>
              <div className="flex items-end gap-2 md:col-span-3">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-medium text-white focus-ring"
                >
                  {editingGoal ? 'Update' : 'Create'} Goal
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Goals Grid */}
        <section className="space-y-4">
          {goals.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 border border-indigo-400/40 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-300" fill="currentColor">
                  <path d="M12 2 3 6.5V8h1v9l8 4 8-4V8h1V6.5L12 2Zm0 2.18L18.26 7 12 9.82 5.74 7ZM6 9.47l6 2.7 6-2.7V16l-6 3-6-3V9.47Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">No Goals Yet</h3>
              <p className="text-sm text-slate-400 mb-4">Start planning for your financial future by setting savings goals</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-medium text-white focus-ring"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const percentage = goal.target_amount 
                  ? Math.min((parseFloat(goal.current_amount || 0) / parseFloat(goal.target_amount)) * 100, 100)
                  : 0;
                const isComplete = percentage >= 100;

                return (
                  <article key={goal.goal_id} className="soft-card p-4 md:p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-100">{goal.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-slate-400 hover:text-indigo-300 focus-ring"
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(goal.goal_id)}
                          className="w-7 h-7 rounded-full bg-slate-900/80 flex items-center justify-center text-slate-400 hover:text-rose-300 focus-ring"
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Circular Progress */}
                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-slate-800"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                            className={`transition-all duration-500 ${
                              isComplete ? 'text-emerald-400' : 'text-indigo-400'
                            }`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-slate-100">{percentage.toFixed(0)}%</span>
                          <span className="text-xs text-slate-400">Complete</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-400">Saved</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-semibold text-slate-100">
                            ${parseFloat(goal.current_amount || 0).toFixed(2)}
                          </span>
                          <span className="text-slate-500">/ ${parseFloat(goal.target_amount).toFixed(2)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowContributeModal(goal.goal_id)}
                        className="w-full rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 px-4 py-2 text-sm font-medium text-indigo-200 focus-ring"
                      >
                        Add Contribution
                      </button>
                    </div>

                    {isComplete && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-300" fill="currentColor">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                        <span className="text-xs text-emerald-200">Goal achieved!</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Contribute Modal */}
        {showContributeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
            <div className="glass-card p-6 max-w-md w-full mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-50">Add Contribution</h3>
                <button
                  onClick={() => {
                    setShowContributeModal(null);
                    setContributeAmount('');
                  }}
                  className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-100 focus-ring"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m7 7 10 10M7 17 17 7" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contribute-amount" className="text-sm font-medium text-slate-300">Amount</label>
                <input
                  id="contribute-amount"
                  type="number"
                  step="0.01"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-lg text-slate-100 focus-ring"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowContributeModal(null);
                    setContributeAmount('');
                  }}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 focus-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleContribute(showContributeModal)}
                  className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-medium text-white focus-ring"
                >
                  Contribute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
