import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  CreditCard,
  Eye,
  CheckCircle,
  Clock,
  Send,
  Download,
  Search,
  Building2,
} from 'lucide-react';

export default function AsaanCheques() {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCheque, setSelectedCheque] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCheques();
  }, []);

  const fetchCheques = async () => {
    try {
      setLoading(true);
      const data = await api.getAsaanCheques();
      setCheques(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, role) => {
    try {
      await api.approveAsaanCheque(id, role);
      fetchCheques();
      if (selectedCheque?.id === id) {
        const updated = await api.getAsaanCheque(id);
        setSelectedCheque(updated);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForward = async (id) => {
    try {
      await api.forwardAsaanCheque(id);
      fetchCheques();
      if (selectedCheque?.id === id) {
        const updated = await api.getAsaanCheque(id);
        setSelectedCheque(updated);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await api.updateAsaanCheque(id, data);
      fetchCheques();
      if (selectedCheque?.id === id) {
        const updated = await api.getAsaanCheque(id);
        setSelectedCheque(updated);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'forwarded':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      case 'forwarded':
        return <Send className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const filteredCheques = cheques.filter((cheque) => {
    const matchesStatus = filterStatus === 'all' || cheque.status?.toLowerCase() === filterStatus;
    const matchesSearch =
      cheque.chequeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.payeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cheque.asaanAccountTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Asaan Assignment Account Cheques
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Cheque schedules generated from approved payment schedules
        </p>
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
            placeholder="Search cheques..."
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
          <option value="forwarded">Forwarded to Bank</option>
        </select>
      </div>

      {/* Cheques Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Sr. No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Cheque No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Payee Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Account
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Amount
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
              {filteredCheques.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No cheques found
                  </td>
                </tr>
              ) : (
                filteredCheques.map((cheque, index) => (
                  <tr key={cheque.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {cheque.chequeNumber || 'Not assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {cheque.chequeDate
                        ? new Date(cheque.chequeDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {cheque.payeeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {cheque.asaanAccountTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-teal-600 dark:text-teal-400">
                      Rs. {cheque.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          cheque.status
                        )}`}
                      >
                        {getStatusIcon(cheque.status)}
                        {cheque.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedCheque(cheque);
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
      {showModal && selectedCheque && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Schedule of Asaan Assignment Account Cheques
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sr. No: {selectedCheque.serialNumber} | Date:{' '}
                    {new Date(selectedCheque.createdAt).toLocaleDateString()}
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
              {/* DDO & Account Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Name of DDO & Department
                    </label>
                    {selectedCheque.status === 'Pending' ? (
                      <input
                        type="text"
                        defaultValue={selectedCheque.ddoName}
                        onBlur={(e) =>
                          handleUpdate(selectedCheque.id, { ddoName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-medium text-slate-900 dark:text-white">
                        {selectedCheque.ddoName}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Cost Centre
                    </label>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {selectedCheque.costCentre}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Sub-Detailed Function
                    </label>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {selectedCheque.subDetailedFunction}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Asaan Assignment A/C Title & No.
                    </label>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {selectedCheque.asaanAccountTitle}
                      <br />
                      <span className="text-sm text-slate-500">{selectedCheque.asaanAccountNumber}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Project Description
                    </label>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {selectedCheque.projectDescription}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Grant No.
                    </label>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {selectedCheque.grantNumber}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cheque Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 dark:border-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-700">
                    <tr>
                      <th className="px-3 py-2 border text-left">Sr. No.</th>
                      <th className="px-3 py-2 border text-left">Cheque No.</th>
                      <th className="px-3 py-2 border text-left">Date</th>
                      <th className="px-3 py-2 border text-left">Payee's Name</th>
                      <th className="px-3 py-2 border text-right">Amount (Rs.)</th>
                      <th className="px-3 py-2 border text-left">Detail of Object Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border">{selectedCheque.serialNumber}</td>
                      <td className="px-3 py-2 border">
                        {selectedCheque.status === 'Pending' ? (
                          <input
                            type="text"
                            defaultValue={selectedCheque.chequeNumber}
                            onBlur={(e) =>
                              handleUpdate(selectedCheque.id, { chequeNumber: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        ) : (
                          selectedCheque.chequeNumber
                        )}
                      </td>
                      <td className="px-3 py-2 border">
                        {selectedCheque.status === 'Pending' ? (
                          <input
                            type="date"
                            defaultValue={selectedCheque.chequeDate?.split('T')[0]}
                            onBlur={(e) =>
                              handleUpdate(selectedCheque.id, { chequeDate: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        ) : selectedCheque.chequeDate ? (
                          new Date(selectedCheque.chequeDate).toLocaleDateString()
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-2 border">{selectedCheque.payeeName}</td>
                      <td className="px-3 py-2 border text-right font-medium text-teal-600">
                        Rs. {selectedCheque.amount?.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 border">{selectedCheque.objectCodeDetail}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Certificate */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  "Certified that expenditure mentioned above have been sanctioned as per procedure and 
                  incurred according to the financial discipline and are charged to the relevant object 
                  code of the grant for the year {new Date().getFullYear()}-{new Date().getFullYear() + 1}"
                </p>
              </div>

              {/* Approval Status */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 dark:text-white mb-4">Signatures</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg text-center ${
                      selectedCheque.directorFinanceApproved
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Director Finance
                    </div>
                    {selectedCheque.directorFinanceApproved ? (
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    ) : selectedCheque.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(selectedCheque.id, 'director_finance')}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded"
                      >
                        Sign & Approve
                      </button>
                    ) : (
                      <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-lg text-center ${
                      selectedCheque.executiveDirectorApproved
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Executive Director
                    </div>
                    {selectedCheque.executiveDirectorApproved ? (
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    ) : selectedCheque.directorFinanceApproved && selectedCheque.status === 'Pending' ? (
                      <button
                        onClick={() => handleApprove(selectedCheque.id, 'executive_director')}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded"
                      >
                        Sign & Approve
                      </button>
                    ) : (
                      <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Forwarding */}
              {selectedCheque.status === 'Approved' && !selectedCheque.forwardedToBank && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300">
                        Forward to Bank
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Cheque is approved. Forward to Manager NBP for processing.
                      </p>
                    </div>
                    <button
                      onClick={() => handleForward(selectedCheque.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      <Building2 className="w-4 h-4" />
                      Forward to NBP
                    </button>
                  </div>
                </div>
              )}

              {selectedCheque.forwardedToBank && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-300">
                        Forwarded to Bank
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Forwarded to Manager NBP on{' '}
                        {new Date(selectedCheque.forwardedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Linked Schedule of Payment Info */}
              <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Linked Schedule of Payment
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Bill Number:</span>{' '}
                    <span className="text-slate-900 dark:text-white">
                      {selectedCheque.scheduleOfPayment?.billNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Gross Amount:</span>{' '}
                    <span className="text-slate-900 dark:text-white">
                      Rs. {selectedCheque.scheduleOfPayment?.grossAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Net Amount:</span>{' '}
                    <span className="text-teal-600 dark:text-teal-400 font-medium">
                      Rs. {selectedCheque.scheduleOfPayment?.netAmount?.toLocaleString()}
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
