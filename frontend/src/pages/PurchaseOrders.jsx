import React, { useState, useEffect } from 'react';
import { Search, FileText, Filter, Eye, Package, Building2, Hash, Calendar, DollarSign } from 'lucide-react';

const EPROC_API_URL = 'http://localhost:6100';

export default function PurchaseOrders() {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedPO, setSelectedPO] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchPurchaseOrders();
    }, [pagination.page, statusFilter]);

    const fetchPurchaseOrders = async () => {
        try {
            setLoading(true);
            
            let url = `${EPROC_API_URL}/api/purchase-orders/public?page=${pagination.page}&limit=${pagination.limit}`;
            if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
            if (statusFilter) url += `&status=${statusFilter}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch purchase orders');
            
            const data = await response.json();
            setPurchaseOrders(data.purchaseOrders || []);
            setPagination(prev => ({
                ...prev,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0
            }));
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchPurchaseOrders();
    };

    const openModal = (po) => {
        setSelectedPO(po);
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(amount || 0).replace('PKR', 'Rs');
    };

    const getStatusClasses = (status) => {
        const classes = {
            'created': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            'sent': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'acknowledged': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'fulfilled': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            'cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        return classes[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        Purchase Orders
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        View and track all purchase orders from eProcurement
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by PO number, tender, or supplier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                            <option value="">All Statuses</option>
                            <option value="created">Created</option>
                            <option value="sent">Sent</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="fulfilled">Fulfilled</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400">Loading purchase orders...</p>
                    </div>
                ) : purchaseOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No purchase orders found</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">PO Number</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tender</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supplier</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {purchaseOrders.map((po) => (
                                        <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-4 h-4 text-indigo-500" />
                                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{po.po_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{po.tender_number}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{po.tender_item_name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">{po.supplier_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(po.total_amount)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getStatusClasses(po.status)}`}>
                                                    {po.status?.charAt(0).toUpperCase() + po.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(po.created_at).split(',')[0]}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => openModal(po)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page <= 1}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* PO Details Modal */}
            {showModal && selectedPO && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Purchase Order Details</h2>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400">{selectedPO.po_number}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 mt-1 rounded-lg text-sm font-medium border ${getStatusClasses(selectedPO.status)}`}>
                                        {selectedPO.status?.charAt(0).toUpperCase() + selectedPO.status?.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Amount</p>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                        {formatCurrency(selectedPO.total_amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tender</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{selectedPO.tender_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supplier</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{selectedPO.supplier_name}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-indigo-500" />
                                    Order Items
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-100 dark:bg-slate-800">
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Item</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Unit Price</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {(selectedPO.items || []).map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.itemName}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 text-right">{formatCurrency(item.unitPrice)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 text-right">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 text-right">
                                                        {formatCurrency(item.quantity * item.unitPrice)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    Timeline
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Created</span>
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatDate(selectedPO.created_at)}</span>
                                    </div>
                                    {selectedPO.sent_at && (
                                        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                            <span className="text-sm text-blue-600 dark:text-blue-400">Sent</span>
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatDate(selectedPO.sent_at)}</span>
                                        </div>
                                    )}
                                    {selectedPO.acknowledged_at && (
                                        <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                                            <span className="text-sm text-purple-600 dark:text-purple-400">Acknowledged</span>
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatDate(selectedPO.acknowledged_at)}</span>
                                        </div>
                                    )}
                                    {selectedPO.fulfilled_at && (
                                        <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                            <span className="text-sm text-emerald-600 dark:text-emerald-400">Fulfilled</span>
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{formatDate(selectedPO.fulfilled_at)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedPO.remarks && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-2">Remarks</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        {selectedPO.remarks}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
