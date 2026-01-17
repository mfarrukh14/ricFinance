import React,{ useState, useEffect } from 'react';
import api from '../services/api';
import BudgetEntryForm from '../components/BudgetEntryForm';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatRupees(value) {
  return `Rs. ${formatCurrency(value)}`;
}

function Modal({ isOpen, onClose, title, children, size = 'lg' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div
          className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl transform transition-all w-full ${sizeClasses[size]} mx-auto border border-slate-200 dark:border-slate-800`}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function BudgetEntries() {
  const navigate = useNavigate();
  const location = useLocation();
  const [entries, setEntries] = useState([]);
  const [objectCodes, setObjectCodes] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pageError, setPageError] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedYear !== null) {
      loadEntries();
    }
  }, [selectedYear]);

  const loadInitialData = async () => {
    try {
      setPageError('');
      const [codes, years] = await Promise.all([api.getObjectCodes(), api.getFiscalYears()]);
      setObjectCodes(codes);
      setFiscalYears(years);

      const desiredYearId = location?.state?.selectedYearId;
      if (desiredYearId && years.some((y) => y.id === desiredYearId)) {
        setSelectedYear(desiredYearId);
        return;
      }

      const current = years.find((y) => y.isCurrent);
      if (current) {
        setSelectedYear(current.id);
      } else if (years.length > 0) {
        setSelectedYear(years[0].id);
      }
    } catch (error) {
      setPageError(error?.message || 'Failed to load initial data.');
    }
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      setPageError('');
      const data = await api.getBudgetEntries(selectedYear);
      setEntries(data);
    } catch (error) {
      setPageError(error?.message || 'Failed to load budget entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setPageError('');
      await api.updateBudgetEntry(editingEntry.id, formData);
      setModalOpen(false);
      setEditingEntry(null);
      loadEntries();
    } catch (error) {
      setPageError(error?.message || 'Failed to save budget head.');
      throw error;
    }
  };

  const handleDelete = async (id) => {
    try {
      setPageError('');
      await api.deleteBudgetEntry(id);
      setDeleteConfirm(null);
      loadEntries();
    } catch (error) {
      setPageError(error?.message || 'Failed to delete budget head.');
    }
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const openCreatePage = () => {
    navigate('/budget/new');
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.objectCode.toLowerCase().includes(search.toLowerCase()) ||
      e.headOfAccount.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Budget Entries</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage budget allocations and expenditures</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All amounts are in Rupees (Rs.).</p>
        </div>

        <button
          onClick={openCreatePage}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New Budget Head
        </button>
      </div>

      {pageError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-200 whitespace-pre-line">
          <AlertCircle className="w-5 h-5" />
          <span>{pageError}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by object code or head of account..."
              className="w-full pl-12 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            />
          </div>
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium min-w-[200px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
          >
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>
                FY {fy.year} {fy.isCurrent && '(Current)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-950 z-10">
                      Object Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Head of Account
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-teal-600 uppercase tracking-wider whitespace-nowrap">
                      AAA (Non-Dev) Budget
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-teal-600 uppercase tracking-wider whitespace-nowrap">
                      AAA (Non-Dev) Exp.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 uppercase tracking-wider whitespace-nowrap">
                      Dev Budget
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 uppercase tracking-wider whitespace-nowrap">
                      Dev Exp.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-blue-600 uppercase tracking-wider whitespace-nowrap">
                      PLA Budget
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-blue-600 uppercase tracking-wider whitespace-nowrap">
                      PLA Exp.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-amber-600 uppercase tracking-wider whitespace-nowrap">
                      UHI Budget
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-amber-600 uppercase tracking-wider whitespace-nowrap">
                      UHI Exp.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-purple-600 uppercase tracking-wider whitespace-nowrap">
                      Total Budget
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-purple-600 uppercase tracking-wider whitespace-nowrap">
                      Total Exp.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-emerald-600 uppercase tracking-wider whitespace-nowrap">
                      Remaining
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-900">
                        {entry.objectCode}
                      </td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{entry.headOfAccount}</td>
                      <td className="px-4 py-4 text-right text-slate-800 dark:text-slate-100">{formatRupees(entry.totalAAABudget)}</td>
                      <td className="px-4 py-4 text-right text-red-600">{formatRupees(entry.aaaExpenditure)}</td>
                      <td className="px-4 py-4 text-right text-slate-800 dark:text-slate-100">
                        {formatRupees(entry.developmentTotalBudget)}
                      </td>
                      <td className="px-4 py-4 text-right text-red-600">
                        {formatRupees(entry.developmentExpenditure)}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-800 dark:text-slate-100">{formatRupees(entry.plaTotalBudget)}</td>
                      <td className="px-4 py-4 text-right text-red-600">{formatRupees(entry.plaExpenditure)}</td>
                      <td className="px-4 py-4 text-right text-slate-800 dark:text-slate-100">{formatRupees(entry.uhiTotalBudget)}</td>
                      <td className="px-4 py-4 text-right text-red-600">{formatRupees(entry.uhiExpenditure)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-800 dark:text-slate-100">
                        {formatRupees(entry.consolidatedTotalBudget)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-red-600">
                        {formatRupees(entry.consolidatedTotalExpenditure)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                        {formatRupees(entry.consolidatedRemainingBudget)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(entry)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(entry.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedEntries.length === 0 && (
                    <tr>
                      <td colSpan={14} className="px-4 py-12 text-center">
                        <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No budget entries found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {(page - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(page * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === p
                          ? 'bg-teal-500 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        title={'Edit Budget Entry'}
        size="xl"
      >
        <BudgetEntryForm
          entry={editingEntry}
          objectCodes={objectCodes}
          fiscalYears={fiscalYears}
          onSave={handleSave}
          onCancel={() => {
            setModalOpen(false);
            setEditingEntry(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm">
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete this budget entry? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
