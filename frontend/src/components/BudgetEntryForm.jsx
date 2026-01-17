import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Save } from 'lucide-react';

function toNumericString(value) {
  if (value === null || value === undefined) return '0';
  const str = String(value);
  return str.length === 0 ? '0' : str;
}

function toNumberOrZero(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

const BudgetInputField = React.memo(function BudgetInputField({ label, value, onChange, onBlur, type = 'number' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
        {type === 'number' ? `${label} (Rs.)` : label}
      </label>
      <input
        type={type}
        value={value}
        inputMode={type === 'number' ? 'decimal' : undefined}
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? '0.01' : undefined}
        onChange={onChange}
        onBlur={onBlur}
        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
      />
    </div>
  );
});

export default function BudgetEntryForm({ entry, objectCodes, fiscalYears, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    objectCodeId: entry?.objectCodeId ?? '',
    fiscalYearId: entry?.fiscalYearId ?? fiscalYears.find((f) => f.isCurrent)?.id ?? '',
    totalBudgetAllocation: toNumericString(entry?.totalBudgetAllocation ?? 0),
    firstReleased: toNumericString(entry?.firstReleased ?? 0),
    secondReleased: toNumericString(entry?.secondReleased ?? 0),
    thirdReleased: toNumericString(entry?.thirdReleased ?? 0),
    fourthReleased: toNumericString(entry?.fourthReleased ?? 0),
    supplementaryBudget: toNumericString(entry?.supplementaryBudget ?? 0),
    additionalSurrender: toNumericString(entry?.additionalSurrender ?? 0),
    excessReallocation: toNumericString(entry?.excessReallocation ?? 0),
    aaaReApp: toNumericString(entry?.aaaReApp ?? 0),
    budgetWithheldLapse: toNumericString(entry?.budgetWithheldLapse ?? 0),
    aaaExpenditure: toNumericString(entry?.aaaExpenditure ?? 0),
    developmentBudgetAllocated: toNumericString(entry?.developmentBudgetAllocated ?? 0),
    developmentReApp: toNumericString(entry?.developmentReApp ?? 0),
    developmentExpenditure: toNumericString(entry?.developmentExpenditure ?? 0),
    plaBudgetAllocated: toNumericString(entry?.plaBudgetAllocated ?? 0),
    plaReApp: toNumericString(entry?.plaReApp ?? 0),
    plaExpenditure: toNumericString(entry?.plaExpenditure ?? 0),
    uhiBudgetAllocated: toNumericString(entry?.uhiBudgetAllocated ?? 0),
    uhiReApp: toNumericString(entry?.uhiReApp ?? 0),
    uhiExpenditure: toNumericString(entry?.uhiExpenditure ?? 0),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [objectCodeSearch, setObjectCodeSearch] = useState(() => {
    const oc = objectCodes?.find((o) => o.id === (entry?.objectCodeId ?? undefined));
    return oc ? `${oc.code} - ${oc.headOfAccount}` : '';
  });

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [filtered, setFiltered] = useState(() => objectCodes ?? []);

  useEffect(() => {
    const q = String(objectCodeSearch || '').trim().toLowerCase();
    if (!q) {
      setFiltered(objectCodes ?? []);
      setHighlighted(0);
      return;
    }
    const f = (objectCodes || []).filter((o) => formatObjectCode(o).toLowerCase().includes(q));
    setFiltered(f);
    setHighlighted(0);
  }, [objectCodeSearch, objectCodes]);

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selectObjectCode = (oc) => {
    setObjectCodeSearch(formatObjectCode(oc));
    handleChange('objectCodeId', oc.id);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const formatObjectCode = (oc) => `${oc.code} - ${oc.headOfAccount}`;

  useEffect(() => {
    const oc = objectCodes?.find((o) => o.id === formData.objectCodeId);
    setObjectCodeSearch(oc ? formatObjectCode(oc) : '');
  }, [formData.objectCodeId, objectCodes]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field) => (e) => {
    // Allow empty string so backspace works; coerce negatives to 0.
    const next = e.target.value;
    if (next === '') {
      handleChange(field, '');
      return;
    }

    const parsed = Number.parseFloat(next);
    if (!Number.isFinite(parsed)) {
      handleChange(field, '');
      return;
    }

    handleChange(field, String(Math.max(0, parsed)));
  };

  const handleNumberBlur = (field) => () => {
    setFormData((prev) => {
      if (prev[field] === '') return { ...prev, [field]: '0' };
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.objectCodeId) {
      setError('Please select an Object Code.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        totalBudgetAllocation: toNumberOrZero(formData.totalBudgetAllocation),
        firstReleased: toNumberOrZero(formData.firstReleased),
        secondReleased: toNumberOrZero(formData.secondReleased),
        thirdReleased: toNumberOrZero(formData.thirdReleased),
        fourthReleased: toNumberOrZero(formData.fourthReleased),
        supplementaryBudget: toNumberOrZero(formData.supplementaryBudget),
        additionalSurrender: toNumberOrZero(formData.additionalSurrender),
        excessReallocation: toNumberOrZero(formData.excessReallocation),
        aaaReApp: toNumberOrZero(formData.aaaReApp),
        budgetWithheldLapse: toNumberOrZero(formData.budgetWithheldLapse),
        aaaExpenditure: toNumberOrZero(formData.aaaExpenditure),
        developmentBudgetAllocated: toNumberOrZero(formData.developmentBudgetAllocated),
        developmentReApp: toNumberOrZero(formData.developmentReApp),
        developmentExpenditure: toNumberOrZero(formData.developmentExpenditure),
        plaBudgetAllocated: toNumberOrZero(formData.plaBudgetAllocated),
        plaReApp: toNumberOrZero(formData.plaReApp),
        plaExpenditure: toNumberOrZero(formData.plaExpenditure),
        uhiBudgetAllocated: toNumberOrZero(formData.uhiBudgetAllocated),
        uhiReApp: toNumberOrZero(formData.uhiReApp),
        uhiExpenditure: toNumberOrZero(formData.uhiExpenditure),
      };
      await onSave(payload);
    } catch (err) {
      setError(err?.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Object Code</label>
          <div className="relative" ref={containerRef}>
            <input
              type="text"
              value={objectCodeSearch}
              onChange={(e) => {
                const v = e.target.value;
                setObjectCodeSearch(v);
                // clear objectCodeId until a concrete selection is made
                handleChange('objectCodeId', '');
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => {
                if (!showDropdown) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlighted((h) => Math.max(h - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  const sel = filtered[highlighted];
                  if (sel) selectObjectCode(sel);
                } else if (e.key === 'Escape') {
                  setShowDropdown(false);
                }
              }}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
              placeholder="Select Object Code"
              required
              disabled={!!entry}
              readOnly={!!entry}
              ref={inputRef}
            />

            {showDropdown && filtered.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
                {filtered.map((oc, idx) => (
                  <li
                    key={oc.id}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => selectObjectCode(oc)}
                    className={`px-4 py-2 cursor-pointer ${idx === highlighted ? 'bg-teal-50 dark:bg-teal-900/40' : ''}`}
                  >
                    {formatObjectCode(oc)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Fiscal Year</label>
          <select
            value={formData.fiscalYearId}
            onChange={(e) => handleChange('fiscalYearId', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            required
            disabled={!!entry}
          >
            <option value="">Select Fiscal Year</option>
            {fiscalYears.map((fy) => (
              <option key={fy.id} value={fy.id}>
                {fy.year} {fy.isCurrent && '(Current)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-teal-50 dark:bg-teal-950/25 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
          Non-Development Budget (AAA)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <BudgetInputField
            label="Total Budget Allocation"
            value={formData.totalBudgetAllocation}
            onChange={handleNumberChange('totalBudgetAllocation')}
            onBlur={handleNumberBlur('totalBudgetAllocation')}
          />
          <BudgetInputField label="1st Released" value={formData.firstReleased} onChange={handleNumberChange('firstReleased')} onBlur={handleNumberBlur('firstReleased')} />
          <BudgetInputField label="2nd Released" value={formData.secondReleased} onChange={handleNumberChange('secondReleased')} onBlur={handleNumberBlur('secondReleased')} />
          <BudgetInputField label="3rd Released" value={formData.thirdReleased} onChange={handleNumberChange('thirdReleased')} onBlur={handleNumberBlur('thirdReleased')} />
          <BudgetInputField label="4th Released" value={formData.fourthReleased} onChange={handleNumberChange('fourthReleased')} onBlur={handleNumberBlur('fourthReleased')} />
          <BudgetInputField
            label="Supplementary Budget"
            value={formData.supplementaryBudget}
            onChange={handleNumberChange('supplementaryBudget')}
            onBlur={handleNumberBlur('supplementaryBudget')}
          />
          <BudgetInputField
            label="Additional/Surrender"
            value={formData.additionalSurrender}
            onChange={handleNumberChange('additionalSurrender')}
            onBlur={handleNumberBlur('additionalSurrender')}
          />
          <BudgetInputField
            label="Excess Reallocation"
            value={formData.excessReallocation}
            onChange={handleNumberChange('excessReallocation')}
            onBlur={handleNumberBlur('excessReallocation')}
          />
          <BudgetInputField label="Re-appropriation" value={formData.aaaReApp} onChange={handleNumberChange('aaaReApp')} onBlur={handleNumberBlur('aaaReApp')} />
          <BudgetInputField
            label="Budget Withheld/Lapse"
            value={formData.budgetWithheldLapse}
            onChange={handleNumberChange('budgetWithheldLapse')}
            onBlur={handleNumberBlur('budgetWithheldLapse')}
          />
          <BudgetInputField label="AAA Expenditure" value={formData.aaaExpenditure} onChange={handleNumberChange('aaaExpenditure')} onBlur={handleNumberBlur('aaaExpenditure')} />
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-950/25 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          Development Budget (AAA)
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <BudgetInputField
            label="Budget Allocated"
            value={formData.developmentBudgetAllocated}
            onChange={handleNumberChange('developmentBudgetAllocated')}
            onBlur={handleNumberBlur('developmentBudgetAllocated')}
          />
          <BudgetInputField
            label="Re-appropriation"
            value={formData.developmentReApp}
            onChange={handleNumberChange('developmentReApp')}
            onBlur={handleNumberBlur('developmentReApp')}
          />
          <BudgetInputField
            label="Development Expenditure"
            value={formData.developmentExpenditure}
            onChange={handleNumberChange('developmentExpenditure')}
            onBlur={handleNumberBlur('developmentExpenditure')}
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/25 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          PLA Budget
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <BudgetInputField
            label="Budget Allocated"
            value={formData.plaBudgetAllocated}
            onChange={handleNumberChange('plaBudgetAllocated')}
            onBlur={handleNumberBlur('plaBudgetAllocated')}
          />
          <BudgetInputField label="Re-appropriation" value={formData.plaReApp} onChange={handleNumberChange('plaReApp')} onBlur={handleNumberBlur('plaReApp')} />
          <BudgetInputField label="PLA Expenditure" value={formData.plaExpenditure} onChange={handleNumberChange('plaExpenditure')} onBlur={handleNumberBlur('plaExpenditure')} />
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/25 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          UHI Budget
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <BudgetInputField
            label="Budget Allocated"
            value={formData.uhiBudgetAllocated}
            onChange={handleNumberChange('uhiBudgetAllocated')}
            onBlur={handleNumberBlur('uhiBudgetAllocated')}
          />
          <BudgetInputField label="Re-appropriation" value={formData.uhiReApp} onChange={handleNumberChange('uhiReApp')} onBlur={handleNumberBlur('uhiReApp')} />
          <BudgetInputField label="UHI Expenditure" value={formData.uhiExpenditure} onChange={handleNumberChange('uhiExpenditure')} onBlur={handleNumberBlur('uhiExpenditure')} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
}
