import React from 'react';
import { Wallet, BarChart3, Clock, Receipt, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart as RechartPieChart, Pie, Legend, AreaChart, Area,
} from 'recharts';
import { BudgetCard, RadialProgress } from './BudgetCard';
import { CustomTooltip } from './CustomTooltip';
import { formatCurrency, formatDate, getUtilizationLevel } from './utils';

export default function UHISection({ budgetEntry, expenseHistory }) {
  if (!budgetEntry) return null;

  const uhiBudgetAllocated = budgetEntry.uhiBudgetAllocated ?? 0;
  const uhiReApp = budgetEntry.uhiReApp ?? 0;
  const uhiTotalBudget = budgetEntry.uhiTotalBudget ?? 0;
  const uhiExp = budgetEntry.uhiExpenditure ?? 0;
  const uhiRemaining = budgetEntry.uhiRemainingBudget ?? 0;
  const uhiUtil = uhiTotalBudget > 0 ? (uhiExp / uhiTotalBudget) * 100 : 0;

  const uhiExpenses = expenseHistory.filter(e => e.budgetType === 'UHI');

  // Budget breakdown
  const budgetBreakdownData = [
    { name: 'Allocated', value: uhiBudgetAllocated, fill: '#10b981' },
    { name: 'Re-App', value: uhiReApp, fill: '#14b8a6' },
    { name: 'Total', value: uhiTotalBudget, fill: '#06d6a0' },
  ];

  // Spent vs Remaining pie
  const spentRemainingData = [
    { name: 'Spent', value: uhiExp, fill: '#ef4444' },
    { name: 'Remaining', value: uhiRemaining > 0 ? uhiRemaining : 0, fill: '#10b981' },
  ];

  // Comparison bar
  const comparisonData = [
    { name: 'Budget', value: uhiTotalBudget },
    { name: 'Spent', value: uhiExp },
    { name: 'Remaining', value: uhiRemaining > 0 ? uhiRemaining : 0 },
  ];

  // Cumulative expenses
  const sortedExpenses = [...uhiExpenses].sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate));
  let cumulative = 0;
  const cumulativeData = sortedExpenses.map((exp) => {
    cumulative += exp.amount;
    return { date: formatDate(exp.expenseDate), amount: exp.amount, cumulative };
  });

  const level = getUtilizationLevel(uhiUtil);

  return (
    <div className="space-y-6">
      {/* Main Budget Card */}
      <BudgetCard
        title="UHI Budget"
        icon={Wallet}
        gradient="from-emerald-500 to-teal-600"
        budget={uhiTotalBudget}
        expenditure={uhiExp}
        remaining={uhiRemaining}
        utilizationPct={uhiUtil}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Budget Allocated</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(uhiBudgetAllocated)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-teal-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Re-Appropriation</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(uhiReApp)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-cyan-600 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-medium">Total UHI Budget</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(uhiTotalBudget)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" /> Budget vs Expenditure
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
                <Cell fill="#06b6d4" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-500" /> Utilization
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartPieChart>
              <Pie data={spentRemainingData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {spentRemainingData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RechartPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Trend */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" /> Expenditure Trend
        </h3>
        {cumulativeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="uhiExpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={11} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={3} fill="url(#uhiExpGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-400">No expense data</div>
        )}
      </div>

      {/* Expense History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" /> UHI Expense History
        </h3>
        {uhiExpenses.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {uhiExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500 text-white font-bold text-sm">UHI</div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100 text-sm">{exp.expenseName}</p>
                    <p className="text-xs text-slate-500">{formatDate(exp.expenseDate)}</p>
                  </div>
                </div>
                <span className="font-bold text-red-600">-Rs. {formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No UHI expenses recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}
