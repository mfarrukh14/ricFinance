import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, FileText, Search, Edit3, Download, Upload } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SanctionOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [approvedBills, setApprovedBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [objectCodes, setObjectCodes] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const [formData, setFormData] = useState({
    orderType: 'MS',
    fileNo: '',
    orderYear: new Date().getFullYear(),
    orderDate: new Date().toISOString().split('T')[0],
    serialNo: '',
    committeeName: '',
    meetingDate: '',
    ddoCostCenterCode: '',
    ddoCode: '',
    supplierName: '',
    tenderTitle: '',
    billNumber: '',
    billDate: '',
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
    lateDeliveryCharges: 0,
    shelfLife: '',
    riskPurchase: 0,
    otherDeductionName: '',
    otherDeductionAmount: 0,
    netPayment: 0,
    amountInWords: '',
  });

  // Searchable dropdown state (same as Contingent Bills create form)
  const createOcInputRef = useRef(null);
  const createOcContainerRef = useRef(null);
  const [createOcSearch, setCreateOcSearch] = useState('');
  const [createShowDropdown, setCreateShowDropdown] = useState(false);
  const [createFiltered, setCreateFiltered] = useState(objectCodes ?? []);
  const [createHighlighted, setCreateHighlighted] = useState(0);

  const formatOC = (c) => `${c.code} - ${c.headOfAccount}`;

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB');
  };

  useEffect(() => {
    const q = String(createOcSearch || '').trim().toLowerCase();
    if (!q) {
      setCreateFiltered(objectCodes ?? []);
      setCreateHighlighted(0);
      return;
    }
    setCreateFiltered((objectCodes || []).filter((o) => formatOC(o).toLowerCase().includes(q)));
    setCreateHighlighted(0);
  }, [createOcSearch, objectCodes]);

  useEffect(() => {
    function onDocClick(e) {
      if (createOcContainerRef.current && !createOcContainerRef.current.contains(e.target)) setCreateShowDropdown(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [codes, years, bills] = await Promise.all([
          api.getObjectCodes(),
          api.getFiscalYears(),
          api.getContingentBills(),
        ]);
        setObjectCodes(codes);
        setFiscalYears(years);
        const approved = (bills || []).filter((b) => String(b.status || '').toLowerCase() === 'approved');
        setApprovedBills(approved);
        const storedDrafts = JSON.parse(localStorage.getItem('sanctionOrderDrafts') || '[]');
        setOrders(storedDrafts);
      } catch (err) {
        setError(err?.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const calculateNetPayment = () => {
    const gross = parseFloat(formData.grandTotal) || 0;
    const sd = parseFloat(formData.stampDuty) || 0;
    const gst = parseFloat(formData.gst) || 0;
    const it = parseFloat(formData.incomeTax) || 0;
    const pst = parseFloat(formData.laborDuty) || 0;
    const ldc = parseFloat(formData.lateDeliveryCharges) || 0;
    const rp = parseFloat(formData.riskPurchase) || 0;
    const od = parseFloat(formData.otherDeductionAmount) || 0;
    return gross - sd - gst - it - pst - ldc - rp - od;
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    if (num < 0) return `Negative ${numberToWords(-num)}`;

    let words = '';
    if (Math.floor(num / 10000000) > 0) {
      words += `${numberToWords(Math.floor(num / 10000000))} Crore `;
      num %= 10000000;
    }
    if (Math.floor(num / 100000) > 0) {
      words += `${numberToWords(Math.floor(num / 100000))} Lakh `;
      num %= 100000;
    }
    if (Math.floor(num / 1000) > 0) {
      words += `${numberToWords(Math.floor(num / 1000))} Thousand `;
      num %= 1000;
    }
    if (Math.floor(num / 100) > 0) {
      words += `${ones[Math.floor(num / 100)]} Hundred `;
      num %= 100;
    }
    if (num > 0) {
      if (num < 10) words += ones[num];
      else if (num < 20) words += teens[num - 10];
      else {
        words += tens[Math.floor(num / 10)];
        if (num % 10 > 0) words += ` ${ones[num % 10]}`;
      }
    }

    return words.trim();
  };

  const resetForm = () => {
    setFormData({
      orderType: 'MS',
      fileNo: '',
      orderYear: new Date().getFullYear(),
      orderDate: new Date().toISOString().split('T')[0],
      serialNo: '',
      committeeName: '',
      meetingDate: '',
      ddoCostCenterCode: '',
      ddoCode: '',
      supplierName: '',
      tenderTitle: '',
      billNumber: '',
      billDate: '',
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
      lateDeliveryCharges: 0,
      shelfLife: '',
      riskPurchase: 0,
      otherDeductionName: '',
      otherDeductionAmount: 0,
      netPayment: 0,
      amountInWords: '',
    });
    setCreateOcSearch('');
    setCreateShowDropdown(false);
    setSelectedBill(null);
    setEditingOrderId(null);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      objectCodeId: formData.objectCodeId ? Number(formData.objectCodeId) : null,
      fiscalYearId: formData.fiscalYearId ? Number(formData.fiscalYearId) : null,
      netPayment: calculateNetPayment(),
    };
    if (editingOrderId) {
      const next = orders.map((order) =>
        order.id === editingOrderId
          ? {
              ...order,
              ...payload,
              uploadedTypes: order.uploadedTypes || { MS: false, ED: false, BOM: false },
              updatedAt: new Date().toISOString(),
            }
          : order
      );
      setOrders(next);
      localStorage.setItem('sanctionOrderDrafts', JSON.stringify(next));
    } else {
      const draft = {
        id: Date.now(),
        orderNumber: `SO-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'Draft',
        sourceBillId: selectedBill?.id || null,
        sourceBillNumber: selectedBill?.billNumber || null,
        uploadedTypes: { MS: false, ED: false, BOM: false },
        ...payload,
      };
      const next = [draft, ...orders];
      setOrders(next);
      localStorage.setItem('sanctionOrderDrafts', JSON.stringify(next));
    }
    setShowCreateModal(false);
    resetForm();
  };

  const prefillFromBill = (bill) => {
    setSelectedBill(bill);
    setEditingOrderId(null);
    setFormData({
      orderType: 'MS',
      fileNo: '',
      orderYear: new Date().getFullYear(),
      orderDate: new Date().toISOString().split('T')[0],
      serialNo: '',
      committeeName: '',
      meetingDate: '',
      ddoCostCenterCode: '',
      ddoCode: '',
      supplierName: bill?.supplierName || '',
      tenderTitle: bill?.tenderTitle || '',
      billNumber: bill?.billNumber || '',
      billDate: bill?.billDate ? String(bill.billDate).split('T')[0] : '',
      objectCodeId: bill?.objectCodeId ?? null,
      fiscalYearId: bill?.fiscalYearId ?? null,
      headCode: bill?.headCode || '',
      headTitle: bill?.headTitle || '',
      budgetAllotment: bill?.budgetAllotment ?? 0,
      amountOfBill: bill?.amountOfBill ?? 0,
      totalPreviousBills: bill?.totalPreviousBills ?? 0,
      grandTotal: bill?.grandTotal ?? 0,
      stampDuty: bill?.stampDuty ?? 0,
      gst: bill?.gst ?? 0,
      incomeTax: bill?.incomeTax ?? 0,
      laborDuty: bill?.laborDuty ?? 0,
      lateDeliveryCharges: bill?.lateDeliveryCharges ?? 0,
      shelfLife: bill?.shelfLife || '',
      riskPurchase: bill?.riskPurchase ?? 0,
      otherDeductionName: bill?.otherDeductionName || '',
      otherDeductionAmount: bill?.otherDeductionAmount ?? 0,
      netPayment: bill?.netPayment ?? 0,
      amountInWords: bill?.amountInWords || '',
    });
    setCreateOcSearch('');
    setShowCreateModal(true);
  };

  const handleEditDraft = (order) => {
    setEditingOrderId(order.id);
    setSelectedBill(null);
    setFormData({
      orderType: order.orderType || 'MS',
      fileNo: order.fileNo || '',
      orderYear: order.orderYear || new Date().getFullYear(),
      orderDate: order.orderDate || new Date().toISOString().split('T')[0],
      serialNo: order.serialNo || '',
      committeeName: order.committeeName || '',
      meetingDate: order.meetingDate || '',
      ddoCostCenterCode: order.ddoCostCenterCode || '',
      ddoCode: order.ddoCode || '',
      supplierName: order.supplierName || '',
      tenderTitle: order.tenderTitle || '',
      billNumber: order.billNumber || '',
      billDate: order.billDate || '',
      objectCodeId: order.objectCodeId ?? null,
      fiscalYearId: order.fiscalYearId ?? null,
      headCode: order.headCode || '',
      headTitle: order.headTitle || '',
      budgetAllotment: order.budgetAllotment ?? 0,
      amountOfBill: order.amountOfBill ?? 0,
      totalPreviousBills: order.totalPreviousBills ?? 0,
      grandTotal: order.grandTotal ?? 0,
      stampDuty: order.stampDuty ?? 0,
      gst: order.gst ?? 0,
      incomeTax: order.incomeTax ?? 0,
      laborDuty: order.laborDuty ?? 0,
      lateDeliveryCharges: order.lateDeliveryCharges ?? 0,
      shelfLife: order.shelfLife || '',
      riskPurchase: order.riskPurchase ?? 0,
      otherDeductionName: order.otherDeductionName || '',
      otherDeductionAmount: order.otherDeductionAmount ?? 0,
      netPayment: order.netPayment ?? 0,
      amountInWords: order.amountInWords || '',
    });
    setCreateOcSearch('');
    setShowCreateModal(true);
  };

  const buildOrderHtml = (order) => {
    const budgetHead = order?.headTitle || order?.headCode || '';
    const detailHead = order?.headCode || order?.headTitle || '';
    const fiscalYearText = order?.fiscalYearId ? String(order.fiscalYearId) : '';
    const orderNumberLine = `No: RIC/Fin/${order?.fileNo || ''}/${order?.orderYear || ''}`;
    const orderDateLine = `Dated: ${order?.orderDate ? formatDate(order.orderDate) : ''}/${fiscalYearText}`;

    const officeHeader = order?.orderType === 'ED' || order?.orderType === 'BOM'
      ? 'OFFICE OF THE\nEXECUTIVE DIRECTOR RAWALPINDI INSTITUTE OF CARDIOLOGY\nRAWAL ROAD, RAWALPINDI'
      : 'OFFICE OF THE\nMEDICAL SUPERINTENDENT RAWALPINDI INSTITUTE OF CARDIOLOGY\nRAWAL ROAD, RAWALPINDI';

    const signatureTitle = order?.orderType === 'ED' || order?.orderType === 'BOM'
      ? 'Executive Director'
      : 'Medical Superintendent';

    const grantLine = `grant NO. ${order?.objectCode || ''}-Health Services 07-Health-073 Hospital Service 0731-General Hospital Services-073101-General Hospital Services-${order?.ddoCostCenterCode || ''} (DDO Code)`;

    const body = order?.orderType === 'BOM'
      ? `
        <p>
          Sanction is hereby accorded to incur a sum of Rs. ${order?.amountOfBill || 0}/- (${order?.amountInWords || ''}) on account of Drug &amp; Medicine Bill No. ${order?.billNumber || ''} dated ${formatDate(order?.billDate)} to ${order?.supplierName || ''}, in exercise of the power conferred upon board of management at serial # ${order?.serialNo || ''} delegation of Administrative and Financial powers (Schedule -v) of the Punjab Medical and Health Institution Act 2003(Amended 2016).
        </p>
        <p>
          The expenditure has been duly approved in meeting of the Administrative Committee held on dated ${formatDate(order?.meetingDate)}.
        </p>
        <p>
          The expenditure will be debit able under ${grantLine}, Rawalpindi ${order?.ddoCode || ''} (DDO Code) under detail head of ${detailHead} in the current financial year ${fiscalYearText}.
        </p>
      `
      : `
        <p>
          Sanction is hereby accorded to incur a sum of Rs. ${order?.amountOfBill || 0}/- (${order?.amountInWords || ''}) on account of Drug &amp; Medicine Bill No. ${order?.billNumber || ''} dated ${formatDate(order?.billDate)} to ${order?.supplierName || ''}, in exercise of the power conferred upon me vide rule 17 delegation of financial and administrative powers (Schedule -v) of the Punjab Medical and Health Institution Act 2003(Amended 2016). The expenditure are debit able under ${grantLine} under detail head of Account ${detailHead} in the current financial year ${fiscalYearText}.
        </p>
      `;

    return `
      <div style="font-family: Arial, sans-serif; color: #000; padding: 24px;">
        <div style="text-align:center; white-space: pre-line; font-weight: 700; font-size: 12px; margin-bottom: 20px;">
          ${officeHeader}
        </div>
        <div style="display:flex; justify-content:space-between; font-size: 12px; margin-bottom: 16px;">
          <div>${orderNumberLine}</div>
          <div>${orderDateLine}</div>
        </div>
        <div style="text-align:center; font-weight: 700; margin-bottom: 16px;">ORDER</div>
        <div style="font-size: 13px; line-height: 1.6; text-align: justify;">${body}</div>
        <div style="margin-top: 40px; text-align:right;">
          <div style="height: 300px;"></div>
          <div style="font-weight: 600;">${signatureTitle}</div>
          <div>RIC, Rawalpindi</div>
        </div>
        <div style="margin-top: 24px; border-top: 1px solid #000; padding-top: 8px; font-size: 10px;">
          ${order?.orderType === 'ED' ? 'RIC-RWP-FIN.-AO-F-01' : 'RIC-RWP-FIN-AO-F-01'}
        </div>
      </div>
    `;
  };

  const handleTypeChange = (orderId, orderType) => {
    const next = orders.map((order) =>
      order.id === orderId ? { ...order, orderType } : order
    );
    setOrders(next);
    localStorage.setItem('sanctionOrderDrafts', JSON.stringify(next));
  };

  const triggerUpload = (orderId, orderType) => {
    const input = document.getElementById(`upload-${orderId}-${orderType}`);
    if (input) input.click();
  };

  const handleUpload = (orderId, orderType, file) => {
    if (!file) return;
    const next = orders.map((order) => {
      if (order.id !== orderId) return order;
      const uploadedTypes = order.uploadedTypes || { MS: false, ED: false, BOM: false };
      return {
        ...order,
        uploadedTypes: { ...uploadedTypes, [orderType]: true },
      };
    });
    setOrders(next);
    localStorage.setItem('sanctionOrderDrafts', JSON.stringify(next));
  };

  const handleDownload = (order) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildOrderHtml(order);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `${order.orderNumber || 'sanction-order'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(options).from(wrapper).save();
  };

  if (user?.role !== 'AccountOfficer') {
    return <Navigate to="/" replace />;
  }

  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(q) ||
      order.billNumber?.toLowerCase().includes(q) ||
      order.supplierName?.toLowerCase().includes(q) ||
      order.tenderTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sanction Orders</h1>
          <p className="text-slate-600 dark:text-slate-400">Create and manage sanction orders</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Order
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Approved Contingent Bills</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a bill to prefill a sanction order draft
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : approvedBills.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">No approved bills found</p>
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
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {approvedBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {bill.billNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {bill.supplierName || '-'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Rs. {bill.netPayment?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => prefillFromBill(bill)}
                        className="px-3 py-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                      >
                        Create Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">No sanction orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Order Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Source Bill
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Order Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Upload Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {order.sourceBillNumber || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-800 dark:text-slate-200">
                      {order.supplierName || '-'}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Rs. {order.netPayment?.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {order.status || 'Draft'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <select
                        value={order.orderType || 'MS'}
                        onChange={(e) => handleTypeChange(order.id, e.target.value)}
                        className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm"
                      >
                        <option value="MS">M/S</option>
                        <option value="ED">ED</option>
                        <option value="BOM">BOM</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleEditDraft(order)}
                        className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Draft"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(order)}
                        className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors ml-2"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <input
                        id={`upload-${order.id}-${order.orderType || 'MS'}`}
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(order.id, order.orderType || 'MS', e.target.files?.[0])}
                      />
                      <button
                        onClick={() => triggerUpload(order.id, order.orderType || 'MS')}
                        className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-2"
                        title="Upload Signed Copy"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center text-xs text-slate-600 dark:text-slate-300">
                      {(['MS', 'ED', 'BOM']).map((type) => (
                        <span
                          key={type}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full mr-1 mb-1 ${
                            order.uploadedTypes?.[type]
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {type}: {order.uploadedTypes?.[type] ? 'Uploaded' : 'Not'}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Sanction Order</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Order Type
                  </label>
                  <select
                    value={formData.orderType}
                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="MS">M/S Approval</option>
                    <option value="ED">ED Approval</option>
                    <option value="BOM">BOM Approval</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    File No
                  </label>
                  <input
                    type="text"
                    value={formData.fileNo}
                    onChange={(e) => setFormData({ ...formData, fileNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.orderYear}
                    onChange={(e) => setFormData({ ...formData, orderYear: Number(e.target.value) || '' })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {formData.orderType === 'BOM' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Serial No
                    </label>
                    <input
                      type="text"
                      value={formData.serialNo}
                      onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Committee Name
                    </label>
                    <input
                      type="text"
                      value={formData.committeeName}
                      onChange={(e) => setFormData({ ...formData, committeeName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Approval Date
                    </label>
                    <input
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    DDO / Cost Center Code
                  </label>
                  <input
                    type="text"
                    value={formData.ddoCostCenterCode}
                    onChange={(e) => setFormData({ ...formData, ddoCostCenterCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    DDO Code
                  </label>
                  <input
                    type="text"
                    value={formData.ddoCode}
                    onChange={(e) => setFormData({ ...formData, ddoCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Order Type
                  </label>
                  <select
                    value={formData.orderType}
                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="MS">M/S Approval</option>
                    <option value="ED">ED Approval</option>
                    <option value="BOM">BOM Approval</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    File No
                  </label>
                  <input
                    type="text"
                    value={formData.fileNo}
                    onChange={(e) => setFormData({ ...formData, fileNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.orderYear}
                    onChange={(e) => setFormData({ ...formData, orderYear: Number(e.target.value) || '' })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {formData.orderType === 'BOM' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Serial No
                    </label>
                    <input
                      type="text"
                      value={formData.serialNo}
                      onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Committee Name
                    </label>
                    <input
                      type="text"
                      value={formData.committeeName}
                      onChange={(e) => setFormData({ ...formData, committeeName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Meeting Date
                    </label>
                    <input
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
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
                    Bill Number
                  </label>
                  <input
                    type="text"
                    value={formData.billNumber}
                    onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bill Date
                  </label>
                  <input
                    type="date"
                    value={formData.billDate}
                    onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Object Code (Budget Head)
                  </label>
                  <div className="relative" ref={createOcContainerRef}>
                    <input
                      type="text"
                      value={createOcSearch || (formData.objectCodeId ? formatOC(objectCodes.find((c) => c.id === formData.objectCodeId) || {}) : '')}
                      onChange={(e) => {
                        setCreateOcSearch(e.target.value);
                        setCreateShowDropdown(true);
                        setFormData((prev) => ({ ...prev, objectCodeId: null }));
                      }}
                      onFocus={() => setCreateShowDropdown(true)}
                      onKeyDown={(e) => {
                        if (!createShowDropdown) return;
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setCreateHighlighted((h) => Math.min(h + 1, (createFiltered || []).length - 1));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setCreateHighlighted((h) => Math.max(h - 1, 0));
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          const sel = createFiltered[createHighlighted];
                          if (sel) {
                            setFormData((prev) => ({
                              ...prev,
                              objectCodeId: sel.id,
                              headCode: sel.code || prev.headCode,
                              headTitle: sel.headOfAccount || prev.headTitle,
                            }));
                            setCreateOcSearch(formatOC(sel));
                            setCreateShowDropdown(false);
                          }
                        } else if (e.key === 'Escape') {
                          setCreateShowDropdown(false);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="Select Object Code"
                      ref={createOcInputRef}
                    />

                    {createShowDropdown && (createFiltered || []).length > 0 && (
                      <ul className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-auto bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow">
                        {createFiltered.map((code, idx) => (
                          <li
                            key={code.id}
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                objectCodeId: code.id,
                                headCode: code.code || prev.headCode,
                                headTitle: code.headOfAccount || prev.headTitle,
                              }));
                              setCreateOcSearch(formatOC(code));
                              setCreateShowDropdown(false);
                            }}
                            className={`px-3 py-2 cursor-pointer ${idx === createHighlighted ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                          >
                            {formatOC(code)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
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
                        amountInWords: `${numberToWords(Math.floor(amount))} Rupees Only`,
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
                    PST
                  </label>
                  <input
                    type="number"
                    value={formData.laborDuty}
                    onChange={(e) => setFormData({ ...formData, laborDuty: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Late Delivery Charges
                  </label>
                  <input
                    type="number"
                    value={formData.lateDeliveryCharges}
                    onChange={(e) => setFormData({ ...formData, lateDeliveryCharges: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Risk Purchase
                  </label>
                  <input
                    type="number"
                    value={formData.riskPurchase}
                    onChange={(e) => setFormData({ ...formData, riskPurchase: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Shelf Life
                  </label>
                  <input
                    type="text"
                    value={formData.shelfLife}
                    onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Other Deduction Name
                  </label>
                  <input
                    type="text"
                    value={formData.otherDeductionName}
                    onChange={(e) => setFormData({ ...formData, otherDeductionName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Other Deduction Amount
                  </label>
                  <input
                    type="number"
                    value={formData.otherDeductionAmount}
                    onChange={(e) => setFormData({ ...formData, otherDeductionAmount: parseFloat(e.target.value) || 0 })}
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
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
