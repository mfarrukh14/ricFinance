// Dashboard utility functions and constants

export const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const GRADIENT_COLORS = {
  teal: ['#14b8a6', '#0d9488', '#0f766e'],
  blue: ['#3b82f6', '#2563eb', '#1d4ed8'],
  amber: ['#f59e0b', '#d97706', '#b45309'],
};

export function formatCurrency(value) {
  const v = Number(value) || 0;
  if (v >= 10000000) return `${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `${(v / 100000).toFixed(2)} Lac`;
  if (v >= 1000) return `${(v / 1000).toFixed(2)} K`;
  return v.toFixed(2);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getUtilizationLevel(pct) {
  const p = Number(pct) || 0;
  if (p >= 90) return { label: 'Critical', badgeClass: 'bg-red-100 text-red-700', barClass: 'bg-red-500', color: '#ef4444' };
  if (p >= 70) return { label: 'Watch', badgeClass: 'bg-amber-100 text-amber-700', barClass: 'bg-amber-500', color: '#f59e0b' };
  return { label: 'Healthy', badgeClass: 'bg-emerald-100 text-emerald-700', barClass: 'bg-emerald-500', color: '#10b981' };
}
