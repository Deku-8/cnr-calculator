'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Calculator,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Percent,
  Divide,
  CornerDownLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CancellationVisualizer } from './CancellationVisualizer';
import {
  evaluateExpression,
  type ExpressionResult,
  formatBigInt,
} from '@/lib/expression';

const PRESETS = [
  {
    label: '10! / (7! × 3!)',
    expr: '10! / (7! * 3!)',
    desc: 'ตัดทอนแฟกทอเรียล',
  },
  {
    label: '{C30,3 - C25,3} / C30,3',
    expr: '{C30,3 - C25,3} / C30,3',
    desc: 'ความน่าจะเป็น (ตัดทอน)',
  },
  {
    label: 'C(5,2) × C(6,2) × 3!',
    expr: 'C(5,2) * C(6,2) * 3!',
    desc: 'คูณหลายพจน์',
  },
  {
    label: 'C(4,1) × C(48,4) / C(52,5)',
    expr: 'C(4,1) * C(48,4) / C(52,5)',
    desc: 'ไพ่ 1 เอซ',
  },
  {
    label: 'P(5,3) + P(4,2)',
    expr: 'P(5,3) + P(4,2)',
    desc: 'บวกการจัดลำดับ',
  },
];

export function ExpressionCalculator({ initialExpr }: { initialExpr?: string }) {
  const [expr, setExpr] = useState(initialExpr || '{C30,3 - C25,3} / C30,3');
  const [result, setResult] = useState<ExpressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTermIndex, setSelectedTermIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const calculate = (expressionToEval: string) => {
    const trimmed = expressionToEval.trim();
    if (!trimmed) {
      setResult(null);
      setError('กรุณากรอกนิพจน์ที่ต้องการคำนวณ');
      return;
    }
    try {
      const res = evaluateExpression(trimmed);
      setResult(res);
      setError(null);
      setSelectedTermIndex(0);
    } catch (err) {
      setError((err as Error).message || 'เกิดข้อผิดพลาดในการคำนวณ');
      setResult(null);
    }
  };

  useEffect(() => {
    calculate(expr);
  }, []);

  const handlePreset = (presetExpr: string) => {
    setExpr(presetExpr);
    calculate(presetExpr);
    inputRef.current?.focus();
  };

  const handleKeypadInsert = (text: string) => {
    const input = inputRef.current;
    if (!input) {
      setExpr((prev) => prev + text);
      return;
    }
    const start = input.selectionStart ?? expr.length;
    const end = input.selectionEnd ?? expr.length;
    const nextExpr = expr.substring(0, start) + text + expr.substring(end);
    setExpr(nextExpr);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleBackspace = () => {
    const input = inputRef.current;
    if (!input) {
      setExpr((prev) => prev.slice(0, -1));
      return;
    }
    const start = input.selectionStart ?? expr.length;
    const end = input.selectionEnd ?? expr.length;
    if (start === end) {
      if (start === 0) return;
      const nextExpr = expr.substring(0, start - 1) + expr.substring(end);
      setExpr(nextExpr);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start - 1, start - 1);
      }, 0);
    } else {
      const nextExpr = expr.substring(0, start) + expr.substring(end);
      setExpr(nextExpr);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start, start);
      }, 0);
    }
  };

  const handleClear = () => {
    setExpr('');
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  };

  const handleCopy = () => {
    if (!result) return;
    void navigator.clipboard.writeText(result.finalValueString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visualizableTerms = result?.subTerms.filter((t) => t.detailedCancellation !== undefined) ?? [];
  const safeIndex = Math.min(selectedTermIndex, Math.max(0, visualizableTerms.length - 1));
  const activeTerm = visualizableTerms[safeIndex];

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      {/* Left Column: Formula Input, Presets, Keypad */}
      <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calculator className="size-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              เครื่องคิดเลข
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            รองรับ C, P, !, +, −, ×, ÷, (), {'{}'}
          </span>
        </div>

        {/* Preset Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium text-[11px]">
              <Sparkles className="size-3 text-amber-500" /> ตัวอย่างนิพจน์ยอดนิยม:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.expr}
                type="button"
                onClick={() => handlePreset(p.expr)}
                className="rounded-lg border border-slate-200/90 bg-slate-50/70 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-colors"
              >
                <span className="font-mono">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculate(expr);
          }}
          className="space-y-2"
        >
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder="เช่น {C30,3 - C25,3} / C30,3 หรือ 10! / (7! * 3!)"
              className="h-12 rounded-xl bg-slate-50/80 pr-12 font-mono text-sm tracking-wide shadow-inner focus-visible:ring-indigo-500 dark:bg-slate-950/60"
            />
            {expr && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="ล้างข้อมูลทั้งหมด"
              >
                <RotateCcw className="size-3.5" />
              </button>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-10 gap-1.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500"
          >
            <CornerDownLeft className="size-3.5" />
            <span>คำนวณและแสดงขั้นตอนตัดทอน</span>
          </Button>
        </form>

        {/* On-screen Keypad */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[11px] font-medium text-slate-400">แป้นพิมพ์สูตรและเครื่องหมาย</p>

          {/* Combinatorics Helpers Row */}
          <div className="grid grid-cols-6 gap-1.5">
            <button
              type="button"
              onClick={() => handleKeypadInsert('C(')}
              className="h-9 rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80"
              title="Combination C(n,r)"
            >
              C(n,r)
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('P(')}
              className="h-9 rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80"
              title="Permutation P(n,r)"
            >
              P(n,r)
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('!')}
              className="h-9 rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/80"
              title="Factorial"
            >
              n!
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert(',')}
              className="h-9 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              ,
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('{')}
              className="h-9 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              {'{'}
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('}')}
              className="h-9 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              {'}'}
            </button>
          </div>

          {/* Standard Numeric & Operators Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* Row 1 */}
            <button
              type="button"
              onClick={() => handleKeypadInsert('(')}
              className="h-9 rounded-lg bg-slate-100 font-mono text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              (
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert(')')}
              className="h-9 rounded-lg bg-slate-100 font-mono text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              )
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-9 rounded-lg bg-rose-50 font-mono text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
              title="ลบตัวอักษร"
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('/')}
              className="h-9 rounded-lg bg-amber-100 font-mono text-sm font-bold text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
              title="หาร"
            >
              ÷
            </button>

            {/* Row 2 */}
            <button
              type="button"
              onClick={() => handleKeypadInsert('7')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('8')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('9')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('*')}
              className="h-9 rounded-lg bg-amber-100 font-mono text-sm font-bold text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
              title="คูณ"
            >
              ×
            </button>

            {/* Row 3 */}
            <button
              type="button"
              onClick={() => handleKeypadInsert('4')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('5')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('6')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('-')}
              className="h-9 rounded-lg bg-amber-100 font-mono text-sm font-bold text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
              title="ลบ"
            >
              −
            </button>

            {/* Row 4 */}
            <button
              type="button"
              onClick={() => handleKeypadInsert('1')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('2')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('3')}
              className="h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('+')}
              className="h-9 rounded-lg bg-amber-100 font-mono text-sm font-bold text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
              title="บวก"
            >
              +
            </button>

            {/* Row 5 */}
            <button
              type="button"
              onClick={handleClear}
              className="h-9 rounded-lg bg-slate-200/80 font-mono text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
            >
              AC
            </button>
            <button
              type="button"
              onClick={() => handleKeypadInsert('0')}
              className="col-span-2 h-9 rounded-lg bg-slate-50 font-mono text-xs font-semibold text-slate-800 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => calculate(expr)}
              className="h-9 rounded-lg bg-indigo-600 font-mono text-sm font-bold text-white hover:bg-indigo-700 dark:bg-indigo-500"
              title="หาคำตอบ"
            >
              =
            </button>
          </div>
        </div>
      </section>

      {/* Right Column: Results & Hand Calculation Cancellation Visualizer */}
      <div className="space-y-4">
        {result ? (
          <>
            {/* Final Answer Hero Card */}
            <section className="rounded-2xl border border-indigo-100 bg-linear-to-br from-white via-indigo-50/30 to-indigo-100/20 p-4 shadow-sm dark:border-indigo-950/60 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 sm:p-5">
              <div className="flex items-center justify-between gap-2 border-b border-indigo-100/70 pb-3 dark:border-indigo-950/60">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    คำตอบสุดท้าย
                  </Badge>
                  <span className="font-mono text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                    {result.original}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 gap-1 px-2 text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-400"
                >
                  {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </Button>
              </div>

              <div className="py-4 text-center">
                <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-indigo-900 dark:text-indigo-200 break-all">
                  {result.finalValueString}
                </div>

                {/* Additional Badges for Probability / Fraction */}
                {result.isFraction && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    {result.isReduced && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        <Check className="size-3" /> ตัดทอนเป็นเศษส่วนอย่างต่ำแล้ว
                      </span>
                    )}
                    {result.decimalString && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Divide className="size-3 text-slate-500" /> ≈ {result.decimalString}
                      </span>
                    )}
                    {result.percentageString && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        <Percent className="size-3" /> {result.percentageString}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 1. Direct Factorial Quotient Cancellation (e.g. 10! / (7! * 3!) or single C/P) */}
            {result.topLevelCancellation && (
              <section className="space-y-3">
                <div className="rounded-2xl border border-indigo-200/80 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-indigo-900/60 dark:bg-slate-900/90 sm:p-5">
                  <div className="mb-3 flex items-center justify-between border-b border-indigo-100 pb-2.5 dark:border-indigo-950/60">
                    <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                      การตัดทอนในรูปแฟกทอเรียล (Factorial Cancellation)
                    </h3>
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      {result.topLevelCancellation.formulaLaTeX}
                    </span>
                  </div>
                  <CancellationVisualizer cancellation={result.topLevelCancellation} />
                </div>
              </section>
            )}

            {/* 2. Factorial Cancellation for Subterms (e.g. C(30,3), C(25,3), C(5,2)) */}
            {!result.topLevelCancellation && visualizableTerms.length > 0 && (
              <section className="rounded-2xl border border-indigo-200/80 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-indigo-900/60 dark:bg-slate-900/90 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-2.5 dark:border-indigo-950/60">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      การตัดทอนในรูปแฟกทอเรียล (Factorial Cancellation)
                    </h3>
                  </div>

                  {/* Selector Pills when multiple subterms exist */}
                  {visualizableTerms.length > 1 && (
                    <div className="flex flex-wrap gap-1.5">
                      {visualizableTerms.map((term, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedTermIndex(idx)}
                          className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                            safeIndex === idx
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {term.raw}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activeTerm?.detailedCancellation && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50/60 px-3 py-2 text-xs font-mono dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                        {activeTerm.detailedCancellation.formulaLaTeX}
                      </span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        = {formatBigInt(activeTerm.value)}
                      </span>
                    </div>
                    <CancellationVisualizer cancellation={activeTerm.detailedCancellation} />
                  </div>
                )}
              </section>
            )}

            {/* 3. Substituted Expression & Final Fraction Reduction */}
            <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 pb-2 dark:border-slate-800/80">
                ขั้นตอนการแทนค่าและตัดทอนเศษส่วนผลลัพธ์
              </h3>

              {/* Substituted Expression */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  1. แทนค่าผลลัพธ์ลงในนิพจน์:
                </span>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 font-mono text-xs text-indigo-950 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-200 break-all leading-relaxed">
                  {result.substitutedExpression}
                </div>
              </div>

              {/* Fraction Reduction Step (if fraction) */}
              {result.isFraction && result.cancellationStep && (
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <Divide className="size-3.5" /> 2. การตัดทอนเศษส่วนผลลัพธ์ (ห.ร.ม. = {formatBigInt(result.gcd || 1n)}):
                  </span>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl p-3">
                    {/* Before Reduction */}
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-slate-400 mb-1">ก่อนตัดทอน</span>
                      <div className="font-mono text-base font-bold text-slate-700 dark:text-slate-300 text-center">
                        <div className="px-2 pb-0.5 border-b-2 border-slate-400">
                          {formatBigInt(result.numeratorRaw!)}
                        </div>
                        <div className="px-2 pt-0.5">
                          {formatBigInt(result.denominatorRaw!)}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="size-4 text-emerald-500 hidden sm:block" />

                    {/* Strike-through with quotient above/below */}
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                        หารด้วย {formatBigInt(result.gcd!)}
                      </span>
                      <div className="font-mono text-base text-center">
                        <div className="relative px-3 pb-1 border-b-2 border-slate-500">
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatBigInt(result.numeratorReduced!)}
                          </span>
                          <span className="line-through text-slate-400 dark:text-slate-500 decoration-rose-500 decoration-2">
                            {formatBigInt(result.numeratorRaw!)}
                          </span>
                        </div>
                        <div className="relative px-3 pt-1">
                          <span className="line-through text-slate-400 dark:text-slate-500 decoration-rose-500 decoration-2">
                            {formatBigInt(result.denominatorRaw!)}
                          </span>
                          <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatBigInt(result.denominatorReduced!)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono text-xl font-bold text-slate-400">=</span>

                    {/* Final Reduced Fraction */}
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                        เศษส่วนอย่างต่ำ
                      </span>
                      <div className="font-mono text-base font-extrabold text-indigo-700 dark:text-indigo-300 text-center bg-indigo-50/70 dark:bg-indigo-950/50 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="pb-0.5 border-b border-indigo-400">
                          {formatBigInt(result.numeratorReduced!)}
                        </div>
                        <div className="pt-0.5">
                          {formatBigInt(result.denominatorReduced!)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                    💡 {result.cancellationStep.explanation}
                  </p>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/30">
            <div className="space-y-2">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Calculator className="size-6" />
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                พร้อมคำนวณและตัดทอนเศษส่วน
              </h3>
              <p className="mx-auto max-w-xs text-xs text-slate-500 dark:text-slate-400">
                พิมพ์นิพจน์ทางซ้าย เช่น <code className="font-mono font-semibold text-indigo-600">{'{C30,3 - C25,3} / C30,3'}</code> หรือเลือกตัวอย่างโจทย์
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
