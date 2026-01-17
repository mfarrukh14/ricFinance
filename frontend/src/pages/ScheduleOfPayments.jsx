import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileSpreadsheet,
  Eye,
  CheckCircle,
  Clock,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function ScheduleOfPayments() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedScheduleIds, setSelectedScheduleIds] = useState([]);

  const [chequeNumberDraft, setChequeNumberDraft] = useState('');
  const [chequeDateDraft, setChequeDateDraft] = useState('');

  const getProp = (obj, camel, pascal) => obj?.[camel] ?? obj?.[pascal];
  const getContingentBill = (s) => getProp(s, 'contingentBill', 'ContingentBill');
  const getScheduleId = (s) => getProp(s, 'id', 'Id');
  const getStatus = (s) => getProp(s, 'status', 'Status');
  const getBillNumber = (s) =>
    getProp(s, 'billNumber', 'BillNumber') ?? getProp(getContingentBill(s), 'billNumber', 'BillNumber');
  const getBillDate = (s) =>
    getProp(s, 'billDate', 'BillDate') ?? getProp(getContingentBill(s), 'billDate', 'BillDate');
  const getSupplierName = (s) =>
    getProp(s, 'supplierName', 'SupplierName') ?? getProp(getContingentBill(s), 'supplierName', 'SupplierName');
  const getHeadCode = (s) =>
    getProp(s, 'headCode', 'HeadCode') ?? getProp(getContingentBill(s), 'headCode', 'HeadCode');
  const getParticulars = (s) => getProp(s, 'particulars', 'Particulars') ?? '';
  const getGrossAmount = (s) => getProp(s, 'grossAmount', 'GrossAmount') ?? 0;
  const getStampDuty = (s) => getProp(s, 'stampDuty', 'StampDuty') ?? 0;
  const getIncomeTax = (s) => getProp(s, 'incomeTax', 'IncomeTax') ?? 0;
  const getGst = (s) => getProp(s, 'gst', 'GST') ?? 0;
  const getPst = (s) => getProp(s, 'pst', 'PST') ?? 0;
  const getNetAmount = (s) => getProp(s, 'netAmount', 'NetAmount') ?? 0;

  const getChequeNumberAndDate = (s) =>
    getProp(s, 'chequeNumberAndDate', 'ChequeNumberAndDate') ?? '';

  const parseChequeNumberAndDate = (value) => {
    // Stored format: "<number>|<yyyy-mm-dd>". If it's something else, treat as number-only.
    if (!value) return { number: '', date: '' };
    const parts = String(value).split('|');
    if (parts.length >= 2) {
      return { number: parts[0] ?? '', date: parts[1] ?? '' };
    }
    return { number: String(value), date: '' };
  };

  const buildChequeNumberAndDate = (number, date) => {
    const n = (number ?? '').trim();
    const d = (date ?? '').trim();
    if (!n && !d) return null;
    return `${n}|${d}`;
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await api.getScheduleOfPayments();
      setSchedules(data);
      setSelectedScheduleIds([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduleSelection = (scheduleId) => {
    setSelectedScheduleIds((prev) =>
      prev.includes(scheduleId) ? prev.filter((id) => id !== scheduleId) : [...prev, scheduleId]
    );
  };

  const handleCreateSheet2 = () => {
    const selected = schedules.filter((s) => selectedScheduleIds.includes(getScheduleId(s)));
    if (selected.length === 0) {
      setError('Please select at least one schedule.');
      return;
    }

    const rows = [];
    rows.push([
      'Bill No',
      'Date',
      'Particulars',
      'Head',
      'Gross Amount',
      'Stamp Duty',
      'Income Tax',
      'GST',
      'PST 15%',
      'Net Amount',
      'Cheque No & Date',
      'Page No',
      'Amount',
    ]);

    const grouped = selected.reduce((acc, item) => {
      const supplier = getSupplierName(item) || 'Unknown Supplier';
      if (!acc[supplier]) acc[supplier] = [];
      acc[supplier].push(item);
      return acc;
    }, {});

    const supplierNames = Object.keys(grouped).sort();
    let grandTotal = 0;

    supplierNames.forEach((supplier) => {
      const items = grouped[supplier].sort((a, b) => {
        const da = new Date(getBillDate(a) || 0).getTime();
        const db = new Date(getBillDate(b) || 0).getTime();
        return da - db;
      });

      let groupTotal = 0;

      items.forEach((item) => {
        const net = Number(getNetAmount(item) || 0);
        groupTotal += net;
        rows.push([
          getBillNumber(item) || '',
          getBillDate(item) ? new Date(getBillDate(item)).toLocaleDateString() : '',
          getParticulars(item) || supplier,
          getHeadCode(item) || '',
          getGrossAmount(item) || 0,
          getStampDuty(item) || 0,
          getIncomeTax(item) || 0,
          getGst(item) || 0,
          getPst(item) || 0,
          net || 0,
          '',
          '',
          '',
        ]);
      });

      const cheque = getChequeNumberAndDate(items[0]) || '';
      rows.push([
        '',
        '',
        supplier,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        cheque,
        '',
        groupTotal,
      ]);

      grandTotal += groupTotal;
    });

    rows.push(['', '', 'TOTAL', '', '', '', '', '', '', '', '', '', grandTotal]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 40 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 14 },
      { wch: 20 },
      { wch: 10 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet2');
    XLSX.writeFile(workbook, 'ScheduleOfPayments_Sheet2.xlsx');
  };

  const handleApprove = async (id, role) => {
    try {
      await api.approveScheduleOfPayment(id, role);
      fetchSchedules();
      if (selectedSchedule?.id === id) {
        const updated = await api.getScheduleOfPayment(id);
        setSelectedSchedule(updated);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateRow = async (id, rowData) => {
    try {
      await api.updateScheduleOfPayment(id, rowData);
      fetchSchedules();
      if (selectedSchedule?.id === id) {
        const updated = await api.getScheduleOfPayment(id);
        setSelectedSchedule(updated);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!showModal || !selectedSchedule) return;
    const { number, date } = parseChequeNumberAndDate(getChequeNumberAndDate(selectedSchedule));
    setChequeNumberDraft(number);
    setChequeDateDraft(date);
  }, [showModal, selectedSchedule]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const status = getStatus(schedule);
    const matchesStatus = filterStatus === 'all' || status?.toLowerCase() === filterStatus;
    const matchesSearch =
      getBillNumber(schedule)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProp(schedule, 'particulars', 'Particulars')?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const approvalRoles = [
    { key: 'accountant', label: 'Accountant', field: 'accountantApproved' },
    { key: 'audit_officer', label: 'Audit Officer', field: 'auditOfficerApproved' },
    { key: 'accounts_officer', label: 'Accounts Officer', field: 'accountsOfficerApproved' },
    { key: 'director_finance', label: 'Director Finance', field: 'directorFinanceApproved' },
  ];

  const roleKeyMap = {
    accountant: 'Accountant',
    audit_officer: 'AuditOfficer',
    accounts_officer: 'AccountOfficer',
    director_finance: 'DirectorFinance',
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Schedule of Payments</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Payment schedules generated from approved contingent bills
          </p>
        </div>
        <button
          onClick={handleCreateSheet2}
          disabled={selectedScheduleIds.length === 0}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white rounded-lg"
        >
          Create Sheet2
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
            placeholder="Search schedules..."
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
        </select>
      </div>

      {/* Schedules Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Select
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Sr. No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Bill Month
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Particulars
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Head
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Gross Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Net Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No payment schedules found
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule, index) => (
                  <tr key={getScheduleId(schedule)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedScheduleIds.includes(getScheduleId(schedule))}
                        onChange={() => toggleScheduleSelection(getScheduleId(schedule))}
                        className="h-4 w-4 text-teal-600 border-slate-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{getProp(schedule, 'billMonth', 'BillMonth')}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {getProp(schedule, 'paymentDate', 'PaymentDate')
                        ? new Date(getProp(schedule, 'paymentDate', 'PaymentDate')).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white max-w-xs truncate">
                      {getProp(schedule, 'particulars', 'Particulars')}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{getHeadCode(schedule) || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-900 dark:text-white">
                      Rs. {getProp(schedule, 'grossAmount', 'GrossAmount')?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-teal-600 dark:text-teal-400">
                      Rs. {getProp(schedule, 'netAmount', 'NetAmount')?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          getStatus(schedule)
                        )}`}
                      >
                        {getStatus(schedule) === 'Approved' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {getStatus(schedule)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowModal(true);
                        }}
                        className="text-teal-600 hover:text-teal-800 dark:text-teal-400"
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

      {/* Detail Modal */}
      {showModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Schedule of Payment
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    From Contingent Bill: {getBillNumber(selectedSchedule)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 dark:border-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-700">
                    <tr>
                      <th className="px-3 py-2 border text-left">Bill Month</th>
                      <th className="px-3 py-2 border text-left">Date</th>
                      <th className="px-3 py-2 border text-left">Particulars</th>
                      <th className="px-3 py-2 border text-left">Head</th>
                      <th className="px-3 py-2 border text-right">Gross Amount</th>
                      <th className="px-3 py-2 border text-right">Stamp Duty</th>
                      <th className="px-3 py-2 border text-right">Income Tax</th>
                      <th className="px-3 py-2 border text-right">GST</th>
                      <th className="px-3 py-2 border text-right">PST 15%</th>
                      <th className="px-3 py-2 border text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border">{getProp(selectedSchedule, 'billMonth', 'BillMonth')}</td>
                      <td className="px-3 py-2 border">
                        {getProp(selectedSchedule, 'paymentDate', 'PaymentDate')
                          ? new Date(getProp(selectedSchedule, 'paymentDate', 'PaymentDate')).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-3 py-2 border">{getProp(selectedSchedule, 'particulars', 'Particulars')}</td>
                      <td className="px-3 py-2 border">{getHeadCode(selectedSchedule) || '-'}</td>
                      <td className="px-3 py-2 border text-right">
                        Rs. {getProp(selectedSchedule, 'grossAmount', 'GrossAmount')?.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border text-right">
                        Rs. {getProp(selectedSchedule, 'stampDuty', 'StampDuty')?.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border text-right">
                        Rs. {getProp(selectedSchedule, 'incomeTax', 'IncomeTax')?.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border text-right">
                        Rs. {getProp(selectedSchedule, 'gst', 'GST')?.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border text-right">
                        Rs. {getProp(selectedSchedule, 'pst', 'PST')?.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border text-right font-medium text-teal-600">
                        Rs. {getProp(selectedSchedule, 'netAmount', 'NetAmount')?.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cheque Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cheque No.
                  </label>
                  {getStatus(selectedSchedule) === 'Pending' ? (
                    <input
                      type="text"
                      value={chequeNumberDraft}
                      onChange={(e) => setChequeNumberDraft(e.target.value)}
                      onBlur={() => {
                        const id = getScheduleId(selectedSchedule);
                        const chequeNumberAndDate = buildChequeNumberAndDate(chequeNumberDraft, chequeDateDraft);
                        handleUpdateRow(id, { chequeNumberAndDate });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-lg font-medium text-slate-900 dark:text-white">
                      {chequeNumberDraft || 'Not assigned'}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Cheque Date
                  </label>
                  {getStatus(selectedSchedule) === 'Pending' ? (
                    <input
                      type="date"
                      value={chequeDateDraft}
                      onChange={(e) => setChequeDateDraft(e.target.value)}
                      onBlur={() => {
                        const id = getScheduleId(selectedSchedule);
                        const chequeNumberAndDate = buildChequeNumberAndDate(chequeNumberDraft, chequeDateDraft);
                        handleUpdateRow(id, { chequeNumberAndDate });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <div className="text-lg font-medium text-slate-900 dark:text-white">
                      {chequeDateDraft ? new Date(chequeDateDraft).toLocaleDateString() : 'Not assigned'}
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Status */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 dark:text-white mb-4">Approval Workflow</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {approvalRoles.map((role, idx) => {
                    const pascalField = role.field.charAt(0).toUpperCase() + role.field.slice(1);
                    const isApproved = getProp(selectedSchedule, role.field, pascalField);
                    const isPending = getStatus(selectedSchedule) === 'Pending';
                    // Check if previous approvals are done (sequential approval)
                    const canApprove =
                      isPending &&
                      (idx === 0 ||
                        approvalRoles.slice(0, idx).every((r) => {
                          const prevPascal = r.field.charAt(0).toUpperCase() + r.field.slice(1);
                          return !!getProp(selectedSchedule, r.field, prevPascal);
                        }));

                    const roleMatches = user?.role === roleKeyMap[role.key];

                    return (
                      <div
                        key={role.key}
                        className={`p-3 rounded-lg text-center ${
                          isApproved
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {role.label}
                        </div>
                        {isApproved ? (
                          <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                        ) : canApprove && roleMatches ? (
                          <button
                            onClick={() => handleApprove(getScheduleId(selectedSchedule), role.key)}
                            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded"
                          >
                            Approve
                          </button>
                        ) : (
                          <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval Progress */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{
                      width: `${
                        (approvalRoles.filter((r) => selectedSchedule[r.field]).length /
                          approvalRoles.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {approvalRoles.filter((r) => {
                    const pascalField = r.field.charAt(0).toUpperCase() + r.field.slice(1);
                    return !!getProp(selectedSchedule, r.field, pascalField);
                  }).length}/{approvalRoles.length}{' '}
                  Approvals
                </span>
              </div>

              {/* Linked Contingent Bill Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Linked Contingent Bill
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">Bill Number:</span>{' '}
                    <span className="text-slate-900 dark:text-white">{getBillNumber(selectedSchedule)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">Supplier:</span>{' '}
                    <span className="text-slate-900 dark:text-white">
                      {selectedSchedule.contingentBill?.supplierName}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400">Tender:</span>{' '}
                    <span className="text-slate-900 dark:text-white">
                      {selectedSchedule.contingentBill?.tenderTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
