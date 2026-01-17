import React from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function ReleasesModal({ open, onClose, releaseForm, setReleaseForm, onSave, saving }) {
  const fields = [
    { key: 'firstReleased', label: '1st Released' },
    { key: 'secondReleased', label: '2nd Released' },
    { key: 'thirdReleased', label: '3rd Released' },
    { key: 'fourthReleased', label: '4th Released' },
    { key: 'supplementaryBudget', label: 'Supplementary Budget' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Manage Releases">
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-600 mb-1">{field.label}</label>
            <input
              type="number"
              value={releaseForm[field.key]}
              onChange={(e) => setReleaseForm({ ...releaseForm, [field.key]: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
        ))}
        <div className="pt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Releases'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ExpenseModal({ open, onClose, expenseForm, setExpenseForm, onSave, saving }) {
  return (
    <Modal open={open} onClose={onClose} title="Add Manual Expense">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Expense Name *</label>
          <input
            type="text"
            value={expenseForm.expenseName}
            onChange={(e) => setExpenseForm({ ...expenseForm, expenseName: e.target.value })}
            placeholder="e.g., Office Supplies"
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Amount *</label>
          <input
            type="number"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            placeholder="Enter amount"
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Budget Type *</label>
          <select
            value={expenseForm.budgetType}
            onChange={(e) => setExpenseForm({ ...expenseForm, budgetType: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="AAA">AAA (Non-Development)</option>
            <option value="DEV">AAA (Development)</option>
            <option value="PLA">PLA</option>
            <option value="UHI">UHI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Description (Optional)</label>
          <textarea
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            placeholder="Additional details..."
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={onSave}
            disabled={saving || !expenseForm.expenseName || !expenseForm.amount}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default Modal;
