import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FileText,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Filter,
} from 'lucide-react';

export default function ContingentBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [objectCodes, setObjectCodes] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [editData, setEditData] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    supplierName: '',
    tenderTitle: '',
    objectCodeId: null,
    fiscalYearId: null,
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
    netPayment: 0,
    amountInWords: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsData, codesData, yearsData] = await Promise.all([
        api.getContingentBills(),
        api.getObjectCodes(),
        api.getFiscalYears(),
      ]);
      setBills(billsData);
      setObjectCodes(codesData);
      setFiscalYears(yearsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        objectCodeId:
          formData.objectCodeId === null || formData.objectCodeId === undefined
            ? null
            : Number(formData.objectCodeId),
        fiscalYearId:
          formData.fiscalYearId === null || formData.fiscalYearId === undefined
            ? null
            : Number(formData.fiscalYearId),
      };
      await api.createContingentBill(payload);
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = async (id, approvalType) => {
    try {
      await api.approveContingentBill(id, approvalType);
      fetchData();
      if (selectedBill?.id === id) {
        const updated = await api.getContingentBill(id);
        setSelectedBill(updated);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await api.rejectContingentBill(id, reason);
      fetchData();
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const updated = await api.updateContingentBill(id, data);
      fetchData();
      if (selectedBill?.id === id) setSelectedBill(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const openBillModal = async (bill) => {
    try {
      const full = await api.getContingentBill(bill.id);
      setSelectedBill(full);
      setEditData({
        ...full,
        billDate: full?.billDate ? String(full.billDate).split('T')[0] : '',
      });
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      supplierName: '',
      tenderTitle: '',
      objectCodeId: null,
      fiscalYearId: null,
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
      netPayment: 0,
      amountInWords: '',
    });
  };

  const calculateNetPayment = () => {
    const gross = parseFloat(formData.grandTotal) || 0;
    const sd = parseFloat(formData.stampDuty) || 0;
    const gst = parseFloat(formData.gst) || 0;
    const it = parseFloat(formData.incomeTax) || 0;
    const ld = parseFloat(formData.laborDuty) || 0;
    return gross - sd - gst - it - ld;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchesStatus = filterStatus === 'all' || bill.status?.toLowerCase() === filterStatus;
    const matchesSearch =
      bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.tenderTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 0) return 'Negative ' + numberToWords(-num);
    
    let words = '';
    
    if (Math.floor(num / 10000000) > 0) {
      words += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
      num %= 10000000;
    }
    if (Math.floor(num / 100000) > 0) {
      words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
      num %= 100000;
    }
    if (Math.floor(num / 1000) > 0) {
      words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    if (Math.floor(num / 100) > 0) {
      words += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num > 0) {
      if (num < 10) words += ones[num];
      else if (num < 20) words += teens[num - 10];
      else {
        words += tens[Math.floor(num / 10)];
        if (num % 10 > 0) words += ' ' + ones[num % 10];
      }
    }
    
    return words.trim();
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contingent Bills</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage contingent bills from eProcurement</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Bill
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Head Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No contingent bills found
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">{bill.billNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-white">{bill.supplierName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{bill.tenderTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        Rs. {bill.grandTotal?.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Net: Rs. {bill.netPayment?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                      {bill.headCode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          bill.status
                        )}`}
                      >
                        {getStatusIcon(bill.status)}
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(bill.billDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openBillModal(bill)}
                        className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View/Edit Modal */}
      {showModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Contingent Bill: {selectedBill.billNumber}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedBill.supplierName} - {selectedBill.tenderTitle}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBill(null);
                    setEditData(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Bill Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Budget Allotment</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    Rs. {selectedBill.budgetAllotment?.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Amount of Bill</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    Rs. {selectedBill.amountOfBill?.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Grand Total</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    Rs. {selectedBill.grandTotal?.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <div className="text-xs text-teal-600 dark:text-teal-400">Net Payment</div>
                  <div className="text-lg font-semibold text-teal-700 dark:text-teal-300">
                    Rs. {selectedBill.netPayment?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Edit (Pending only) */}
              {selectedBill.status?.toLowerCase() === 'pending' && editData && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-slate-900 dark:text-white">Edit Bill</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bill Date</label>
                      <input
                        type="date"
                        value={editData.billDate || ''}
                        onChange={(e) => setEditData({ ...editData, billDate: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LOA Number</label>
                      <input
                        type="text"
                        value={editData.letterOfAwardNumber || ''}
                        onChange={(e) => setEditData({ ...editData, letterOfAwardNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Supplier Name</label>
                      <input
                        type="text"
                        value={editData.supplierName || ''}
                        onChange={(e) => setEditData({ ...editData, supplierName: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tender Title</label>
                      <input
                        type="text"
                        value={editData.tenderTitle || ''}
                        onChange={(e) => setEditData({ ...editData, tenderTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Object Code</label>
                      <select
                        value={editData.objectCodeId ?? ''}
                        onChange={async (e) => {
                          const nextId = e.target.value ? Number(e.target.value) : null;
                          const code = objectCodes.find((c) => c.id === nextId);
                          const next = {
                            ...editData,
                            objectCodeId: nextId,
                            headCode: code?.code || editData.headCode || '',
                            headTitle: code?.headOfAccount || editData.headTitle || '',
                          };
                          setEditData(next);

                          try {
                            const payload = {
                              objectCodeId: nextId,
                              headCode: next.headCode,
                              headTitle: next.headTitle,
                            };
                            if (next.fiscalYearId) payload.fiscalYearId = Number(next.fiscalYearId);

                            const updated = await handleUpdate(selectedBill.id, payload);
                            setEditData((prev) => ({
                              ...prev,
                              objectCodeId: updated.objectCodeId,
                              fiscalYearId: updated.fiscalYearId,
                              headCode: updated.headCode,
                              headTitle: updated.headTitle,
                              budgetAllotment: updated.budgetAllotment,
                              totalPreviousBills: updated.totalPreviousBills,
                              availableBalance: updated.availableBalance,
                              totalUptoDate: updated.totalUptoDate,
                            }));
                          } catch (err) {
                            // error already shown
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Select Object Code</option>
                        {objectCodes.map((code) => (
                          <option key={code.id} value={code.id}>
                            {code.code} - {code.headOfAccount}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fiscal Year</label>
                      <select
                        value={editData.fiscalYearId ?? ''}
                        onChange={async (e) => {
                          const nextFy = e.target.value ? Number(e.target.value) : null;
                          setEditData({ ...editData, fiscalYearId: nextFy });

                          try {
                            const payload = { fiscalYearId: nextFy };
                            if (editData.objectCodeId) payload.objectCodeId = Number(editData.objectCodeId);
                            if (editData.headCode) payload.headCode = editData.headCode;
                            if (editData.headTitle) payload.headTitle = editData.headTitle;

                            const updated = await handleUpdate(selectedBill.id, payload);
                            setEditData((prev) => ({
                              ...prev,
                              objectCodeId: updated.objectCodeId,
                              fiscalYearId: updated.fiscalYearId,
                              headCode: updated.headCode,
                              headTitle: updated.headTitle,
                              budgetAllotment: updated.budgetAllotment,
                              totalPreviousBills: updated.totalPreviousBills,
                              availableBalance: updated.availableBalance,
                              totalUptoDate: updated.totalUptoDate,
                            }));
                          } catch (err) {
                            // error already shown
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Select Fiscal Year</option>
                        {fiscalYears.map((fy) => (
                          <option key={fy.id} value={fy.id}>
                            {fy.year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget Allotment</label>
                      <input
                        type="number"
                        value={editData.budgetAllotment ?? 0}
                        onChange={(e) => setEditData({ ...editData, budgetAllotment: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Previous Bills (Expenditure)</label>
                      <input
                        type="number"
                        value={editData.totalPreviousBills ?? 0}
                        onChange={(e) => setEditData({ ...editData, totalPreviousBills: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount of Bill</label>
                      <input
                        type="number"
                        value={editData.amountOfBill ?? 0}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          setEditData({
                            ...editData,
                            amountOfBill: amount,
                            amountInWords: numberToWords(Math.floor(amount)) + ' Rupees Only',
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stamp Duty</label>
                      <input
                        type="number"
                        value={editData.stampDuty ?? 0}
                        onChange={(e) => setEditData({ ...editData, stampDuty: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GST</label>
                      <input
                        type="number"
                        value={editData.gst ?? 0}
                        onChange={(e) => setEditData({ ...editData, gst: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Income Tax</label>
                      <input
                        type="number"
                        value={editData.incomeTax ?? 0}
                        onChange={(e) => setEditData({ ...editData, incomeTax: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Labor Duty</label>
                      <input
                        type="number"
                        value={editData.laborDuty ?? 0}
                        onChange={(e) => setEditData({ ...editData, laborDuty: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grand Total</label>
                      <input
                        type="number"
                        value={editData.grandTotal ?? 0}
                        onChange={(e) => setEditData({ ...editData, grandTotal: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Net Payment (Server)</label>
                      <input
                        type="number"
                        value={selectedBill.netPayment ?? 0}
                        readOnly
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount in Words</label>
                    <input
                      type="text"
                      value={editData.amountInWords || ''}
                      onChange={(e) => setEditData({ ...editData, amountInWords: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={async () => {
                        try {
                          setEditSaving(true);
                          const payload = {
                            billDate: editData.billDate || null,
                            supplierName: editData.supplierName || null,
                            tenderTitle: editData.tenderTitle || null,
                            letterOfAwardNumber: editData.letterOfAwardNumber || null,
                            objectCodeId: editData.objectCodeId ? Number(editData.objectCodeId) : null,
                            fiscalYearId: editData.fiscalYearId ? Number(editData.fiscalYearId) : null,
                            headCode: editData.headCode || null,
                            headTitle: editData.headTitle || null,
                            budgetAllotment: Number(editData.budgetAllotment || 0),
                            amountOfBill: Number(editData.amountOfBill || 0),
                            totalPreviousBills: Number(editData.totalPreviousBills || 0),
                            grandTotal: Number(editData.grandTotal || 0),
                            stampDuty: Number(editData.stampDuty || 0),
                            gst: Number(editData.gst || 0),
                            incomeTax: Number(editData.incomeTax || 0),
                            laborDuty: Number(editData.laborDuty || 0),
                            amountInWords: editData.amountInWords || null,
                          };

                          const updated = await handleUpdate(selectedBill.id, payload);
                          setSelectedBill(updated);
                          setEditData({
                            ...updated,
                            billDate: updated?.billDate ? String(updated.billDate).split('T')[0] : '',
                          });
                        } catch (err) {
                          // error already shown
                        } finally {
                          setEditSaving(false);
                        }
                      }}
                      disabled={editSaving}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white rounded-lg"
                    >
                      {editSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tax Deductions */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Stamp Duty</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    Rs. {selectedBill.stampDuty?.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400">GST</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    Rs. {selectedBill.gst?.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Income Tax</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    Rs. {selectedBill.incomeTax?.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Labor Duty</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    Rs. {selectedBill.laborDuty?.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Available Balance</div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    Rs. {selectedBill.availableBalance?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Approval Status */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 dark:text-white mb-4">Approval Status</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`p-3 rounded-lg text-center ${
                      selectedBill.medicalSuperintendentApproved
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-slate-50 dark:bg-slate-700/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Medical Superintendent
                    </div>
                    {selectedBill.medicalSuperintendentApproved ? (
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto mt-2" />
                    ) : selectedBill.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(selectedBill.id, 'medical_superintendent')}
                        className="mt-2 px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded"
                      >
                        Approve
                      </button>
                    ) : (
                      <Clock className="w-6 h-6 text-slate-400 mx-auto mt-2" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${
                      selectedBill.executiveDirectorApproved
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-slate-50 dark:bg-slate-700/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Executive Director
                    </div>
                    {selectedBill.executiveDirectorApproved ? (
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto mt-2" />
                    ) : selectedBill.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(selectedBill.id, 'executive_director')}
                        className="mt-2 px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded"
                      >
                        Approve
                      </button>
                    ) : (
                      <Clock className="w-6 h-6 text-slate-400 mx-auto mt-2" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg text-center ${
                      selectedBill.preAuditPassed
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-slate-50 dark:bg-slate-700/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Pre-Audit</div>
                    {selectedBill.preAuditPassed ? (
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto mt-2" />
                    ) : selectedBill.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(selectedBill.id, 'pre_audit')}
                        className="mt-2 px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded"
                      >
                        Pass
                      </button>
                    ) : (
                      <Clock className="w-6 h-6 text-slate-400 mx-auto mt-2" />
                    )}
                  </div>
                </div>
              </div>

              {/* Reject Button */}
              {selectedBill.status === 'Pending' && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const reason = prompt('Enter reason for rejection:');
                      if (reason) {
                        handleReject(selectedBill.id, reason);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  >
                    Reject Bill
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Contingent Bill</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tender Title
                  </label>
                  <input
                    type="text"
                    value={formData.tenderTitle}
                    onChange={(e) => setFormData({ ...formData, tenderTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Object Code (Budget Head)
                  </label>
                  <select
                    value={formData.objectCodeId}
                    onChange={(e) => {
                      const nextId = e.target.value ? Number(e.target.value) : null;
                      const code = objectCodes.find((c) => c.id === nextId);
                      setFormData({
                        ...formData,
                        objectCodeId: nextId,
                        headCode: code?.code || '',
                        headTitle: code?.headOfAccount || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Object Code</option>
                    {objectCodes.map((code) => (
                      <option key={code.id} value={code.id}>
                        {code.code} - {code.headOfAccount}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fiscal Year
                  </label>
                  <select
                    value={formData.fiscalYearId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fiscalYearId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Fiscal Year</option>
                    {fiscalYears.map((fy) => (
                      <option key={fy.id} value={fy.id}>
                        {fy.year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Budget Allotment
                  </label>
                  <input
                    type="number"
                    value={formData.budgetAllotment}
                    onChange={(e) => setFormData({ ...formData, budgetAllotment: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount of Bill
                  </label>
                  <input
                    type="number"
                    value={formData.amountOfBill}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        amountOfBill: amount,
                        grandTotal: amount,
                        amountInWords: numberToWords(Math.floor(amount)) + ' Rupees Only',
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Total Previous Bills
                  </label>
                  <input
                    type="number"
                    value={formData.totalPreviousBills}
                    onChange={(e) => setFormData({ ...formData, totalPreviousBills: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Stamp Duty
                  </label>
                  <input
                    type="number"
                    value={formData.stampDuty}
                    onChange={(e) => setFormData({ ...formData, stampDuty: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    GST
                  </label>
                  <input
                    type="number"
                    value={formData.gst}
                    onChange={(e) => setFormData({ ...formData, gst: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Income Tax
                  </label>
                  <input
                    type="number"
                    value={formData.incomeTax}
                    onChange={(e) => setFormData({ ...formData, incomeTax: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Labor Duty
                  </label>
                  <input
                    type="number"
                    value={formData.laborDuty}
                    onChange={(e) => setFormData({ ...formData, laborDuty: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Grand Total
                  </label>
                  <input
                    type="number"
                    value={formData.grandTotal}
                    onChange={(e) => setFormData({ ...formData, grandTotal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Net Payment (Calculated)
                  </label>
                  <input
                    type="number"
                    value={calculateNetPayment()}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount in Words
                </label>
                <input
                  type="text"
                  value={formData.amountInWords}
                  onChange={(e) => setFormData({ ...formData, amountInWords: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
                >
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
