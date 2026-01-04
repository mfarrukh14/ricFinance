import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { formatCurrency, getUtilizationLevel } from './utils';

export function RadialProgress({ value, label, color, size = 120 }) {
  const data = [{ name: label, value: Math.min(value, 100), fill: color }];
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={size} height={size}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={data} startAngle={90} endAngle={-270}>
          <RadialBar background clockWise dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center -mt-16">
        <div className="text-2xl font-bold" style={{ color }}>{value.toFixed(1)}%</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function BudgetCard({ title, icon: Icon, gradient, budget, expenditure, remaining, utilizationPct }) {
  const level = getUtilizationLevel(utilizationPct);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br ${gradient} rounded-full -translate-y-1/2 translate-x-1/2`} />
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500">Total Budget</p>
            <p className="font-bold text-slate-800 dark:text-slate-100">Rs. {formatCurrency(budget)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Expenditure</p>
            <p className="font-bold text-red-600">Rs. {formatCurrency(expenditure)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Remaining</p>
            <p className="font-bold text-emerald-600">Rs. {formatCurrency(remaining)}</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <RadialProgress value={utilizationPct} label="Used" color={level.color} />
        </div>
      </div>
    </div>
  );
}

export default BudgetCard;
