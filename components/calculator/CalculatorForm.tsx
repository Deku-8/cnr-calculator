'use client';

import { useMemo, useState } from 'react';
import { Calculator, RotateCcw, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Mode } from './ModeTabs';
import type { Calculation } from '@/lib/combinatorics';
import { advancedFactorialQuotient, combination, descendingProduct, factorial, factorialExpansion, factorialQuotient, formatBigInt, formatFraction, parseNonNegativeInteger, permutation } from '@/lib/combinatorics';

type Values = { n: string; r: string; a: string; b: string; c: string };
type Errors = Partial<Record<keyof Values, string>>;

const defaults: Record<Mode, Values> = {
  combination: { n: '10', r: '3', a: '', b: '', c: '' },
  permutation: { n: '8', r: '3', a: '', b: '', c: '' },
  factorial: { n: '7', r: '', a: '', b: '', c: '' },
  quotient: { n: '', r: '', a: '10', b: '7', c: '3' },
};

const examples: Record<Mode, { label: string; values: Partial<Values> }[]> = {
  combination: [{ label: 'C(10,3)', values: { n: '10', r: '3' } }, { label: 'C(52,5)', values: { n: '52', r: '5' } }],
  permutation: [{ label: 'P(8,3)', values: { n: '8', r: '3' } }, { label: 'P(10,4)', values: { n: '10', r: '4' } }],
  factorial: [{ label: '7!', values: { n: '7' } }, { label: '0!', values: { n: '0' } }],
  quotient: [{ label: '10! / 7!', values: { a: '10', b: '7' } }, { label: '5! / 8!', values: { a: '5', b: '8' } }],
};

