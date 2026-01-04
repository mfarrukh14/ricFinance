import React, { useEffect, useState } from 'react';
import { AlertCircle, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';

export default function Reports() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const years = await api.getFiscalYears();
        setFiscalYears(years);
        const current = years.find((y) => y.isCurrent);
        setSelectedYearId(String(current?.id ?? years[0]?.id ?? ''));
      } catch (e) {
        setError(e?.message || 'Failed to load fiscal years.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const downloadConsolidated = async () => {
    try {
      setDownloading(true);
      setError('');
      if (!selectedYearId) {
        setError('Please select a fiscal year.');
        return;
      }

      const { blob, fileName } = await api.downloadConsolidatedBudgetReport(Number(selectedYearId));

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'ConsolidatedBudgetReport.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.message || 'Failed to generate report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Reports</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate consolidated budget reports by fiscal year</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-200 whitespace-pre-line">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-36">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Fiscal Year</label>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              >
                {fiscalYears.map((fy) => (
                  <option key={fy.id} value={String(fy.id)}>
                    FY {fy.year} {fy.isCurrent && '(Current)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Consolidated Budget Report</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Exports an Excel file with all object codes, heads, and budget entry fields.
                </p>
              </div>

              <button
                type="button"
                onClick={downloadConsolidated}
                disabled={downloading || !selectedYearId}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-teal-500/20 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-5 h-5" />
                {downloading ? 'Generating...' : 'Generate Consolidated Budget Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
