import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  Search,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Printer,
  RefreshCw,
  ArrowLeft,
  Package,
  Save,
  ExternalLink,
  Edit3,
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', icon: Save },
    PendingAccountant: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: Clock },
    PendingAccountOfficer: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', icon: Clock },
    PendingAuditOfficer: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', icon: Clock },
    PendingSeniorBudgetOfficer: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', icon: Clock },
    PendingDirectorFinance: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', icon: Clock },
    Approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: CheckCircle },
    Rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.Draft;
  const Icon = config.icon;

  const displayText = {
    Draft: 'Draft',
    PendingAccountant: 'Pending Accountant',
    PendingAccountOfficer: 'Pending Account Officer',
    PendingAuditOfficer: 'Pending Audit Officer',
    PendingSeniorBudgetOfficer: 'Pending Sr. Budget Officer',
    PendingDirectorFinance: 'Pending Director Finance',
    Approved: 'Approved',
    Rejected: 'Rejected',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {displayText[status] || status}
    </span>
  );
};

const WorkflowSteps = ({ currentStatus }) => {
  const steps = [
    { key: 'Draft', label: 'Draft' },
    { key: 'PendingAccountant', label: 'Accountant' },
    { key: 'PendingAccountOfficer', label: 'Account Officer' },
    { key: 'PendingAuditOfficer', label: 'Audit Officer' },
    { key: 'PendingSeniorBudgetOfficer', label: 'Sr. Budget Officer' },
    { key: 'PendingDirectorFinance', label: 'Director Finance' },
    { key: 'Approved', label: 'Approved' },
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex(s => s.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto py-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${index < currentIndex ? 'bg-green-500 text-white' : 
                  index === currentIndex ? 'bg-teal-500 text-white ring-4 ring-teal-500/30' : 
                  'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
            >
              {index < currentIndex ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            <span className={`mt-1 text-xs ${index <= currentIndex ? 'text-teal-600 dark:text-teal-400 font-medium' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${index < currentIndex ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const POSearchModal = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.searchPurchaseOrders(searchQuery);
      const list = Array.isArray(data) ? data : data?.purchaseOrders || [];
      const normalized = (list || []).map((po) => ({
        id: po.id ?? po.Id,
        poNumber: po.poNumber ?? po.po_number ?? po.PONumber,
        soNumber: po.soNumber ?? po.so_number ?? po.SONumber,
        supplierName: po.supplierName ?? po.supplier_name ?? po.business_name ?? po.SupplierName,
        tenderTitle:
          po.tenderTitle ?? po.tender_title ?? po.tender_number ?? po.tender_item_name ?? po.TenderTitle,
        letterOfAwardNumber:
          po.letterOfAwardNumber ?? po.award_letter_id ?? po.awardLetterId ?? po.LetterOfAwardNumber,
        totalAmount: po.totalAmount ?? po.total_amount ?? po.TotalAmount,
      }));
      setPurchaseOrders(normalized);
    } catch (error) {
      console.error('Error searching POs:', error);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      searchPOs();
    }
  }, [isOpen, searchPOs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Search Purchase Orders
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search by PO Number, SO Number, Supplier Name, or Tender Title
          </p>
        </div>

        <div className="p-6">
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchPOs()}
                placeholder="Search PO/SO number, supplier..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={searchPOs}
              disabled={loading}
              className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No purchase orders found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">PO Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tender</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                        {po.poNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {po.supplierName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {po.tenderTitle}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-800 dark:text-slate-200">
                        Rs. {po.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onSelect(po)}
                          className="px-3 py-1.5 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const DraftEditModal = ({ isOpen, bill, onClose, onSave, objectCodes, fiscalYears }) => {
  const [form, setForm] = useState({
    billDate: '',
    supplierName: '',
    tenderTitle: '',
    letterOfAwardNumber: '',
    objectCodeId: '',
    fiscalYearId: '',
    headCode: '',
    headTitle: '',
    budgetAllotment: 0,
    amountOfBill: 0,
    totalPreviousBills: 0,
    grandTotal: 0,
    stampDuty: 0,
    gst: 0,
    incomeTax: 0,
    laborDuty: 0,
    amountInWords: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!bill) return;
    setForm({
      billDate: bill.billDate ? new Date(bill.billDate).toISOString().slice(0, 10) : '',
      supplierName: bill.supplierName || '',
      tenderTitle: bill.tenderTitle || '',
      letterOfAwardNumber: bill.letterOfAwardNumber || '',
      objectCodeId: bill.objectCodeId || '',
      fiscalYearId: bill.fiscalYearId || '',
      headCode: bill.headCode || '',
      headTitle: bill.headTitle || '',
      budgetAllotment: bill.budgetAllotment || 0,
      amountOfBill: bill.amountOfBill || 0,
      totalPreviousBills: bill.totalPreviousBills || 0,
      grandTotal: bill.grandTotal || 0,
      stampDuty: bill.stampDuty || 0,
      gst: bill.gst || 0,
      incomeTax: bill.incomeTax || 0,
      laborDuty: bill.laborDuty || 0,
      amountInWords: bill.amountInWords || '',
    });
  }, [bill]);

  if (!isOpen || !bill) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(bill.id, {
        billDate: form.billDate ? new Date(form.billDate).toISOString() : null,
        supplierName: form.supplierName,
        tenderTitle: form.tenderTitle,
        letterOfAwardNumber: form.letterOfAwardNumber,
        objectCodeId: form.objectCodeId || null,
        fiscalYearId: form.fiscalYearId || null,
        headCode: form.headCode,
        headTitle: form.headTitle,
        budgetAllotment: Number(form.budgetAllotment) || 0,
        amountOfBill: Number(form.amountOfBill) || 0,
        totalPreviousBills: Number(form.totalPreviousBills) || 0,
        grandTotal: Number(form.grandTotal) || 0,
        stampDuty: Number(form.stampDuty) || 0,
        gst: Number(form.gst) || 0,
        incomeTax: Number(form.incomeTax) || 0,
        laborDuty: Number(form.laborDuty) || 0,
        amountInWords: form.amountInWords,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Edit Draft Bill
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {bill.billNumber}
          </p>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Bill Date</label>
              <input
                type="date"
                value={form.billDate}
                onChange={(e) => handleChange('billDate', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Supplier</label>
              <input
                type="text"
                value={form.supplierName}
                onChange={(e) => handleChange('supplierName', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-500 uppercase">Tender Title</label>
              <input
                type="text"
                value={form.tenderTitle}
                onChange={(e) => handleChange('tenderTitle', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Letter of Award</label>
              <input
                type="text"
                value={form.letterOfAwardNumber}
                onChange={(e) => handleChange('letterOfAwardNumber', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Fiscal Year</label>
              <select
                value={form.fiscalYearId}
                onChange={(e) => handleChange('fiscalYearId', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="">Select Fiscal Year</option>
                {fiscalYears.map((fy) => (
                  <option key={fy.id} value={fy.id}>{fy.year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Object Code</label>
              <select
                value={form.objectCodeId}
                onChange={(e) => handleChange('objectCodeId', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="">Select Object Code</option>
                {objectCodes.map((oc) => (
                  <option key={oc.id} value={oc.id}>{oc.code} - {oc.headOfAccount}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Head Code</label>
              <input
                type="text"
                value={form.headCode}
                onChange={(e) => handleChange('headCode', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Head Title</label>
              <input
                type="text"
                value={form.headTitle}
                onChange={(e) => handleChange('headTitle', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Budget Allotment</label>
              <input
                type="number"
                value={form.budgetAllotment}
                onChange={(e) => handleChange('budgetAllotment', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Amount of Bill</label>
              <input
                type="number"
                value={form.amountOfBill}
                onChange={(e) => handleChange('amountOfBill', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Total Previous Bills</label>
              <input
                type="number"
                value={form.totalPreviousBills}
                onChange={(e) => handleChange('totalPreviousBills', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Grand Total</label>
              <input
                type="number"
                value={form.grandTotal}
                onChange={(e) => handleChange('grandTotal', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Stamp Duty</label>
              <input
                type="number"
                value={form.stampDuty}
                onChange={(e) => handleChange('stampDuty', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">GST</label>
              <input
                type="number"
                value={form.gst}
                onChange={(e) => handleChange('gst', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Income Tax</label>
              <input
                type="number"
                value={form.incomeTax}
                onChange={(e) => handleChange('incomeTax', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Labor Duty</label>
              <input
                type="number"
                value={form.laborDuty}
                onChange={(e) => handleChange('laborDuty', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-500 uppercase">Amount in Words</label>
              <input
                type="text"
                value={form.amountInWords}
                onChange={(e) => handleChange('amountInWords', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const BillDetailsModal = ({ bill, isOpen, onClose, onAction, userRole, onEdit }) => {
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bill) {
      loadHistory();
    }
  }, [isOpen, bill]);

  const loadHistory = async () => {
    try {
      const data = await api.getBillHistory(bill.id);
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onAction('approve', bill.id, remarks);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      await onAction('save-draft', bill.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    try {
      await onAction('reject', bill.id, rejectReason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    setLoading(true);
    try {
      await onAction('return', bill.id, remarks);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.open(`/desk/print/${bill.id}`, '_blank');
  };

  const canApprove = () => {
    const roleStatusMap = {
      ComputerOperator: ['Draft', 'Rejected'],
      Accountant: ['PendingAccountant'],
      AccountOfficer: ['PendingAccountOfficer'],
      AuditOfficer: ['PendingAuditOfficer'],
      SeniorBudgetOfficer: ['PendingSeniorBudgetOfficer'],
      DirectorFinance: ['PendingDirectorFinance'],
    };
    return roleStatusMap[userRole]?.includes(bill?.status);
  };

  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl print:max-w-none print:max-h-none print:shadow-none">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:border-b-2 print:border-black">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Contingent Bill Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {bill.billNumber}
            </p>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            {userRole === 'AccountOfficer' &&
              bill.status?.replace(/\s+/g, '').toLowerCase() === 'pendingaccountofficer' && (
              <button
                onClick={() => onEdit?.(bill)}
                className="px-3 py-2 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                title="Edit Bill"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
            {bill.status === 'Approved' && (
              <button
                onClick={handlePrint}
                className="px-3 py-2 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Print Report
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] print:max-h-none">
          <div className="mb-6 print:hidden">
            <WorkflowSteps currentStatus={bill.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Bill Number</label>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{bill.billNumber}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Bill Date</label>
              <p className="text-sm text-slate-800 dark:text-slate-200">
                {new Date(bill.billDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
              <div><StatusBadge status={bill.status} /></div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">PO Number</label>
              <p className="text-sm text-slate-800 dark:text-slate-200">{bill.poNumber || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Supplier</label>
              <p className="text-sm text-slate-800 dark:text-slate-200">{bill.supplierName || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Object Code</label>
              <p className="text-sm text-slate-800 dark:text-slate-200">{bill.objectCode || '-'}</p>
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs font-medium text-slate-500 uppercase">Tender Title</label>
              <p className="text-sm text-slate-800 dark:text-slate-200">{bill.tenderTitle || '-'}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Financial Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-500">Amount of Bill</label>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Rs. {bill.amountOfBill?.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Net Payment</label>
                <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                  Rs. {bill.netPayment?.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Created By</label>
                <p className="text-sm text-slate-800 dark:text-slate-200">{bill.createdByName || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500">Created At</label>
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  {new Date(bill.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Workflow History</h3>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500">No history available</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.step}</p>
                      <p className="text-xs text-slate-500">
                        By: {item.by} • {new Date(item.date).toLocaleString()}
                      </p>
                      {item.remarks && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">"{item.remarks}"</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {canApprove() && !showRejectForm && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 print:hidden">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Remarks (optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500"
                  placeholder="Add remarks..."
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                {userRole === 'ComputerOperator' && bill.status === 'Draft' && (
                  <button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                )}
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {userRole === 'ComputerOperator' ? 'Submit to Account Officer' :
                   userRole === 'DirectorFinance' ? 'Final Approve' : 'Approve & Forward'}
                </button>
                {userRole !== 'ComputerOperator' && (
                  <>
                    <button
                      onClick={handleReturn}
                      disabled={loading}
                      className="px-4 py-2.5 border border-amber-500 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Return
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="px-4 py-2.5 border border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {showRejectForm && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 print:hidden">
              <div className="mb-4">
                <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-red-500"
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading || !rejectReason.trim()}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function RoleDesk() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPOSearch, setShowPOSearch] = useState(false);
  const [showDraftEdit, setShowDraftEdit] = useState(false);
  const [draftToEdit, setDraftToEdit] = useState(null);
  const [objectCodes, setObjectCodes] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [activeTab, setActiveTab] = useState('queue');
  const [error, setError] = useState('');

  const fetchQueueBills = useCallback(async () => {
    switch (user?.role) {
      case 'ComputerOperator':
        return api.getComputerOperatorBills();
      case 'Accountant':
        return api.getAccountantBills();
      case 'AccountOfficer':
        return api.getAccountOfficerBills();
      case 'AuditOfficer':
        return api.getAuditOfficerBills();
      case 'SeniorBudgetOfficer':
        return api.getSeniorBudgetOfficerBills();
      case 'DirectorFinance':
        return api.getDirectorFinanceBills();
      default:
        return api.getMyQueueBills();
    }
  }, [user?.role]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [billsData, statsData] = await Promise.all([
        fetchQueueBills(),
        api.getWorkflowStats(),
      ]);
      setBills(billsData || []);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchQueueBills]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [codes, years] = await Promise.all([api.getObjectCodes(), api.getFiscalYears()]);
        setObjectCodes(codes || []);
        setFiscalYears(years || []);
      } catch (err) {
        console.error('Failed to load meta', err);
      }
    };
    loadMeta();
  }, []);

  const loadBillsByStatus = async (status) => {
    setLoading(true);
    setError('');
    try {
      let data;
      switch (status) {
        case 'queue':
          data = await fetchQueueBills();
          break;
        case 'approved':
          data = await api.getApprovedBills();
          break;
        case 'rejected':
          data = await api.getRejectedBills();
          break;
        default:
          data = await fetchQueueBills();
      }
      setBills(data || []);
      setActiveTab(status);
    } catch (err) {
      setError(err.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePOSelect = async (po) => {
    try {
      await api.createBillFromPO({
        poNumber: po.poNumber || po.PONumber || '',
        soNumber: po.soNumber || po.SONumber || null,
        supplierName: po.supplierName || po.SupplierName || null,
        tenderTitle: po.tenderTitle || po.TenderTitle || null,
        letterOfAwardNumber: String(po.letterOfAwardNumber ?? ''),
        totalAmount: Number(po.totalAmount ?? 0),
      });
      setShowPOSearch(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create bill');
    }
  };

  const handleWorkflowAction = async (action, billId, remarksOrReason) => {
    try {
      switch (action) {
        case 'approve':
          if (user.role === 'ComputerOperator') {
            await api.submitToAccountOfficer(billId, remarksOrReason);
          } else if (user.role === 'Accountant') {
            await api.accountantApprove(billId, remarksOrReason);
          } else if (user.role === 'AccountOfficer') {
            await api.accountOfficerApprove(billId, remarksOrReason);
          } else if (user.role === 'AuditOfficer') {
            await api.auditOfficerApprove(billId, remarksOrReason);
          } else if (user.role === 'SeniorBudgetOfficer') {
            await api.seniorBudgetOfficerApprove(billId, remarksOrReason);
          } else if (user.role === 'DirectorFinance') {
            await api.directorFinanceApprove(billId, remarksOrReason);
          }
          break;
        case 'save-draft':
          await api.saveBillAsDraft(billId);
          break;
        case 'reject':
          await api.rejectBill(billId, remarksOrReason);
          break;
        case 'return':
          await api.returnBill(billId, remarksOrReason);
          break;
      }
      loadData();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDraftSave = async (id, data) => {
    try {
      await api.updateContingentBill(id, data);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update draft');
    }
  };

  const getRoleDisplayName = (role) => {
    const names = {
      ComputerOperator: 'Computer Operator',
      Accountant: 'Accountant',
      AccountOfficer: 'Account Officer',
      AuditOfficer: 'Audit Officer',
      SeniorBudgetOfficer: 'Senior Budget & Account Officer',
      DirectorFinance: 'Director Finance',
      Admin: 'Administrator',
    };
    return names[role] || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {getRoleDisplayName(user?.role)} Desk
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Contingent Bills Processing Queue
          </p>
        </div>
        {user?.role === 'ComputerOperator' && (
          <button
            onClick={() => setShowPOSearch(true)}
            className="px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Create Bill from PO
          </button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.draft}</div>
            <div className="text-xs text-slate-500">Drafts</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-bold text-blue-600">{stats.pendingAccountant}</div>
            <div className="text-xs text-slate-500">@ Accountant</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-bold text-indigo-600">{stats.pendingAccountOfficer}</div>
            <div className="text-xs text-slate-500">@ Acct Officer</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-bold text-purple-600">{stats.pendingAuditOfficer}</div>
            <div className="text-xs text-slate-500">@ Audit</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-bold text-amber-600">{stats.pendingSeniorBudgetOfficer}</div>
            <div className="text-xs text-slate-500">@ Sr. Budget</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingDirectorFinance}</div>
            <div className="text-xs text-slate-500">@ DF</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-xs text-slate-500">Approved</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-slate-500">Rejected</div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => loadBillsByStatus('queue')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'queue'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          My Queue {stats?.myQueueCount > 0 && `(${stats.myQueueCount})`}
        </button>
        <button
          onClick={() => loadBillsByStatus('approved')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'approved'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => loadBillsByStatus('rejected')}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'rejected'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Rejected
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">No bills in your queue</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Bill Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    PO / Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tender
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {bill.billNumber}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(bill.billDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-800 dark:text-slate-200">
                        {bill.poNumber || '-'}
                      </div>
                      <div className="text-xs text-slate-500">{bill.supplierName}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {bill.tenderTitle || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Rs. {bill.netPayment?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={bill.status} />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {user?.role === 'ComputerOperator' && bill.status === 'Draft' && (
                        <button
                          onClick={() => {
                            setDraftToEdit(bill);
                            setShowDraftEdit(true);
                          }}
                          className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-2"
                          title="Edit Draft"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      )}
                      {user?.role === 'AccountOfficer' &&
                        bill.status?.replace(/\s+/g, '').toLowerCase() === 'pendingaccountofficer' && (
                        <button
                          onClick={() => {
                            setDraftToEdit(bill);
                            setShowDraftEdit(true);
                          }}
                          className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-2"
                          title="Edit Bill"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <POSearchModal
        isOpen={showPOSearch}
        onClose={() => setShowPOSearch(false)}
        onSelect={handlePOSelect}
      />

      <DraftEditModal
        isOpen={showDraftEdit}
        bill={draftToEdit}
        onClose={() => {
          setShowDraftEdit(false);
          setDraftToEdit(null);
        }}
        onSave={handleDraftSave}
        objectCodes={objectCodes}
        fiscalYears={fiscalYears}
      />

      <BillDetailsModal
        bill={selectedBill}
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        onAction={handleWorkflowAction}
        userRole={user?.role}
        onEdit={(bill) => {
          setDraftToEdit(bill);
          setShowDraftEdit(true);
        }}
      />
    </div>
  );
}
