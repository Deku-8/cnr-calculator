'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Calculator,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Mode } from './ModeTabs';
import type { Calculation } from '@/lib/combinatorics';
import {
  combination,
  descendingProduct,
  factorial,
  factorialExpansion,
  formatBigInt,
  multisetPermutation,
  parseNonNegativeInteger,
  permutation,
} from '@/lib/combinatorics';
import {
  getCombinationCancellation,
  getMultisetPermutationCancellation,
  getPermutationCancellation,
} from '@/lib/cancellation.ts';

export type CalculatorMode = Exclude<Mode, 'expression'>;

export type Values = { n: string; r: string; a: string; b: string; c: string; expr?: string };
type Errors = Partial<Record<keyof Values, string>>;

export type MultisetGroup = {
  id: string;
  label: string;
  count: string;
};

const defaults: Record<CalculatorMode, Values> = {
  combination: { n: '10', r: '3', a: '', b: '', c: '' },
  permutation: { n: '8', r: '3', a: '', b: '', c: '' },
  multiset: { n: '', r: '', a: '', b: '', c: '' },
  factorial: { n: '7', r: '', a: '', b: '', c: '' },
};

const defaultMultisetGroups: MultisetGroup[] = [
  { id: '1', label: 'S', count: '3' },
  { id: '2', label: 'T', count: '3' },
  { id: '3', label: 'I', count: '2' },
  { id: '4', label: 'A', count: '1' },
  { id: '5', label: 'C', count: '1' },
];

const quickChips: Record<CalculatorMode, { label: string; values: Partial<Values> }[]> = {
  combination: [
    { label: '10, 3', values: { n: '10', r: '3' } },
    { label: '52, 5', values: { n: '52', r: '5' } },
    { label: '18, 11', values: { n: '18', r: '11' } },
    { label: '10, 7', values: { n: '10', r: '7' } },
  ],
  permutation: [
    { label: '8, 3', values: { n: '8', r: '3' } },
    { label: '10, 4', values: { n: '10', r: '4' } },
    { label: '5, 5', values: { n: '5', r: '5' } },
  ],
  multiset: [],
  factorial: [
    { label: '7!', values: { n: '7' } },
    { label: '5!', values: { n: '5' } },
    { label: '0!', values: { n: '0' } },
    { label: '10!', values: { n: '10' } },
  ],
};

const multisetPresets = [
  {
    name: 'STATISTICS',
    groups: [
      { id: '1', label: 'S', count: '3' },
      { id: '2', label: 'T', count: '3' },
      { id: '3', label: 'I', count: '2' },
      { id: '4', label: 'A', count: '1' },
      { id: '5', label: 'C', count: '1' },
    ],
  },
  {
    name: 'BANANA',
    groups: [
      { id: '1', label: 'A', count: '3' },
      { id: '2', label: 'N', count: '2' },
      { id: '3', label: 'B', count: '1' },
    ],
  },
  {
    name: 'MISSISSIPPI',
    groups: [
      { id: '1', label: 'I', count: '4' },
      { id: '2', label: 'S', count: '4' },
      { id: '3', label: 'P', count: '2' },
      { id: '4', label: 'M', count: '1' },
    ],
  },
  {
    name: 'แดง4 ขาว3 ฟ้า2',
    groups: [
      { id: '1', label: 'แดง', count: '4' },
      { id: '2', label: 'ขาว', count: '3' },
      { id: '3', label: 'ฟ้า', count: '2' },
    ],
  },
];

