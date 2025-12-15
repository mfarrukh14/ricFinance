import React,{ useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
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
          className={`relative bg-white rounded-2xl shadow-2xl transform transition-all w-full ${sizeClasses[size]} mx-auto`}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function BudgetForm({ entry, objectCodes, fiscalYears, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    objectCodeId: entry?.objectCodeId || '',
    fiscalYearId: entry?.fiscalYearId || (fiscalYears.find((f) => f.isCurrent)?.id || ''),
    totalBudgetAllocation: entry?.totalBudgetAllocation || 0,
    firstReleased: entry?.firstReleased || 0,
    secondReleased: entry?.secondReleased || 0,
    thirdReleased: entry?.thirdReleased || 0,
    fourthReleased: entry?.fourthReleased || 0,
    supplementaryBudget: entry?.supplementaryBudget || 0,
    additionalSurrender: entry?.additionalSurrender || 0,
    excessReallocation: entry?.excessReallocation || 0,
    aaaReApp: entry?.aaaReApp || 0,
    budgetWithheldLapse: entry?.budgetWithheldLapse || 0,
    aaaExpenditure: entry?.aaaExpenditure || 0,
    plaBudgetAllocated: entry?.plaBudgetAllocated || 0,
    plaReApp: entry?.plaReApp || 0,
    plaExpenditure: entry?.plaExpenditure || 0,
    uhiBudgetAllocated: entry?.uhiBudgetAllocated || 0,
    uhiReApp: entry?.uhiReApp || 0,
    uhiExpenditure: entry?.uhiExpenditure || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, field, type = 'number' }) => (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={formData[field]}
        onChange={(e) => handleChange(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Object Code</label>
          <select
            value={formData.objectCodeId}
            onChange={(e) => handleChange('objectCodeId', parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            required
            disabled={!!entry}
          >
            <option value="">Select Object Code</option>
            {objectCodes.map((oc) => (
              <option key={oc.id} value={oc.id}>
                {oc.code} - {oc.headOfAccount}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Fiscal Year</label>
          <select
            value={formData.fiscalYearId}
            onChange={(e) => handleChange('fiscalYearId', parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            required
            disabled={!!entry}
          >
            <option value="">Select Fiscal Year</option>
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>
                {fy.year} {fy.isCurrent && '(Current)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Non-Development Budget Section */}
      <div className="bg-teal-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-teal-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          Non-Development Budget (AAA)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Total Budget Allocation" field="totalBudgetAllocation" />
          <InputField label="1st Released" field="firstReleased" />
          <InputField label="2nd Released" field="secondReleased" />
          <InputField label="3rd Released" field="thirdReleased" />
          <InputField label="4th Released" field="fourthReleased" />
          <InputField label="Supplementary Budget" field="supplementaryBudget" />
          <InputField label="Additional/Surrender" field="additionalSurrender" />
          <InputField label="Excess Reallocation" field="excessReallocation" />
          <InputField label="Re-appropriation" field="aaaReApp" />
          <InputField label="Budget Withheld/Lapse" field="budgetWithheldLapse" />
          <InputField label="AAA Expenditure" field="aaaExpenditure" />
        </div>
      </div>

      {/* PLA Budget Section */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          PLA Budget
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Budget Allocated" field="plaBudgetAllocated" />
          <InputField label="Re-appropriation" field="plaReApp" />
          <InputField label="PLA Expenditure" field="plaExpenditure" />
        </div>
      </div>

      {/* UHI Budget Section */}
      <div className="bg-amber-50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-amber-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          UHI Budget
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Budget Allocated" field="uhiBudgetAllocated" />
          <InputField label="Re-appropriation" field="uhiReApp" />
          <InputField label="UHI Expenditure" field="uhiExpenditure" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
}

export default function BudgetEntries() {
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
      const [codes, years] = await Promise.all([api.getObjectCodes(), api.getFiscalYears()]);
      setObjectCodes(codes);
      setFiscalYears(years);
      const current = years.find((y) => y.isCurrent);
      if (current) {
        setSelectedYear(current.id);
      } else if (years.length > 0) {
        setSelectedYear(years[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await api.getBudgetEntries(selectedYear);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    if (editingEntry) {
      await api.updateBudgetEntry(editingEntry.id, formData);
    } else {
      await api.createBudgetEntry(formData);
    }
    setModalOpen(false);
    setEditingEntry(null);
    loadEntries();
  };

  const handleDelete = async (id) => {
    await api.deleteBudgetEntry(id);
    setDeleteConfirm(null);
    loadEntries();
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingEntry(null);
    setModalOpen(true);
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
          <h1 className="text-3xl font-bold text-slate-800">Budget Entries</h1>
          <p className="text-slate-500 mt-1">Manage budget allocations and expenditures</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by object code or head of account..."
              className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
          </div>
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium min-w-[200px]"
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">
                      Object Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Head of Account
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-teal-600 uppercase tracking-wider whitespace-nowrap">
                      AAA Budget
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-teal-600 uppercase tracking-wider whitespace-nowrap">
                      AAA Exp.
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
                <tbody className="divide-y divide-slate-200">
                  {paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-800 sticky left-0 bg-white">
                        {entry.objectCode}
                      </td>
                      <td className="px-4 py-4 text-slate-600 max-w-xs truncate">{entry.headOfAccount}</td>
                      <td className="px-4 py-4 text-right text-slate-800">{formatCurrency(entry.totalAAABudget)}</td>
                      <td className="px-4 py-4 text-right text-red-600">{formatCurrency(entry.aaaExpenditure)}</td>
                      <td className="px-4 py-4 text-right text-slate-800">{formatCurrency(entry.plaTotalBudget)}</td>
                      <td className="px-4 py-4 text-right text-red-600">{formatCurrency(entry.plaExpenditure)}</td>
                      <td className="px-4 py-4 text-right text-slate-800">{formatCurrency(entry.uhiTotalBudget)}</td>
                      <td className="px-4 py-4 text-right text-red-600">{formatCurrency(entry.uhiExpenditure)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-800">
                        {formatCurrency(entry.consolidatedTotalBudget)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-red-600">
                        {formatCurrency(entry.consolidatedTotalExpenditure)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-emerald-600">
                        {formatCurrency(entry.consolidatedRemainingBudget)}
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
                      <td colSpan={12} className="px-4 py-12 text-center">
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
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(page - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(page * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === p ? 'bg-teal-500 text-white' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
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
        title={editingEntry ? 'Edit Budget Entry' : 'Create Budget Entry'}
        size="xl"
      >
        <BudgetForm
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
          <p className="text-slate-600">Are you sure you want to delete this budget entry? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
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
