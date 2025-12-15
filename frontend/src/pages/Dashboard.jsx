import React,{ useState, useEffect } from 'react';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444'];

function formatCurrency(value) {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} Lac`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} K`;
  }
  return value.toFixed(2);
}

function StatCard({ title, value, icon: Icon, trend, trendValue, color, subtitle }) {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {trendValue}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function BudgetCategoryCard({ title, data, icon: Icon, color }) {
  const percentage = data.utilizationPercentage || 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Budget</span>
          <span className="font-semibold text-slate-800">Rs. {formatCurrency(data.totalBudget)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Expenditure</span>
          <span className="font-semibold text-red-600">Rs. {formatCurrency(data.totalExpenditure)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Remaining</span>
          <span className="font-semibold text-emerald-600">Rs. {formatCurrency(data.remaining)}</span>
        </div>
        
        <div className="pt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Utilization</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-teal-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    loadFiscalYears();
  }, []);

  useEffect(() => {
    if (selectedYear !== null) {
      loadDashboard();
    }
  }, [selectedYear]);

  const loadFiscalYears = async () => {
    try {
      const years = await api.getFiscalYears();
      setFiscalYears(years);
      const current = years.find((y) => y.isCurrent);
      if (current) {
        setSelectedYear(current.id);
      } else if (years.length > 0) {
        setSelectedYear(years[0].id);
      }
    } catch (error) {
      console.error('Failed to load fiscal years:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary(selectedYear);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const pieData = summary
    ? [
        { name: 'AAA Budget', value: summary.aaaBudget?.totalBudget || 0 },
        { name: 'PLA Budget', value: summary.plaBudget?.totalBudget || 0 },
        { name: 'UHI Budget', value: summary.uhiBudget?.totalBudget || 0 },
      ]
    : [];

  const barData = summary?.topExpenditures || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Financial overview for {summary?.fiscalYear || 'current fiscal year'}
          </p>
        </div>
        
        <select
          value={selectedYear || ''}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium"
        >
          {fiscalYears.map((fy) => (
            <option key={fy.id} value={fy.id}>
              FY {fy.year} {fy.isCurrent && '(Current)'}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Budget"
          value={`Rs. ${formatCurrency(summary?.totalBudgetAllocated || 0)}`}
          icon={Wallet}
          color="from-teal-500 to-teal-600"
          subtitle="Consolidated allocation"
        />
        <StatCard
          title="Total Expenditure"
          value={`Rs. ${formatCurrency(summary?.totalExpenditure || 0)}`}
          icon={CreditCard}
          color="from-blue-500 to-blue-600"
          trend={summary?.utilizationPercentage > 50 ? 'up' : 'down'}
          trendValue={summary?.utilizationPercentage?.toFixed(1)}
        />
        <StatCard
          title="Remaining Budget"
          value={`Rs. ${formatCurrency(summary?.totalRemaining || 0)}`}
          icon={DollarSign}
          color="from-emerald-500 to-emerald-600"
          subtitle="Available for utilization"
        />
        <StatCard
          title="Utilization Rate"
          value={`${summary?.utilizationPercentage?.toFixed(1) || 0}%`}
          icon={PieChart}
          color="from-purple-500 to-purple-600"
          subtitle="Budget utilized"
        />
      </div>

      {/* Budget Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BudgetCategoryCard
          title="Non-Development (AAA)"
          data={summary?.aaaBudget || {}}
          icon={Building2}
          color="bg-gradient-to-br from-teal-500 to-teal-600"
        />
        <BudgetCategoryCard
          title="PLA Budget"
          data={summary?.plaBudget || {}}
          icon={Wallet}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <BudgetCategoryCard
          title="UHI Budget"
          data={summary?.uhiBudget || {}}
          icon={CreditCard}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Distribution Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-teal-500" />
            Budget Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `Rs. ${formatCurrency(value)}`}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Legend />
            </RechartPieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Expenditures Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Top Expenditures
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis dataKey="objectCode" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => `Rs. ${formatCurrency(value)}`}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="expenditure" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Expenditures Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Top Budget Heads by Expenditure</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Object Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Head of Account
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Expenditure
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summary?.topExpenditures?.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.objectCode}</td>
                  <td className="px-6 py-4 text-slate-600">{item.headOfAccount}</td>
                  <td className="px-6 py-4 text-right text-slate-800">Rs. {formatCurrency(item.budget)}</td>
                  <td className="px-6 py-4 text-right text-red-600 font-medium">
                    Rs. {formatCurrency(item.expenditure)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        item.utilizationPercentage > 90
                          ? 'bg-red-100 text-red-700'
                          : item.utilizationPercentage > 70
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.utilizationPercentage?.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {(!summary?.topExpenditures || summary.topExpenditures.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No expenditure data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
