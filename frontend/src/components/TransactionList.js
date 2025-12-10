import React from 'react';

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  if (transactions.length === 0) {
    return <p className="no-data">No transactions yet.</p>;
  }

  return (
    <table className="transactions-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(transaction => (
          <tr key={transaction.transaction_id}>
            <td>{new Date(transaction.date).toLocaleDateString()}</td>
            <td>
              <span className={`badge ${transaction.type}`}>
                {transaction.type}
              </span>
            </td>
            <td>{transaction.category_name}</td>
            <td className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>
              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
            </td>
            <td>{transaction.notes || '-'}</td>
            <td>
              <button onClick={() => onEdit(transaction)} className="btn-edit">
                Edit
              </button>
              <button onClick={() => onDelete(transaction.transaction_id)} className="btn-delete">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionList;
