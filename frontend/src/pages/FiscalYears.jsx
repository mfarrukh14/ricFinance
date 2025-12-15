import React,{ useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus,
  Calendar,
  Check,
  X,
  Save,
  AlertCircle,
  Star,
} from 'lucide-react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl transform transition-all w-full max-w-lg mx-auto">
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

export default function FiscalYears() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ year: '', startDate: '', endDate: '', isCurrent: false });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFiscalYears();
  }, []);

  const loadFiscalYears = async () => {
    try {
      setLoading(true);
      const data = await api.getFiscalYears();
      setFiscalYears(data);
    } catch (error) {
      console.error('Failed to load fiscal years:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth();
    const fyYear = month >= 6 ? `${currentYear}-${(currentYear + 1).toString().slice(2)}` : `${currentYear - 1}-${currentYear.toString().slice(2)}`;
    
    setFormData({
      year: fyYear,
      startDate: month >= 6 ? `${currentYear}-07-01` : `${currentYear - 1}-07-01`,
      endDate: month >= 6 ? `${currentYear + 1}-06-30` : `${currentYear}-06-30`,
      isCurrent: false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      await api.createFiscalYear(formData);
      setModalOpen(false);
      loadFiscalYears();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetCurrent = async (id) => {
    try {
      await api.setCurrentFiscalYear(id);
      loadFiscalYears();
    } catch (error) {
      console.error('Failed to set current fiscal year:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Fiscal Years</h1>
          <p className="text-slate-500 mt-1">Manage financial year periods</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Fiscal Year
        </button>
      </div>

      {/* Fiscal Years Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fiscalYears.map((fy) => (
            <div
              key={fy.id}
              className={`bg-white rounded-2xl shadow-sm border-2 p-6 hover:shadow-lg transition-all ${
                fy.isCurrent ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl shadow-lg ${
                  fy.isCurrent 
                    ? 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-500/20' 
                    : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-400/20'
                }`}>
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                {fy.isCurrent && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                    <Star className="w-3.5 h-3.5" />
                    Current
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-slate-800 mb-4">FY {fy.year}</h3>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Start Date</span>
                  <span className="text-slate-700 font-medium">{formatDate(fy.startDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">End Date</span>
                  <span className="text-slate-700 font-medium">{formatDate(fy.endDate)}</span>
                </div>
              </div>

              {!fy.isCurrent && (
                <button
                  onClick={() => handleSetCurrent(fy.id)}
                  className="w-full py-2.5 border-2 border-teal-500 text-teal-600 rounded-xl hover:bg-teal-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Set as Current
                </button>
              )}
            </div>
          ))}
          {fiscalYears.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No fiscal years found</p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Fiscal Year">
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Fiscal Year</label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              placeholder="e.g., 2024-25"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isCurrent"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="w-5 h-5 text-teal-500 border-slate-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="isCurrent" className="text-sm font-medium text-slate-600">
              Set as current fiscal year
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
