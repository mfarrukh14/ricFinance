import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import api from '../services/api';
import BudgetEntryForm from '../components/BudgetEntryForm';

export default function BudgetEntryCreate() {
  const navigate = useNavigate();
  const [objectCodes, setObjectCodes] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setPageError('');
        const [codes, years] = await Promise.all([api.getObjectCodes(), api.getFiscalYears()]);
        setObjectCodes(codes);
        setFiscalYears(years);
      } catch (error) {
        setPageError(error?.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSave = async (payload) => {
    await api.createBudgetEntry(payload);
    navigate('/budget', { state: { selectedYearId: payload.fiscalYearId } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Create Budget Entry</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">All amounts are in Rupees (Rs.).</p>
      </div>

      {pageError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-200 whitespace-pre-line">
          <AlertCircle className="w-5 h-5" />
          <span>{pageError}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <BudgetEntryForm
            entry={null}
            objectCodes={objectCodes}
            fiscalYears={fiscalYears}
            onSave={handleSave}
            onCancel={() => navigate('/budget')}
          />
        )}
      </div>
    </div>
  );
}
