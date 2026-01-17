import React from 'react';
import { Building2, Banknote, BarChart3, Clock, Receipt, DollarSign, TrendingUp, Layers } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ComposedChart, Line, PieChart as RechartPieChart, Pie, Legend, AreaChart, Area,
} from 'recharts';
import { BudgetCard, RadialProgress } from './BudgetCard';
import { CustomTooltip } from './CustomTooltip';
import { formatCurrency, formatDate, getUtilizationLevel, COLORS } from './utils';

export default function AAASection({ budgetEntry, expenseHistory }) {
  if (!budgetEntry) return null;

  // Main budget figures
  const totalAllocated = budgetEntry.totalBudgetAllocation ?? 0;
  const totalAAABudget = budgetEntry.totalAAABudget ?? 0;
  const aaaExp = budgetEntry.aaaExpenditure ?? 0;
  const aaaRemaining = budgetEntry.aaaRemainingBudget ?? 0;
  const aaaUtil = totalAAABudget > 0 ? (aaaExp / totalAAABudget) * 100 : 0;

  // Development budget figures
  const devAllocated = budgetEntry.developmentBudgetAllocated ?? 0;
  const devReApp = budgetEntry.developmentReApp ?? 0;
  const devTotal = budgetEntry.developmentTotalBudget ?? 0;
  const devExp = budgetEntry.developmentExpenditure ?? 0;
  const devRemaining = budgetEntry.developmentRemainingBudget ?? 0;
  const devUtil = devTotal > 0 ? (devExp / devTotal) * 100 : 0;

  // Release amounts
  const firstReleased = budgetEntry.firstReleased ?? 0;
  const secondReleased = budgetEntry.secondReleased ?? 0;
  const thirdReleased = budgetEntry.thirdReleased ?? 0;
  const fourthReleased = budgetEntry.fourthReleased ?? 0;
  const supplementary = budgetEntry.supplementaryBudget ?? 0;
  const sumOfReleased = budgetEntry.sumOfReleased ?? 0;
  const aaaReApp = budgetEntry.aaaReApp ?? 0;
  const budgetWithheld = budgetEntry.budgetWithheldLapse ?? 0;

  // Filter AAA expenses
  const aaaExpenses = expenseHistory.filter(e => e.budgetType === 'AAA');
  const devExpenses = expenseHistory.filter(e => e.budgetType === 'DEV');

  // Release breakdown data
  const releasesData = [
    { name: '1st Release', value: firstReleased, fill: COLORS[0] },
    { name: '2nd Release', value: secondReleased, fill: COLORS[1] },
    { name: '3rd Release', value: thirdReleased, fill: COLORS[2] },
    { name: '4th Release', value: fourthReleased, fill: COLORS[3] },
    { name: 'Supplementary', value: supplementary, fill: COLORS[4] },
  ];

  // Budget overview data
  const budgetOverviewData = [
    { name: 'Allocated', value: totalAllocated, fill: '#8b5cf6' },
    { name: 'Total AAA', value: totalAAABudget, fill: '#14b8a6' },
    { name: 'Released', value: sumOfReleased, fill: '#3b82f6' },
    { name: 'Spent', value: aaaExp, fill: '#ef4444' },
    { name: 'Remaining', value: aaaRemaining > 0 ? aaaRemaining : 0, fill: '#10b981' },
  ];

  // Allocation vs Released comparison
  const allocationData = [
    { name: 'Budget Allocated', allocated: totalAllocated, released: 0 },
    { name: 'Sum Released', allocated: 0, released: sumOfReleased },
    { name: 'Re-Appropriation', allocated: 0, released: aaaReApp },
    { name: 'Withheld/Lapse', allocated: 0, released: budgetWithheld },
  ];

  // Per-release utilization (simplified calculation)
  const totalReleased = firstReleased + secondReleased + thirdReleased + fourthReleased + supplementary;
  const expPerRelease = totalReleased > 0 ? aaaExp / 5 : 0; // Simplified equal distribution

  const releaseUtilizationData = [
    { name: '1st', budget: firstReleased, spent: Math.min(expPerRelease, firstReleased), remaining: Math.max(firstReleased - expPerRelease, 0) },
    { name: '2nd', budget: secondReleased, spent: Math.min(expPerRelease, secondReleased), remaining: Math.max(secondReleased - expPerRelease, 0) },
    { name: '3rd', budget: thirdReleased, spent: Math.min(expPerRelease, thirdReleased), remaining: Math.max(thirdReleased - expPerRelease, 0) },
    { name: '4th', budget: fourthReleased, spent: Math.min(expPerRelease, fourthReleased), remaining: Math.max(fourthReleased - expPerRelease, 0) },
    { name: 'Supp.', budget: supplementary, spent: Math.min(expPerRelease, supplementary), remaining: Math.max(supplementary - expPerRelease, 0) },
  ];

  // Cumulative expense trend for AAA
  const sortedExpenses = [...aaaExpenses].sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate));
  let cumulative = 0;
  const cumulativeData = sortedExpenses.map((exp) => {
    cumulative += exp.amount;
    return { date: formatDate(exp.expenseDate), amount: exp.amount, cumulative };
  });

  const level = getUtilizationLevel(aaaUtil);

  return (
    <div className="space-y-6">
      {/* Main Budget Card */}
      <BudgetCard
        title="Non-Development Budget (AAA)"
        icon={Building2}
        gradient="from-teal-500 to-emerald-600"
        budget={totalAAABudget}
        expenditure={aaaExp}
        remaining={aaaRemaining}
        utilizationPct={aaaUtil}
      />

      <BudgetCard
        title="Development Budget (AAA)"
        icon={Layers}
        gradient="from-emerald-500 to-lime-600"
        budget={devTotal}
        expenditure={devExp}
        remaining={devRemaining}
        utilizationPct={devUtil}
      />

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Total Allocated</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(totalAllocated)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-medium">Sum of Released</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(sumOfReleased)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-teal-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Re-Appropriation</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(aaaReApp)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Banknote className="w-4 h-4" />
            <span className="text-xs font-medium">Withheld/Lapse</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(budgetWithheld)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Dev Allocated</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(devAllocated)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Dev Re-Appropriation</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(devReApp)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Dev Budget</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(devTotal)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Dev Remaining</span>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(devRemaining)}</p>
        </div>
      </div>

      {/* Charts Row 1: Budget Overview & Release Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" /> Budget Overview
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgetOverviewData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {budgetOverviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-teal-500" /> Release Breakdown
          </h3>
          {releasesData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={releasesData}>
                <defs>
                  {releasesData.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`aaaGrad${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {releasesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#aaaGrad${index})`} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">No release data</div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Release Utilization & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Release-wise Utilization
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={releaseUtilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="remaining" name="Remaining" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" /> Expenditure Trend
          </h3>
          {cumulativeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="aaaExpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={11} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cumulative" stroke="#14b8a6" strokeWidth={3} fill="url(#aaaExpGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No expense history yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-500" /> AAA Expense History
        </h3>
        {aaaExpenses.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {aaaExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-500 text-white font-bold text-sm">AAA</div>
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
            <p>No AAA expenses recorded</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" /> Development Expense History
        </h3>
        {devExpenses.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {devExpenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500 text-white font-bold text-sm">DEV</div>
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
            <p>No Development expenses recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}
