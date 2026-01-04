import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api';
import {
  Search,
  ChevronDown,
  Building2,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Banknote,
  Receipt,
} from 'lucide-react';

// Import modular components
import AAASection from '../components/dashboard/AAASection';
import PLASection from '../components/dashboard/PLASection';
import UHISection from '../components/dashboard/UHISection';
import { ReleasesModal, ExpenseModal } from '../components/dashboard/Modals';
import { formatCurrency, GRADIENT_COLORS } from '../components/dashboard/utils';

// SearchableSelect component for object code selection
function SearchableSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const s = search.toLowerCase();
    return options.filter((o) => o.code.toLowerCase().includes(s) || o.headOfAccount.toLowerCase().includes(s));
  }, [options, search]);

  const selected = options.find((o) => o.id === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      >
        <span className={`truncate ${selected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
          {selected ? `${selected.code} - ${selected.headOfAccount}` : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-80 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search code or head..."
                autoFocus
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">No results found</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(o.id); setOpen(false); setSearch(''); }}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${o.id === value ? 'bg-teal-50 dark:bg-teal-950/30' : ''}`}
                >
                  <div className="font-medium text-slate-800 dark:text-slate-100">{o.code}</div>
                  <div className="text-sm text-slate-500 truncate">{o.headOfAccount}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  // State management
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [objectCodes, setObjectCodes] = useState([]);
  const [selectedObjectCodeId, setSelectedObjectCodeId] = useState(null);
  const [budgetEntry, setBudgetEntry] = useState(null);
  const [expenseHistory, setExpenseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entryLoading, setEntryLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('aaa');
  
  // Modal states
  const [releasesModalOpen, setReleasesModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [releasesSaving, setReleasesSaving] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [releaseForm, setReleaseForm] = useState({ 
    firstReleased: 0, secondReleased: 0, thirdReleased: 0, fourthReleased: 0, supplementaryBudget: 0 
  });
  const [expenseForm, setExpenseForm] = useState({ 
    expenseName: '', amount: '', budgetType: 'AAA', description: '' 
  });

  // Effects
  useEffect(() => { loadInitial(); }, []);
  
  useEffect(() => {
    if (selectedYearId && selectedObjectCodeId) loadBudgetEntry();
    else { setBudgetEntry(null); setExpenseHistory([]); }
  }, [selectedYearId, selectedObjectCodeId]);
  
  useEffect(() => {
    if (budgetEntry) {
      setReleaseForm({
        firstReleased: budgetEntry.firstReleased || 0,
        secondReleased: budgetEntry.secondReleased || 0,
        thirdReleased: budgetEntry.thirdReleased || 0,
        fourthReleased: budgetEntry.fourthReleased || 0,
        supplementaryBudget: budgetEntry.supplementaryBudget || 0,
      });
      loadExpenseHistory();
    }
  }, [budgetEntry?.id]);

  // Data loading functions
  const loadInitial = async () => {
    try {
      setLoading(true); setError('');
      const [years, codes] = await Promise.all([api.getFiscalYears(), api.getObjectCodes()]);
      setFiscalYears(years); setObjectCodes(codes);
      const current = years.find((y) => y.isCurrent);
      setSelectedYearId(current?.id ?? years[0]?.id ?? null);
    } catch (e) { setError(e?.message || 'Failed to load data.'); }
    finally { setLoading(false); }
  };

  const loadBudgetEntry = async () => {
    try {
      setEntryLoading(true); setError('');
      const entries = await api.getBudgetEntries(selectedYearId);
      const entry = entries.find((e) => e.objectCodeId === selectedObjectCodeId);
      setBudgetEntry(entry || null);
    } catch (e) { setError(e?.message || 'Failed to load budget entry.'); setBudgetEntry(null); }
    finally { setEntryLoading(false); }
  };

  const loadExpenseHistory = async () => {
    if (!budgetEntry) return;
    try { 
      const history = await api.getExpenseHistory(budgetEntry.id); 
      setExpenseHistory(history); 
    }
    catch (e) { console.error('Failed to load expense history', e); }
  };

  // Form handlers
  const handleSaveReleases = async () => {
    if (!budgetEntry) return;
    try {
      setReleasesSaving(true); setError('');
      const updated = await api.updateReleases(budgetEntry.id, releaseForm);
      setBudgetEntry(updated); 
      setReleasesModalOpen(false);
      setSuccessMsg('Releases updated successfully!'); 
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) { setError(e?.message || 'Failed to update releases.'); }
    finally { setReleasesSaving(false); }
  };

  const handleAddExpense = async () => {
    if (!budgetEntry || !expenseForm.expenseName || !expenseForm.amount) return;
    try {
      setExpenseSaving(true); setError('');
      await api.addExpense(budgetEntry.id, {
        expenseName: expenseForm.expenseName,
        amount: parseFloat(expenseForm.amount),
        budgetType: expenseForm.budgetType,
        description: expenseForm.description,
      });
      await loadBudgetEntry(); 
      await loadExpenseHistory();
      setExpenseModalOpen(false); 
      setExpenseForm({ expenseName: '', amount: '', budgetType: 'AAA', description: '' });
      setSuccessMsg('Expense added successfully!'); 
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) { setError(e?.message || 'Failed to add expense.'); }
    finally { setExpenseSaving(false); }
  };

  // Computed values
  const selectedCode = objectCodes.find((o) => o.id === selectedObjectCodeId);
  const totalBudget = budgetEntry?.consolidatedTotalBudget ?? 0;
  const totalExp = budgetEntry?.consolidatedTotalExpenditure ?? 0;
  const totalRemaining = budgetEntry?.consolidatedRemainingBudget ?? 0;

  // Tab configuration
  const tabs = [
    { key: 'aaa', label: 'AAA (Non-Dev)', icon: Building2, color: 'teal' },
    { key: 'pla', label: 'PLA Budget', icon: Wallet, color: 'blue' },
    { key: 'uhi', label: 'UHI Budget', icon: CreditCard, color: 'amber' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 mt-1">Select an object code to view budget analysis</p>
        </div>
        {budgetEntry && (
          <div className="flex gap-2">
            <button 
              onClick={() => setReleasesModalOpen(true)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              <Banknote className="w-4 h-4" /> Add Releases
            </button>
            <button 
              onClick={() => setExpenseModalOpen(true)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <Receipt className="w-4 h-4" /> Add Expense
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" /><span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-3 text-emerald-700">
          <CheckCircle className="w-5 h-5" /><span>{successMsg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Fiscal Year</label>
            <select 
              value={selectedYearId ?? ''} 
              onChange={(e) => setSelectedYearId(Number(e.target.value))} 
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            >
              {fiscalYears.map((fy) => (
                <option key={fy.id} value={fy.id}>FY {fy.year} {fy.isCurrent && '(Current)'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Object Code</label>
            <SearchableSelect 
              options={objectCodes} 
              value={selectedObjectCodeId} 
              onChange={setSelectedObjectCodeId} 
              placeholder="Search and select an object code..." 
            />
          </div>
        </div>
      </div>

      {/* Empty state - no object code selected */}
      {!selectedObjectCodeId && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-slate-800 text-center">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Select an Object Code</h3>
          <p className="text-slate-500 mt-1">Use the dropdown above to search by code or head of account</p>
        </div>
      )}

      {/* Loading entry */}
      {selectedObjectCodeId && entryLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      )}

      {/* No budget entry found */}
      {selectedObjectCodeId && !entryLoading && !budgetEntry && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-800">No Budget Entry Found</h3>
          <p className="text-amber-700 mt-1 text-sm">
            Object code <strong>{selectedCode?.code}</strong> has no budget entry for the selected fiscal year.
          </p>
        </div>
      )}

      {/* Main dashboard content */}
      {selectedObjectCodeId && !entryLoading && budgetEntry && (
        <>
          {/* Summary Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Selected Object Code</p>
                <h2 className="text-3xl font-bold mt-1">{selectedCode?.code}</h2>
                <p className="text-slate-300 mt-2 text-lg">{selectedCode?.headOfAccount}</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Total Budget</p>
                  <p className="text-2xl font-bold text-teal-400 mt-1">Rs. {formatCurrency(totalBudget)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Spent</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">Rs. {formatCurrency(totalExp)}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs uppercase tracking-wider">Remaining</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">Rs. {formatCurrency(totalRemaining)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button 
                key={tab.key} 
                type="button" 
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeTab === tab.key 
                    ? 'text-white shadow-lg' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                style={activeTab === tab.key ? { 
                  background: `linear-gradient(135deg, ${GRADIENT_COLORS[tab.color][0]}, ${GRADIENT_COLORS[tab.color][2]})` 
                } : {}}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content - Modular Sections */}
          {activeTab === 'aaa' && (
            <AAASection budgetEntry={budgetEntry} expenseHistory={expenseHistory} />
          )}
          {activeTab === 'pla' && (
            <PLASection budgetEntry={budgetEntry} expenseHistory={expenseHistory} />
          )}
          {activeTab === 'uhi' && (
            <UHISection budgetEntry={budgetEntry} expenseHistory={expenseHistory} />
          )}
        </>
      )}

      {/* Modals */}
      <ReleasesModal
        open={releasesModalOpen}
        onClose={() => setReleasesModalOpen(false)}
        releaseForm={releaseForm}
        setReleaseForm={setReleaseForm}
        onSave={handleSaveReleases}
        saving={releasesSaving}
      />

      <ExpenseModal
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        onSave={handleAddExpense}
        saving={expenseSaving}
      />
    </div>
  );
}
