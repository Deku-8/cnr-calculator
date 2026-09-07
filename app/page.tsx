'use client';

export const dynamic = 'force-static';

import { useEffect, useState } from 'react';
import { Moon, Sun, Shapes, Calculator, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CalculatorForm, type CalculatorMode, type Values } from '@/components/calculator/CalculatorForm';
import { FormulaSteps } from '@/components/calculator/FormulaSteps';
import { ModeTabs, type Mode } from '@/components/calculator/ModeTabs';
import { ResultCard } from '@/components/calculator/ResultCard';
import { RealWorldScenarios, type Scenario } from '@/components/calculator/RealWorldScenarios';
import { FormulaComparison } from '@/components/calculator/FormulaComparison';
import { PracticeTrainer } from '@/components/calculator/PracticeTrainer';
import { ExpressionCalculator } from '@/components/calculator/ExpressionCalculator';
import type { Calculation } from '@/lib/combinatorics';

const modeHeaders: Record<
  Mode,
  { title: string; hint: string }
> = {
  combination: {
    title: 'Combination',
    hint: 'เลือกกลุ่มสิ่งของโดยไม่สนใจลำดับ C(n,r)',
  },
  permutation: {
    title: 'Permutation',
    hint: 'จัดเรียงสิ่งของโดยสนใจลำดับ P(n,r) (กรณี r ≠ n เพราะถ้า r = n จะซ้ำกับ n!)',
  },
  multiset: {
    title: 'การเรียงสับเปลี่ยนของซ้ำ',
    hint: 'n! / (n₁! × n₂! × … × nₖ!)',
  },
  factorial: {
    title: 'Factorial',
    hint: 'สลับที่สิ่งของทั้งหมด n!',
  },
  expression: {
    title: 'เครื่องคิดเลข',
    hint: 'คำนวณหลายพจน์ ตัดทอนแฟกทอเรียล และหาความน่าจะเป็น',
  },
};

