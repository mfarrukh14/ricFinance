import React from 'react';
import { Wallet, BarChart3, Clock, Receipt, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart as RechartPieChart, Pie, Legend, AreaChart, Area,
} from 'recharts';
import { BudgetCard, RadialProgress } from './BudgetCard';
import { CustomTooltip } from './CustomTooltip';
import { formatCurrency, formatDate, getUtilizationLevel } from './utils';

export default function PLASection({ budgetEntry, expenseHistory }) {
  if (!budgetEntry) return null;

  const plaBudgetAllocated = budgetEntry.plaBudgetAllocated ?? 0;
  const plaReApp = budgetEntry.plaReApp ?? 0;
  const plaTotalBudget = budgetEntry.plaTotalBudget ?? 0;
  const plaExp = budgetEntry.plaExpenditure ?? 0;
  const plaRemaining = budgetEntry.plaRemainingBudget ?? 0;
  const plaUtil = plaTotalBudget > 0 ? (plaExp / plaTotalBudget) * 100 : 0;

  const plaExpenses = expenseHistory.filter(e => e.budgetType === 'PLA');

  // Budget breakdown
  const budgetBreakdownData = [
    { name: 'Allocated', value: plaBudgetAllocated, fill: '#3b82f6' },
    { name: 'Re-App', value: plaReApp, fill: '#8b5cf6' },
    { name: 'Total', value: plaTotalBudget, fill: '#06b6d4' },
  ];

  // Spent vs Remaining pie
  const spentRemainingData = [
    { name: 'Spent', value: plaExp, fill: '#ef4444' },
    { name: 'Remaining', value: plaRemaining > 0 ? plaRemaining : 0, fill: '#3b82f6' },
  ];

  // Comparison bar
  const comparisonData = [
    { name: 'Budget', value: plaTotalBudget },
    { name: 'Spent', value: plaExp },
    { name: 'Remaining', value: plaRemaining > 0 ? plaRemaining : 0 },
  ];

  // Cumulative expenses
  const sortedExpenses = [...plaExpenses].sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate));
  let cumulative = 0;
  const cumulativeData = sortedExpenses.map((exp) => {
    cumulative += exp.amount;
    return { date: formatDate(exp.expenseDate), amount: exp.amount, cumulative };
  });

  const level = getUtilizationLevel(plaUtil);

  return (
    <div className="space-y-6">
      {/* Main Budget Card */}
      <BudgetCard
        title="PLA Budget"
        icon={Wallet}
        gradient="from-blue-500 to-indigo-600"
        budget={plaTotalBudget}
        expenditure={plaExp}
        remaining={plaRemaining}
        utilizationPct={plaUtil}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Budget Allocated</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(plaBudgetAllocated)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Re-Appropriation</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(plaReApp)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-cyan-600 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-medium">Total PLA Budget</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(plaTotalBudget)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Budget vs Expenditure
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                <Cell fill="#3b82f6" />
                <Cell fill="#ef4444" />
                <Cell fill="#10b981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-500" /> Utilization
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
          <TrendingUp className="w-5 h-5 text-blue-500" /> Expenditure Trend
        </h3>
        {cumulativeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="plaExpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={11} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={3} fill="url(#plaExpGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-400">No expense data</div>
        )}
      </div>

      {/* Expense History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" /> PLA Expense History
        </h3>
        {plaExpenses.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {plaExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500 text-white font-bold text-sm">PLA</div>
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
            <p>No PLA expenses recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}