function Field({
  id,
  namespace,
  label,
  placeholder,
  value,
  error,
  onChange,
  onStep,
}: {
  id: keyof Values;
  namespace: string;
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onStep: (delta: number) => void;
}) {
  const inputId = `input-${namespace}-${id}`;
  return (
    <div className="space-y-1 w-full min-w-0">
      <label htmlFor={inputId} className="text-xs font-bold text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <div className="relative flex w-full min-w-0 items-center">
        <Input
          id={inputId}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="h-11 w-full min-w-0 rounded-xl bg-white pr-18 text-base font-semibold dark:bg-slate-950/60 shadow-xs border-slate-200 dark:border-slate-800"
        />

        <div className="absolute right-1 flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onStep(-1)}
            aria-label={`ลดค่า ${label}`}
            className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <Minus className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onStep(1)}
            aria-label={`เพิ่มค่า ${label}`}
            className="size-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-[11px] font-medium text-rose-600 dark:text-rose-400 animate-in fade-in"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function CalculatorForm({
  mode,
  presetValues,
  presetMultisetCounts,
  presetMultisetLabels,
  onResult,
}: {
  mode: CalculatorMode;
  presetValues?: Partial<Values>;
  presetMultisetCounts?: number[];
  presetMultisetLabels?: string[];
  onResult: (result: Calculation | null) => void;
}) {
  const [values, setValues] = useState<Values>(defaults[mode]);
  const [errors, setErrors] = useState<Errors>({});
  const [useSymmetry, setUseSymmetry] = useState(true);

  // Multiset state
  const [multisetGroups, setMultisetGroups] = useState<MultisetGroup[]>(defaultMultisetGroups);
  const [wordInput, setWordInput] = useState('');

  // Handle external presets
  useEffect(() => {
    if (presetValues && Object.keys(presetValues).length > 0) {
      setValues((prev) => ({ ...prev, ...presetValues }));
    }
  }, [presetValues]);

  useEffect(() => {
    if (presetMultisetCounts && presetMultisetCounts.length > 0) {
      const groups: MultisetGroup[] = presetMultisetCounts.map((count, idx) => ({
        id: `preset-${idx}`,
        label: presetMultisetLabels?.[idx] ?? `กลุ่ม ${idx + 1}`,
        count: count.toString(),
      }));
      setMultisetGroups(groups);
    }
  }, [presetMultisetCounts, presetMultisetLabels]);

  const fields = useMemo(() => {
    if (mode === 'factorial') {
      return [
        {
          id: 'n' as const,
          label: 'ค่า n (จำนวนเต็ม)',
          placeholder: 'เช่น 7',
        },
      ];
    }
    if (mode === 'multiset') {
      return [];
    }
    return [
      {
        id: 'n' as const,
        label: 'ค่า n (ทั้งหมด)',
        placeholder: 'เช่น 10',
      },
      {
        id: 'r' as const,
        label: mode === 'combination' ? 'ค่า r (ที่เลือก)' : 'ค่า r (จัดเรียง)',
        placeholder: 'เช่น 3',
      },
    ];
  }, [mode]);

  function updateValue(key: keyof Values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function stepValue(key: keyof Values, delta: number) {
    const curNum = Number.parseInt(values[key] || '0', 10);
    const nextNum = Math.max(0, isNaN(curNum) ? 0 : curNum + delta);
    updateValue(key, nextNum.toString());
  }

  // Multiset group operations
  function updateMultisetGroup(id: string, field: 'label' | 'count', val: string) {
    setMultisetGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: val } : g)),
    );
  }

  function stepMultisetCount(id: string, delta: number) {
    setMultisetGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const cur = Number.parseInt(g.count || '0', 10);
        const next = Math.max(1, isNaN(cur) ? 1 : cur + delta);
        return { ...g, count: next.toString() };
      }),
    );
  }

  function addMultisetGroup() {
    setMultisetGroups((prev) => [
      ...prev,
      { id: `${Date.now()}`, label: `กลุ่ม ${prev.length + 1}`, count: '1' },
    ]);
  }

  function removeMultisetGroup(id: string) {
    if (multisetGroups.length <= 1) return;
    setMultisetGroups((prev) => prev.filter((g) => g.id !== id));
  }

  function analyzeWord(word: string) {
    const cleaned = word.trim().toUpperCase();
    if (!cleaned) return;
    const freq: Record<string, number> = {};
    for (const char of cleaned) {
      if (char.trim()) {
        freq[char] = (freq[char] || 0) + 1;
      }
    }
    // Sort descending by frequency
    const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const groups: MultisetGroup[] = entries.map(([char, count], idx) => ({
      id: `${Date.now()}-${idx}`,
      label: char,
      count: count.toString(),
    }));
    setMultisetGroups(groups);
  }

  const multisetTotalN = useMemo(() => {
    return multisetGroups.reduce((sum, g) => {
      const num = Number.parseInt(g.count || '0', 10);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [multisetGroups]);

  const calculate = useCallback(() => {
    const nextErrors: Errors = {};
    const parsed: Partial<Record<keyof Values, number>> = {};

    if (mode === 'multiset') {
      const counts: number[] = [];
      const labels: string[] = [];
      for (const g of multisetGroups) {
        const c = Number.parseInt(g.count.trim() || '0', 10);
        if (isNaN(c) || c < 0) {
          alert('จำนวนสิ่งของแต่ละกลุ่มต้องเป็นจำนวนเต็มที่ไม่ติดลบ');
          return;
        }
        if (c > 0) {
          counts.push(c);
          labels.push(`${g.label || 'กลุ่ม'}: ${c}`);
        }
      }

      if (counts.length === 0) {
        onResult(null);
        return;
      }

      const totalN = counts.reduce((sum, val) => sum + val, 0);
      const answer = multisetPermutation(counts);
      const detailed = getMultisetPermutationCancellation(counts, labels);

      const result: Calculation = {
        general: 'n! / (n₁! × n₂! × … × nₖ!)  [โดยที่ n = n₁ + n₂ + … + nₖ]',
        substituted: `${totalN}! / (${counts.map((c) => `${c}!`).join(' × ') || '1!'})`,
        simplification: detailed.steps.map((s) => s.explanation).join('\n'),
        answer: formatBigInt(answer),
        answerLabel: `สลับที่ของซ้ำ ${totalN} ชิ้น (${labels.join(', ')})`,
        detailedCancellation: detailed,
        latexFormula: detailed.formulaLaTeX + ' \\implies ' + detailed.substitutedLaTeX,
        note: `รวมสิ่งของทั้งหมด n = ${totalN} ชิ้น`,
      };

      setErrors({});
      onResult(result);
      return;
    }

    for (const field of fields) {
      try {
        parsed[field.id] = parseNonNegativeInteger(
          values[field.id],
          field.label.replace(/ \(.+\)/, ''),
        );
      } catch (error) {
        nextErrors[field.id] = (error as Error).message;
      }
    }

    if (
      (mode === 'combination' || mode === 'permutation') &&
      parsed.n !== undefined &&
      parsed.r !== undefined &&
      parsed.r > parsed.n
    ) {
      nextErrors.r = 'r ต้องไม่เกิน n';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      onResult(null);
      return;
    }

    let result: Calculation;

    if (mode === 'combination') {
      const n = parsed.n!;
      const r = parsed.r!;
      const k = Math.min(r, n - r);
      const answer = combination(n, r);
      const detailed = getCombinationCancellation(n, r, useSymmetry);

      const effectiveR = useSymmetry ? k : r;
      const largeFactorial = n - effectiveR;

      result = {
        general: 'C(n, r) = n! / [r! × (n − r)!]',
        substituted: `C(${n}, ${r}) = ${n}! / [${r}! × (${n} − ${r})!] = ${n}! / (${effectiveR}! × ${largeFactorial}!)`,
        simplification: detailed.steps.map((s) => s.explanation).join('\n') || `= ${formatBigInt(answer)}`,
        answer: formatBigInt(answer),
        answerLabel: `C(${n}, ${r})`,
        note: k !== r && useSymmetry ? `ใช้สมบัติสมมาตร C(${n}, ${r}) = C(${n}, ${k})` : undefined,
        detailedCancellation: detailed,
        latexFormula: detailed.formulaLaTeX + ' \\implies ' + detailed.substitutedLaTeX,
      };
    } else if (mode === 'permutation') {
      const n = parsed.n!;
      const r = parsed.r!;
      const answer = permutation(n, r);
      const detailed = getPermutationCancellation(n, r);

      result = {
        general: 'P(n, r) = n! / (n − r)!',
        substituted: `P(${n}, ${r}) = ${n}! / (${n} − ${r})! = ${n}! / ${n - r}!`,
        simplification: `= ${descendingProduct(n, n - r + 1)} = ${formatBigInt(answer)}`,
        answer: formatBigInt(answer),
        answerLabel: `P(${n}, ${r})`,
        detailedCancellation: detailed,
        latexFormula: detailed.formulaLaTeX + ' \\implies ' + detailed.substitutedLaTeX,
      };
    } else if (mode === 'factorial') {
      const n = parsed.n!;
      const answer = factorial(n);

      result = {
        general: 'n! = n × (n − 1) × … × 1',
        substituted: `${n}!`,
        simplification: `${n}! = ${factorialExpansion(n)} = ${formatBigInt(answer)}`,
        answer: formatBigInt(answer),
        answerLabel: `${n}!`,
        note: n === 0 ? 'นิยาม 0! = 1' : undefined,
        latexFormula: `${n}! = ${factorialExpansion(n)} = ${formatBigInt(answer)}`,
      };
    } else {
      return;
    }

    setErrors({});
    onResult(result);
  }, [fields, mode, values, multisetGroups, useSymmetry, onResult]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  function clear() {
    setValues({ n: '', r: '', a: '', b: '', c: '' });
    setErrors({});
    onResult(null);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        calculate();
      }}
      noValidate
      className="space-y-4 w-full min-w-0"
    >
      {/* Multiset Mode Specific UI */}
      {mode === 'multiset' && (
        <div className="space-y-3 w-full min-w-0">
          {/* Word Auto-Analyzer Tool */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/30 w-full min-w-0">
            <label className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block mb-1">
              พิมพ์คำเพื่อนับตัวอักษรซ้ำอัตโนมัติ:
            </label>
            <div className="flex gap-1.5 min-w-0">
              <Input
                placeholder="เช่น STATISTICS, BANANA, กรรไกร"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                className="h-8 flex-1 min-w-0 bg-white dark:bg-slate-900 text-xs rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => analyzeWord(wordInput)}
                className="h-8 gap-1 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 rounded-lg"
              >
                <Wand2 className="size-3" />
                นับซ้ำ
              </Button>
            </div>
          </div>

          {/* Group Inputs Header & Total n */}
          <div className="flex items-center justify-between pt-1 min-w-0">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              กลุ่มของที่ซ้ำกัน (n₁, n₂, …):
            </span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
              ผลรวม n = {multisetTotalN} ชิ้น
            </span>
          </div>

          {/* Groups List */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1 math-scroll w-full min-w-0">
            {multisetGroups.map((group, idx) => (
              <div
                key={group.id}
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-950/60 min-w-0"
              >
                <span className="text-xs font-mono text-slate-400 w-5 sm:w-6 shrink-0 text-center">
                  n{idx + 1}
                </span>
                <Input
                  value={group.label}
                  onChange={(e) => updateMultisetGroup(group.id, 'label', e.target.value)}
                  placeholder="ชื่อ/สี"
                  className="h-8 text-xs w-20 sm:w-28 rounded-lg bg-slate-50 dark:bg-slate-900 shrink-0"
                />
                <div className="relative flex flex-1 min-w-0 items-center">
                  <Input
                    type="number"
                    min="1"
                    value={group.count}
                    onChange={(e) => updateMultisetGroup(group.id, 'count', e.target.value)}
                    className="h-8 text-xs font-semibold pr-12 sm:pr-14 rounded-lg w-full min-w-0"
                  />
                  <div className="absolute right-1 flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => stepMultisetCount(group.id, -1)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Minus className="size-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepMultisetCount(group.id, 1)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Plus className="size-2.5" />
                    </button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMultisetGroup(group.id)}
                  disabled={multisetGroups.length <= 1}
                  className="size-7 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
                  title="ลบกลุ่มนี้"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMultisetGroup}
            className="h-8 w-full gap-1 text-xs border-dashed text-slate-600 dark:text-slate-300"
          >
            <Plus className="size-3.5" />
            เพิ่มกลุ่มของซ้ำ
          </Button>

          {/* Quick Multiset Presets */}
          <div className="flex items-center gap-1 pt-1 text-xs text-slate-500 overflow-x-auto pb-1 w-full min-w-0">
            <span className="text-[11px] opacity-70 shrink-0">ตัวอย่าง:</span>
            <div className="flex gap-1 shrink-0">
              {multisetPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setMultisetGroups(preset.groups)}
                  className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optional Compact Toggles */}
      {mode === 'combination' && (
        <div className="flex items-center justify-between py-1 text-xs gap-2 min-w-0">
          <label htmlFor="symmetry-mode" className="text-slate-600 dark:text-slate-300 font-medium truncate min-w-0">
            สมบัติสมมาตร C(n, r) = C(n, n−r)
          </label>
          <Switch
            id="symmetry-mode"
            checked={useSymmetry}
            onCheckedChange={setUseSymmetry}
            className="shrink-0"
          />
        </div>
      )}

      {/* Input Fields for other modes */}
      {mode !== 'multiset' && (
        <div className={`grid w-full min-w-0 gap-3 ${fields.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {fields.map((field) => (
            <Field
              key={field.id}
              {...field}
              namespace={mode}
              value={values[field.id]}
              error={errors[field.id]}
              onChange={(val) => updateValue(field.id, val)}
              onStep={(delta) => stepValue(field.id, delta)}
            />
          ))}
        </div>
      )}

      {/* Tiny Quick Chips for other modes */}
      {mode !== 'multiset' && (
        <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
          <span className="text-[11px] opacity-70">ตัวเลขด่วน:</span>
          <div className="flex flex-wrap gap-1">
            {quickChips[mode].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setValues((cur) => ({ ...cur, ...chip.values }));
                  if (chip.values.c) setAdvanced(true);
                  setErrors({});
                }}
                className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={clear}
          className="h-10 rounded-xl px-3 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
          title="ล้างค่าทั้งหมด"
        >
          <RotateCcw className="size-3.5 mr-1" />
          ล้างค่า
        </Button>
        <Button
          type="submit"
          className="h-10 flex-1 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Calculator className="mr-1.5 size-4" />
          คำนวณและแสดงวิธีตัดทอน
        </Button>
      </div>
    </form>
  );
}
