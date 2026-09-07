'use client';

import { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Calculation } from '@/lib/combinatorics';

export function ResultCard({ calculation }: { calculation: Calculation }) {
  const [copiedType, setCopiedType] = useState<'answer' | 'full' | 'latex' | null>(null);

  async function copyText(text: string, type: 'answer' | 'full' | 'latex') {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    window.setTimeout(() => setCopiedType(null), 1800);
  }

  function copyFullSolution() {
    const text = [
      `【วิธีทำการคำนวณและตัดทอน】`,
      `โจทย์: ${calculation.answerLabel}`,
      `สูตร: ${calculation.general}`,
      `แทนค่า: ${calculation.substituted}`,
      `ผลลัพธ์: ${calculation.answer}`,
      calculation.note ? `หมายเหตุ: ${calculation.note}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    copyText(text, 'full');
  }

  function copyLatex() {
    const latex =
      calculation.latexFormula ||
      `${calculation.detailedCancellation?.formulaLaTeX ?? ''} = ${calculation.answer}`;
    copyText(latex, 'latex');
  }

  return (
    <section
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 text-white shadow-md shadow-indigo-950/10 dark:border-indigo-800/80"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Answer Label & Number */}
        <div>
          <span className="text-xs font-medium text-indigo-100/90">
            {calculation.answerLabel}
          </span>
          <div className="math-scroll mt-0.5 overflow-x-auto font-mono text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {calculation.answer}
          </div>
        </div>

        {/* Compact Action Buttons */}
        <div className="flex items-center gap-1.5 self-center">
          <Button
            onClick={() => copyText(calculation.answer, 'answer')}
            variant="secondary"
            size="sm"
            className="h-8 gap-1 border border-white/20 bg-white/15 px-2.5 text-xs text-white hover:bg-white/25 backdrop-blur-sm"
          >
            {copiedType === 'answer' ? (
              <>
                <Check className="size-3.5 text-emerald-300" /> คัดลอกแล้ว
              </>
            ) : (
              <>
                <Copy className="size-3.5" /> คัดลอกคำตอบ
              </>
            )}
          </Button>

          <Button
            onClick={copyFullSolution}
            variant="secondary"
            size="sm"
            className="h-8 gap-1 border border-white/20 bg-white/15 px-2.5 text-xs text-white hover:bg-white/25 backdrop-blur-sm hidden sm:inline-flex"
            title="คัดลอกวิธีทำฉบับเต็ม"
          >
            {copiedType === 'full' ? (
              <>
                <Check className="size-3.5 text-emerald-300" /> คัดลอกแล้ว
              </>
            ) : (
              'วิธีทำ'
            )}
          </Button>

          <Button
            onClick={copyLatex}
            variant="secondary"
            size="sm"
            className="h-8 gap-1 border border-white/20 bg-white/15 px-2 text-xs text-white hover:bg-white/25 backdrop-blur-sm"
            title="คัดลอกสูตร LaTeX"
          >
            {copiedType === 'latex' ? (
              <Check className="size-3.5 text-emerald-300" />
            ) : (
              <Code2 className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {calculation.note && (
        <p className="mt-2 text-xs text-indigo-100/90 border-t border-white/10 pt-1.5">
          {calculation.note}
        </p>
      )}
    </section>
  );
}
