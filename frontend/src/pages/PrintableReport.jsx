import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';

export default function PrintableReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBillData();
  }, [id]);

  const loadBillData = async () => {
    try {
      const [billData, historyData] = await Promise.all([
        api.getBillDetails(id),
        api.getBillHistory(id),
      ]);
      setBill(billData);
      setHistory(historyData || []);
    } catch (err) {
      setError(err.message || 'Failed to load bill');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Bill not found'}</p>
          <button
            onClick={() => navigate('/desk')}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg"
          >
            Back to Desk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 print:bg-white">
      <div className="print:hidden sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
        <button
          onClick={() => navigate('/desk')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Desk
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          <Printer className="w-5 h-5" />
          Print Report
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg print:shadow-none print:rounded-none">
          <div className="p-8 border-b-2 border-slate-200 dark:border-slate-700 print:border-black">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 print:text-black">
                  CONTINGENT BILL REPORT
                </h1>
                <p className="text-slate-500 dark:text-slate-400 print:text-gray-600 mt-1">
                  RIC Finance Management System
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-teal-600 print:text-black">{bill.billNumber}</p>
                <p className="text-sm text-slate-500 print:text-gray-600">
                  Date: {new Date(bill.billDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {bill.status === 'Approved' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 print:bg-white border-b border-green-200 dark:border-green-800 print:border-black">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 print:text-black">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-semibold">APPROVED BY DIRECTOR FINANCE</span>
              </div>
            </div>
          )}

          <div className="p-8">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 print:text-black mb-4 border-b pb-2">
              Bill Details
            </h2>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <div>
                <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">PO Number</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">{bill.poNumber || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">SO Number</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">{bill.soNumber || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Supplier Name</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">{bill.supplierName || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Letter of Award</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">{bill.letterOfAwardNumber || '-'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Tender Title</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">{bill.tenderTitle || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Object Code</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">
                  {bill.objectCode?.code || bill.headCode || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Head of Account</label>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">
                  {bill.objectCode?.headOfAccount || bill.headTitle || '-'}
                </p>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 print:text-black mb-4 border-b pb-2">
              Financial Details
            </h2>

            <div className="bg-slate-50 dark:bg-slate-800/50 print:bg-gray-100 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Budget Allotment</label>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    Rs. {bill.budgetAllotment?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Amount of Bill</label>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    Rs. {bill.amountOfBill?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Previous Bills Total</label>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    Rs. {bill.totalPreviousBills?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 print:text-gray-500 uppercase">Grand Total</label>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                    Rs. {bill.grandTotal?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 print:border-gray-300">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 print:text-black mb-3">Deductions</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 print:text-gray-500">Stamp Duty</label>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">
                      Rs. {bill.stampDuty?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 print:text-gray-500">GST</label>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">
                      Rs. {bill.gst?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 print:text-gray-500">Income Tax</label>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">
                      Rs. {bill.incomeTax?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 print:text-gray-500">Labor Duty</label>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 print:text-black">
                      Rs. {bill.laborDuty?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-teal-500 print:border-black">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-800 dark:text-slate-200 print:text-black">Net Payment</span>
                  <span className="text-2xl font-bold text-teal-600 print:text-black">
                    Rs. {bill.netPayment?.toLocaleString()}
                  </span>
                </div>
                {bill.amountInWords && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 print:text-gray-600 mt-2 italic">
                    ({bill.amountInWords})
                  </p>
                )}
              </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 print:text-black mb-4 border-b pb-2">
              Approval Chain
            </h2>

            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 print:text-gray-500">No approval history available</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 print:bg-gray-100 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 print:bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 print:text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 print:text-black">
                          {item.step}
                        </p>
                        <p className="text-xs text-slate-500 print:text-gray-500">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 print:text-gray-600">
                        By: {item.by}
                      </p>
                      {item.remarks && (
                        <p className="text-sm text-slate-500 print:text-gray-500 mt-1 italic">
                          Remarks: "{item.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-12 pt-8 border-t-2 border-slate-200 dark:border-slate-700 print:border-black print:mt-8">
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="h-16 border-b border-slate-300 print:border-black mb-2"></div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 print:text-black">Prepared By</p>
                  <p className="text-xs text-slate-500 print:text-gray-500">Computer Operator</p>
                </div>
                <div className="text-center">
                  <div className="h-16 border-b border-slate-300 print:border-black mb-2"></div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 print:text-black">Verified By</p>
                  <p className="text-xs text-slate-500 print:text-gray-500">Accountant</p>
                </div>
                <div className="text-center">
                  <div className="h-16 border-b border-slate-300 print:border-black mb-2"></div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 print:text-black">Approved By</p>
                  <p className="text-xs text-slate-500 print:text-gray-500">Director Finance</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 print:border-gray-300 text-center">
              <p className="text-xs text-slate-500 print:text-gray-500">
                Generated on {new Date().toLocaleString()} • RIC Finance Management System
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
