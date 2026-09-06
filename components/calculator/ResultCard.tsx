'use client';

import { useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Calculation } from '@/lib/combinatorics';

export function ResultCard({ calculation }: { calculation: Calculation }) {
  const [copied, setCopied] = useState(false);
  async function copySolution() {
    const text = `สูตรทั่วไป\n${calculation.general}\n\nแทนค่า\n${calculation.substituted}\n\nวิธีทำ\n${calculation.simplification}\n\nคำตอบ: ${calculation.answer}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return (
    <section aria-live="polite" className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/10 dark:border-indigo-700">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-indigo-100"><Sparkles aria-hidden="true" className="size-4" />คำตอบสุดท้าย</p>
            <p className="mt-2 text-sm text-indigo-100">{calculation.answerLabel}</p>
          </div>
          <Button onClick={copySolution} variant="secondary" className="h-10 bg-white/15 px-3 text-white hover:bg-white/25">
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span className="hidden sm:inline">{copied ? 'คัดลอกแล้ว' : 'คัดลอกวิธีทำ'}</span>
          </Button>
        </div>
        <div className="math-scroll mt-3 overflow-x-auto pb-2 font-mono text-3xl font-bold tracking-tight sm:text-4xl">{calculation.answer}</div>
        {calculation.note && <p className="mt-2 text-sm text-indigo-100">{calculation.note}</p>}
      </div>
    </section>
  );
}
