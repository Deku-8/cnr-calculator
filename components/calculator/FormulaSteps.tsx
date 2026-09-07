'use client';

import { useState } from 'react';
import type { Calculation } from '@/lib/combinatorics';
import {
  Code2,
  Eye,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CancellationVisualizer } from './CancellationVisualizer';

export function FormulaSteps({ calculation }: { calculation: Calculation }) {
  const [showLatex, setShowLatex] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);

  async function copyLatex() {
    if (!calculation.latexFormula && !calculation.detailedCancellation?.formulaLaTeX) return;
    const latex =
      calculation.latexFormula ||
      `${calculation.detailedCancellation?.formulaLaTeX} \\implies ${calculation.detailedCancellation?.substitutedLaTeX} = ${calculation.answer}`;
    await navigator.clipboard.writeText(latex);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 1800);
  }

  return (
    <section aria-labelledby="steps-heading" className="space-y-3">
      {/* Compact Header with Formula & LaTeX Toggle */}
      <div className="flex items-center justify-between">
        <h2 id="steps-heading" className="text-sm font-bold text-slate-800 dark:text-slate-200">
          วิธีทำและการตัดทอน
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLatex((prev) => !prev)}
          className="h-7 gap-1 px-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          {showLatex ? <Eye className="size-3.5" /> : <Code2 className="size-3.5" />}
          {showLatex ? 'ดูสมการ' : 'โค้ด LaTeX'}
        </Button>
      </div>

      {/* LaTeX Drawer (Only when toggled) */}
      {showLatex && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5 font-mono text-xs dark:border-indigo-900/60 dark:bg-indigo-950/40">
          <div className="mb-2 flex items-center justify-between text-indigo-700 dark:text-indigo-300">
            <span className="font-semibold text-[11px]">LaTeX Math Code:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLatex}
              className="h-6 gap-1 text-[10px] bg-white dark:bg-slate-900 px-2"
            >
              {copiedLatex ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
              {copiedLatex ? 'คัดลอกแล้ว' : 'คัดลอก'}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-white p-2.5 text-[11px] text-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {calculation.latexFormula ||
              `${calculation.detailedCancellation?.formulaLaTeX} \\\\\n${calculation.detailedCancellation?.substitutedLaTeX} = ${calculation.answer}`}
          </pre>
        </div>
      )}

      {/* Clean Unified Formula & Substitution Card */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 text-xs dark:border-slate-800/80 min-w-0">
          <span className="text-slate-500 dark:text-slate-400 shrink-0">สูตรที่ใช้:</span>
          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 break-all">{calculation.general}</span>
        </div>
        <div className="math-scroll w-full min-w-0 overflow-x-auto pt-2 font-mono text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 break-words">
          {calculation.substituted}
        </div>
      </div>

      {/* Main Interactive Cancellation Visualizer */}
      {calculation.detailedCancellation ? (
        <CancellationVisualizer cancellation={calculation.detailedCancellation} />
      ) : (
        <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="math-scroll w-full min-w-0 overflow-x-auto font-mono text-base text-slate-900 dark:text-slate-100">
            {calculation.simplification}
          </div>
        </div>
      )}
    </section>
  );
}