function Field({ id, namespace, label, help, value, error, onChange }: { id: keyof Values; namespace: string; label: string; help: string; value: string; error?: string; onChange: (value: string) => void }) {
  const inputId = `input-${namespace}-${id}`;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</label>
      <Input id={inputId} inputMode="numeric" pattern="[0-9]*" placeholder="เช่น 10" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ''}`} className="h-12 bg-white px-4 text-lg dark:bg-slate-950/50" />
      <p id={`${inputId}-help`} className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{help}</p>
      {error && <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">ข้อผิดพลาด: {error}</p>}
    </div>
  );
}

export function CalculatorForm({ mode, onResult }: { mode: Mode; onResult: (result: Calculation | null) => void }) {
  const [values, setValues] = useState<Values>(defaults[mode]);
  const [errors, setErrors] = useState<Errors>({});
  const [advanced, setAdvanced] = useState(false);
  const fields = useMemo(() => {
    if (mode === 'factorial') return [{ id: 'n' as const, label: 'ค่า n', help: 'จำนวนเต็มที่ต้องการหาแฟกทอเรียล' }];
    if (mode === 'quotient') return [
      { id: 'a' as const, label: 'ตัวเศษ (a)', help: 'ค่า factorial ด้านบนของเศษส่วน' },
      { id: 'b' as const, label: 'ตัวส่วน (b)', help: 'ค่า factorial ตัวแรกด้านล่าง' },
      ...(advanced ? [{ id: 'c' as const, label: 'ตัวส่วนที่สอง (c)', help: 'ค่า factorial ตัวที่สองด้านล่าง' }] : []),
    ];
    return [
      { id: 'n' as const, label: 'ค่า n', help: 'จำนวนสิ่งของทั้งหมด' },
      { id: 'r' as const, label: 'ค่า r', help: mode === 'combination' ? 'จำนวนสิ่งของที่เลือก โดยไม่สนใจลำดับ' : 'จำนวนตำแหน่งที่จัดเรียง โดยสนใจลำดับ' },
    ];
  }, [mode, advanced]);

  function updateValue(key: keyof Values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function calculate() {
    const nextErrors: Errors = {};
    const parsed: Partial<Record<keyof Values, number>> = {};
    for (const field of fields) {
      try { parsed[field.id] = parseNonNegativeInteger(values[field.id], field.label.replace(/ \(.+\)/, '')); }
      catch (error) { nextErrors[field.id] = (error as Error).message; }
    }
    if ((mode === 'combination' || mode === 'permutation') && parsed.n !== undefined && parsed.r !== undefined && parsed.r > parsed.n) nextErrors.r = 'r ต้องมีค่าไม่เกิน n';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); onResult(null); return; }

    let result: Calculation;
    if (mode === 'combination') {
      const n = parsed.n!, r = parsed.r!, k = Math.min(r, n - r), answer = combination(n, r);
      const symmetry = k !== r ? `ใช้สมบัติ C(${n},${r}) = C(${n},${k}) เพื่อลดจำนวนขั้นตอน` : undefined;
      result = { general: 'C(n,r) = n! / [r!(n−r)!]', substituted: `C(${n},${r}) = ${n}! / [${r}!(${n}−${r})!] = ${n}! / (${r}!${n-r}!)`, simplification: `= (${descendingProduct(n, n-k+1)}) / (${factorialExpansion(k)}) = ${formatBigInt(answer)}`, answer: formatBigInt(answer), answerLabel: `C(${n},${r})`, note: symmetry };
    } else if (mode === 'permutation') {
      const n = parsed.n!, r = parsed.r!, answer = permutation(n, r);
      result = { general: 'P(n,r) = n! / (n−r)!', substituted: `P(${n},${r}) = ${n}! / (${n}−${r})! = ${n}! / ${n-r}!`, simplification: `= ${descendingProduct(n, n-r+1)} = ${formatBigInt(answer)}`, answer: formatBigInt(answer), answerLabel: `P(${n},${r})` };
    } else if (mode === 'factorial') {
      const n = parsed.n!, answer = factorial(n);
      result = { general: 'n! = n × (n−1) × … × 2 × 1', substituted: `${n}!`, simplification: `${n}! = ${factorialExpansion(n)} = ${formatBigInt(answer)}`, answer: formatBigInt(answer), answerLabel: `${n}!`, note: n === 0 ? 'ตามนิยาม 0! = 1' : undefined };
    } else if (advanced) {
      const a = parsed.a!, b = parsed.b!, c = parsed.c!, fraction = advancedFactorialQuotient(a, b, c);
      result = { general: 'a! / (b!c!)', substituted: `${a}! / (${b}!${c}!)`, simplification: `= ${formatBigInt(factorial(a))} / (${formatBigInt(factorial(b))} × ${formatBigInt(factorial(c))}) = ${formatFraction(fraction.numerator, fraction.denominator)}`, answer: formatFraction(fraction.numerator, fraction.denominator), answerLabel: `${a}! / (${b}!${c}!)` };
    } else {
      const a = parsed.a!, b = parsed.b!, fraction = factorialQuotient(a, b);
      const simplification = a >= b ? `= ${descendingProduct(a, b+1)} = ${formatFraction(fraction.numerator, fraction.denominator)}` : `= 1 / (${descendingProduct(b, a+1)}) = ${formatFraction(fraction.numerator, fraction.denominator)}`;
      result = { general: 'a! / b!', substituted: `${a}! / ${b}!`, simplification, answer: formatFraction(fraction.numerator, fraction.denominator), answerLabel: `${a}! / ${b}!`, note: fraction.denominator > 1n ? 'คำตอบแสดงเป็นเศษส่วนอย่างต่ำแล้ว' : undefined };
    }
    setErrors({}); onResult(result);
  }

  function clear() { setValues({ n: '', r: '', a: '', b: '', c: '' }); setErrors({}); onResult(null); }

  return (
    <form onSubmit={(e) => { e.preventDefault(); calculate(); }} noValidate>
      {mode === 'quotient' && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-center gap-2"><Settings2 aria-hidden="true" className="size-4 text-indigo-600 dark:text-indigo-300" /><div><label htmlFor="advanced-mode" className="text-sm font-semibold">ตัวเลือกขั้นสูง</label><p className="text-xs text-slate-500 dark:text-slate-400">คำนวณในรูป a! / (b!c!)</p></div></div>
          <Switch id="advanced-mode" checked={advanced} onCheckedChange={(checked) => { setAdvanced(checked); setErrors({}); onResult(null); }} aria-label="เปิดการคำนวณแบบ a! หารด้วย b!c!" />
        </div>
      )}
      <div className={`grid gap-5 ${fields.length > 1 ? 'sm:grid-cols-2' : ''}`}>
        {fields.map((field) => <Field key={field.id} {...field} namespace={mode} value={values[field.id]} error={errors[field.id]} onChange={(value) => updateValue(field.id, value)} />)}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-slate-500 dark:text-slate-400">ลองตัวอย่าง:</span>
        {examples[mode].map((example) => <Button key={example.label} type="button" variant="outline" size="sm" onClick={() => { setValues((current) => ({ ...current, ...example.values })); setErrors({}); onResult(null); }}>{example.label}</Button>)}
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={clear} className="h-12 px-5"><RotateCcw aria-hidden="true" />ล้างค่า</Button>
        <Button type="submit" className="h-12 flex-1 bg-indigo-600 text-base hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"><Calculator aria-hidden="true" />คำนวณ <span className="ml-1 hidden text-xs font-normal opacity-70 sm:inline">กด Enter ได้</span></Button>
      </div>
    </form>
  );
}
