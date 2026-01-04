import React from 'react';
import { Tooltip } from 'recharts';
import { formatCurrency } from './utils';

export function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
        <p className="font-medium text-slate-800 dark:text-slate-100">{label || payload[0]?.name}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {p.dataKey || p.name}: Rs. {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default CustomTooltip;
