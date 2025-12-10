import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';

const TransactionForm = ({ onSuccess, editTransaction }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchCategories();
    if (editTransaction) {
      setFormData(editTransaction);
    }
  }, [editTransaction]);

  const fetchCategories = async () => {
    try {
      const response = await transactionAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTransaction) {
        await transactionAPI.update(editTransaction.transaction_id, formData);
      } else {
        await transactionAPI.create(formData);
      }
      onSuccess();
    } catch (error) {
      alert('Error saving transaction');
    }
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })}
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {filteredCategories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Notes (Optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add notes..."
          rows="3"
        />
      </div>

      <button type="submit" className="btn-submit">
        {editTransaction ? 'Update' : 'Add'} Transaction
      </button>
    </form>
  );
};

export default TransactionForm;