export default function Home() {
  const [mode, setMode] = useState<Mode>('combination');
  const [result, setResult] = useState<Calculation | null>(null);
  const [presetValues, setPresetValues] = useState<Partial<Values>>({});
  const [presetMultisetCounts, setPresetMultisetCounts] = useState<number[] | undefined>();
  const [presetMultisetLabels, setPresetMultisetLabels] = useState<string[] | undefined>();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [showPractice, setShowPractice] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const context = (document as unknown as { modelContext?: { registerTool?: (tool: unknown, opts: unknown) => Promise<unknown> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: 'select_calculation_mode',
          title: 'เลือกประเภทการคำนวณ',
          description:
            'เปิดแบบคำนวณ Combination, Permutation, Multiset, Factorial หรือ เครื่องคิดเลข บนหน้าจอ',
          inputSchema: {
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                enum: ['combination', 'permutation', 'multiset', 'factorial', 'expression'],
              },
            },
            required: ['mode'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input: unknown) {
            const requested = (input as { mode?: string })?.mode;
            if (!['combination', 'permutation', 'multiset', 'factorial', 'expression'].includes(requested ?? '')) {
              throw new Error('ประเภทการคำนวณไม่ถูกต้อง');
            }
            setMode(requested as Mode);
            setResult(null);
            return { mode: requested, status: 'selected' };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  function handleSelectScenario(scenario: Scenario) {
    setMode(scenario.mode);
    setPresetValues(scenario.values);
    setPresetMultisetCounts(scenario.multisetCounts);
    setPresetMultisetLabels(scenario.multisetLabels);
    setSelectedScenarioId(scenario.id);
  }

  function handleClearScenario() {
    setSelectedScenarioId(null);
  }

  function handleLoadQuestion(
    qMode: Mode,
    values: Partial<Values>,
    multisetCounts?: number[],
    multisetLabels?: string[],
  ) {
    setMode(qMode);
    setPresetValues(values);
    setPresetMultisetCounts(multisetCounts);
    setPresetMultisetLabels(multisetLabels);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),rgba(15,23,42,0))] px-3.5 py-4 sm:px-6 sm:py-7 lg:px-8 pb-20 sm:pb-8">
      <div className="mx-auto max-w-5xl space-y-3.5 sm:space-y-5">
        {/* Minimalist Header (Clean 2-row on mobile, 1-row on tablet/PC) */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 border-b border-slate-200/70 pb-3.5 sm:pb-4 dark:border-slate-800/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="grid size-9 sm:size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 shrink-0">
                <Shapes aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Combinatorics & Cancellation
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  คำนวณและแสดงขั้นตอนการตัดทอนตามหลักคณิตศาสตร์
                </p>
              </div>
            </div>

            {/* Mobile dark mode toggle in top row */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDark((value) => !value)}
                aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
                className="size-8 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs"
              >
                {dark ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5 text-slate-700" />}
              </Button>
            </div>
          </div>

          {/* Action buttons (full width row on mobile, inline on desktop) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={showPractice ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowPractice((prev) => !prev)}
              className={`h-8 flex-1 sm:flex-none gap-1.5 rounded-xl text-xs font-semibold shadow-xs ${
                showPractice
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500'
                  : 'text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}
            >
              <Target className="size-3.5 shrink-0" />
              <span>{showPractice ? 'ซ่อนแบบฝึกหัด' : 'ฝึกทำโจทย์'}</span>
            </Button>
            <FormulaComparison />
            <div className="hidden sm:block">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDark((value) => !value)}
                aria-label={dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
                className="size-8 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs"
              >
                {dark ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5 text-slate-700" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Practice Trainer Section (Toggleable) */}
        {showPractice && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <PracticeTrainer
              onLoadQuestion={handleLoadQuestion}
              onClose={() => setShowPractice(false)}
            />
          </div>
        )}

        {/* Real-World Scenarios Horizontal Pills */}
        <RealWorldScenarios
          selectedId={selectedScenarioId}
          onSelectScenario={handleSelectScenario}
          onClearScenario={handleClearScenario}
        />

        {/* Calculation Modes */}
        <Tabs
          value={mode}
          onValueChange={(value) => {
            setMode(value as Mode);
            setPresetValues({});
            setPresetMultisetCounts(undefined);
            setPresetMultisetLabels(undefined);
            setSelectedScenarioId(null);
          }}
          className="space-y-4"
        >
          <ModeTabs />

          {mode === 'expression' ? (
            <TabsContent value="expression" className="mt-0 focus-visible:outline-none">
              <ExpressionCalculator
                key={presetValues.expr || 'default-expr'}
                initialExpr={presetValues.expr}
              />
            </TabsContent>
          ) : (
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
              {/* Left Column: Form */}
              <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800/80">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {modeHeaders[mode].title}
                  </h2>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-mono text-right truncate max-w-[55%] sm:max-w-none">
                    {modeHeaders[mode].hint}
                  </span>
                </div>

                <TabsContent value={mode} className="mt-0 focus-visible:outline-none">
                  <CalculatorForm
                    key={mode}
                    mode={mode as CalculatorMode}
                    presetValues={presetValues}
                    presetMultisetCounts={presetMultisetCounts}
                    presetMultisetLabels={presetMultisetLabels}
                    onResult={setResult}
                  />
                </TabsContent>
              </section>

              {/* Right Column: Results & Interactive Steps */}
              <div className="space-y-4">
                {result ? (
                  <>
                    <ResultCard calculation={result} />
                    <FormulaSteps calculation={result} />
                  </>
                ) : (
                  <section className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/30">
                    <div className="space-y-2">
                      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                        <Calculator className="size-6" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        พร้อมแสดงวิธีทำและการตัดทอน
                      </h3>
                      <p className="mx-auto max-w-xs text-xs text-slate-500 dark:text-slate-400">
                        ใส่ตัวเลขทางซ้าย หรือเลือกตัวอย่างโจทย์ด้านบน
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </Tabs>

        {/* Minimal Footer */}
        <footer className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          คำนวณด้วย BigInt แม่นยำ 100% ไม่มีปัญหานัมเบอร์ล้นหรือการปัดเศษ
        </footer>
      </div>
    </main>
  );
}
