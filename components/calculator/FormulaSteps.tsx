import type { Calculation } from '@/lib/combinatorics';
import { ArrowDown, BookOpen, Braces, Scissors } from 'lucide-react';

const sections = [
  { key: 'general', label: '1. สูตรทั่วไป', icon: BookOpen },
  { key: 'substituted', label: '2. แทนค่าลงในสูตร', icon: Braces },
  { key: 'simplification', label: '3. ตัดทอนและคำนวณ', icon: Scissors },
] as const;

export function FormulaSteps({ calculation }: { calculation: Calculation }) {
  return (
    <section aria-labelledby="steps-heading" className="animate-in fade-in slide-in-from-bottom-2 space-y-3 duration-300">
      <h2 id="steps-heading" className="sr-only">ขั้นตอนการคำนวณ</h2>
      {sections.map(({ key, label, icon: Icon }, index) => (
        <div key={key}>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70 sm:p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Icon aria-hidden="true" className="size-4" /></span>
              {label}
            </div>
            <div className="math-scroll overflow-x-auto pb-1 font-mono text-base leading-8 text-slate-900 dark:text-slate-100 sm:text-lg">{calculation[key]}</div>
          </div>
          {index < sections.length - 1 && <ArrowDown aria-hidden="true" className="mx-auto my-1.5 size-4 text-slate-400" />}
        </div>
      ))}
    </section>
  );
}
