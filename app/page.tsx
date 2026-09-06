'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Shapes, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { FormulaSteps } from '@/components/calculator/FormulaSteps';
import { ModeTabs, type Mode } from '@/components/calculator/ModeTabs';
import { ResultCard } from '@/components/calculator/ResultCard';
import type { Calculation } from '@/lib/combinatorics';

const descriptions: Record<Mode, { title: string; subtitle: string; accent: string }> = {
  combination: { title: 'Combination', subtitle: 'เลือกโดยไม่สนใจลำดับ', accent: 'bg-indigo-500' },
  permutation: { title: 'Permutation', subtitle: 'จัดเรียงโดยสนใจลำดับ', accent: 'bg-cyan-500' },
  factorial: { title: 'Factorial', subtitle: 'ผลคูณของจำนวนเต็มเรียงลงมา', accent: 'bg-amber-500' },
  quotient: { title: 'Factorial Quotient', subtitle: 'ตัดทอนแฟกทอเรียลอย่างเป็นขั้นตอน', accent: 'bg-emerald-500' },
};

export default function Home() {
  const [mode, setMode] = useState<Mode>('combination');
  const [result, setResult] = useState<Calculation | null>(null);
  const [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'select_calculation_mode',
      title: 'เลือกประเภทการคำนวณ',
      description: 'เปิดแบบคำนวณ Combination, Permutation, Factorial หรือ Factorial Quotient บนหน้าจอ',
      inputSchema: {
        type: 'object',
        properties: { mode: { type: 'string', enum: ['combination', 'permutation', 'factorial', 'quotient'] } },
        required: ['mode'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const requested = (input as { mode?: string })?.mode;
        if (!['combination', 'permutation', 'factorial', 'quotient'].includes(requested ?? '')) throw new Error('ประเภทการคำนวณไม่ถูกต้อง');
        setMode(requested as Mode);
        setResult(null);
        return { mode: requested, status: 'selected' };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(6,182,212,0.10),transparent_24%)] px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-start justify-between gap-5 sm:mb-8">
          <div className="flex gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 sm:size-12"><Shapes aria-hidden="true" className="size-6" /></span>
            <div><h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Combinatorics Calculator</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">เรียนรู้การนับอย่างเป็นระบบ พร้อมดูสูตร การแทนค่า และการตัดทอนทีละขั้น</p></div>
          </div>
          <Button variant="outline" size="icon-lg" onClick={() => setDark((value) => !value)} aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'} className="shrink-0 bg-white/80 dark:bg-slate-900/80">{dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</Button>
        </header>

        <Tabs value={mode} onValueChange={(value) => { setMode(value as Mode); setResult(null); }}>
          <ModeTabs />
          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-7">
              <div className="mb-6 flex items-center gap-3"><span className={`h-10 w-1.5 rounded-full ${descriptions[mode].accent}`} /><div><h2 className="text-xl font-bold">{descriptions[mode].title}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{descriptions[mode].subtitle}</p></div></div>
              {(['combination', 'permutation', 'factorial', 'quotient'] as Mode[]).map((tabMode) => <TabsContent key={tabMode} value={tabMode}><CalculatorForm key={tabMode} mode={tabMode} onResult={setResult} /></TabsContent>)}
            </section>

            <div className="space-y-5">
              {result ? <><FormulaSteps calculation={result} /><ResultCard calculation={result} /></> : (
                <section className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/55 p-8 text-center dark:border-slate-700 dark:bg-slate-900/35">
                  <div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"><Calculator aria-hidden="true" className="size-7" /></span><h2 className="mt-4 text-lg font-bold">พร้อมเริ่มคำนวณ</h2><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">กรอกค่าทางซ้าย หรือเลือกตัวอย่าง แล้วกด “คำนวณ” เพื่อดูวิธีทำอย่างละเอียด</p></div>
                </section>
              )}
            </div>
          </div>
        </Tabs>
        <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">คำนวณด้วยจำนวนเต็มแม่นยำ • ไม่มีการปัดเศษ</footer>
      </div>
    </main>
  );
}
