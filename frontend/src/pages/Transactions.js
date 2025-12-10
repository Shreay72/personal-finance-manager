import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category_id: '',
    amount: '',
    type: 'expense',
  });

  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    search: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/transactions/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions/');
      setTransactions(response.data.transactions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.transaction_id}`, formData);
      } else {
        await api.post('/transactions/', formData);
      }
      setShowAddForm(false);
      setEditingTransaction(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category_id: '',
        amount: '',
        type: 'expense',
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      description: transaction.description,
      category_id: transaction.category_id,
      amount: transaction.amount,
      type: transaction.type,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filters.type && txn.type !== filters.type) return false;
    if (filters.category_id && txn.category_id !== parseInt(filters.category_id)) return false;
    if (filters.search && !txn.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

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
          <h1 className="text-base md:text-lg font-semibold tracking-tight text-slate-50">Transactions</h1>
          <p className="text-[11px] md:text-xs text-slate-400">Search, filter, and manage all your transactions</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingTransaction(null);
            setFormData({
              date: new Date().toISOString().split('T')[0],
              description: '',
              category_id: '',
              amount: '',
              type: 'expense',
            });
          }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-500 hover:bg-indigo-400 px-3.5 py-1.5 text-xs md:text-sm font-medium text-white shadow-lg shadow-indigo-900/60 focus-ring"
        >
          <span className="w-5 h-5 rounded-full bg-white/10 border border-indigo-300/70 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
            </svg>
          </span>
          Add Transaction
        </button>
      </header>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-5 md:py-6 space-y-5 md:space-y-6 max-w-6xl mx-auto fade-in">
        {/* Filters */}
        <section className="glass-card p-4 md:p-5 space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Filters</h3>
              <p className="text-xs text-slate-500 mt-0.5">Narrow down by type and category</p>
            </div>
            <button
              onClick={() => setFilters({ type: '', category_id: '', search: '' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 px-2.5 py-1 text-[11px] text-slate-300 focus-ring"
            >
              Reset
            </button>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-search" className="text-[11px] font-medium text-slate-300">Search</label>
              <input
                id="filter-search"
                name="search"
                type="text"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 placeholder:text-slate-600 focus-ring"
                placeholder="Description..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-type" className="text-[11px] font-medium text-slate-300">Type</label>
              <select
                id="filter-type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
              >
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-category" className="text-[11px] font-medium text-slate-300">Category</label>
              <select
                id="filter-category"
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
              >
                <option value="">All categories</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </form>
        </section>

        {/* Add/Edit Form */}
        {showAddForm && (
          <section className="glass-card p-4 md:p-5 space-y-3 md:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-50">
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTransaction(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-100 focus-ring"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m7 7 10 10M7 17 17 7" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="txn-date" className="text-[11px] font-medium text-slate-300">Date</label>
                <input
                  id="txn-date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="txn-type" className="text-[11px] font-medium text-slate-300">Type</label>
                <select
                  id="txn-type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="txn-description" className="text-[11px] font-medium text-slate-300">Description</label>
                <input
                  id="txn-description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs md:text-sm text-slate-100 focus-ring"
                  placeholder="e.g., Grocery shopping"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="txn-category" className="text-[11px] font-medium text-slate-300">Category</label>
                <select
                  id="txn-category"
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
                <label htmlFor="txn-amount" className="text-[11px] font-medium text-slate-300">Amount</label>
                <input
                  id="txn-amount"
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
              <div className="flex items-end gap-2 md:col-span-1">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-medium text-white focus-ring"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Transactions Table */}
        <section className="glass-card p-4 md:p-5 space-y-3 md:space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Showing {filteredTransactions.length} transaction(s)</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
            <table className="min-w-full text-xs md:text-sm text-left text-slate-200">
              <thead className="bg-slate-950/90 border-b border-slate-800/90">
                <tr>
                  <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Date</th>
                  <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Description</th>
                  <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Category</th>
                  <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Amount</th>
                  <th className="px-4 md:px-5 py-3 font-semibold text-slate-400 text-[11px] uppercase tracking-[0.16em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                      No transactions found. Try adjusting your filters or add a new transaction.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => (
                    <tr key={txn.transaction_id} className="hover:bg-slate-900/70">
                      <td className="px-4 md:px-5 py-2.5 text-slate-300 whitespace-nowrap">
                        {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 md:px-5 py-2.5">
                        <p className="font-medium text-slate-100">{txn.description}</p>
                      </td>
                      <td className="px-4 md:px-5 py-2.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(txn)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-900/80 text-slate-400 hover:text-indigo-300 focus-ring"
                            title="Edit"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(txn.transaction_id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-900/80 text-slate-400 hover:text-rose-300 focus-ring"
                            title="Delete"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Transactions;
