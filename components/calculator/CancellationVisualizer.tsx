'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  DetailedCancellation,
  CancellationStep,
  ColorKey,
} from '@/lib/cancellation';

const colorStyles: Record<
  ColorKey,
  {
    bg: string;
    text: string;
    border: string;
    line: string;
    glow: string;
    badge: string;
  }
> = {
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-300 dark:border-sky-700',
    line: 'bg-sky-500',
    glow: 'ring-sky-400/50',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border-sky-300 dark:border-sky-700',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    line: 'bg-emerald-500',
    glow: 'ring-emerald-400/50',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    line: 'bg-amber-500',
    glow: 'ring-amber-400/50',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-300 dark:border-violet-700',
    line: 'bg-violet-500',
    glow: 'ring-violet-400/50',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200 border-violet-300 dark:border-violet-700',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-700',
    line: 'bg-teal-500',
    glow: 'ring-teal-400/50',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border-teal-300 dark:border-teal-700',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
    line: 'bg-rose-500',
    glow: 'ring-rose-400/50',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300 dark:border-rose-700',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-700',
    line: 'bg-indigo-500',
    glow: 'ring-indigo-400/50',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
  },
  fuchsia: {
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    border: 'border-fuchsia-300 dark:border-fuchsia-700',
    line: 'bg-fuchsia-500',
    glow: 'ring-fuchsia-400/50',
    badge: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/60 dark:text-fuchsia-200 border-fuchsia-300 dark:border-fuchsia-700',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-300 dark:border-cyan-700',
    line: 'bg-cyan-500',
    glow: 'ring-cyan-400/50',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    line: 'bg-orange-500',
    glow: 'ring-orange-400/50',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border-orange-300 dark:border-orange-700',
  },
};

type VisualTermState = {
  original: number;
  current: number;
  isCanceled: boolean;
  colorKey?: ColorKey;
  lastChangedStep?: number;
};

export function CancellationVisualizer({
  cancellation,
}: {
  cancellation: DetailedCancellation;
}) {
  const totalSteps = cancellation.steps.length;
  const [currentStep, setCurrentStep] = useState<number>(totalSteps);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredColor, setHoveredColor] = useState<ColorKey | null>(null);

  useEffect(() => {
    setCurrentStep(totalSteps);
    setIsPlaying(false);
  }, [cancellation, totalSteps]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev + 1 >= totalSteps) {
          setIsPlaying(false);
          return totalSteps;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps]);

  const { numTerms, denTerms, activeStepObj } = useMemo(() => {
    const num: VisualTermState[] = cancellation.initialNumeratorFactors.map((val) => ({
      original: val,
      current: val,
      isCanceled: false,
    }));

    const den: VisualTermState[] = cancellation.initialDenominatorFactors.map((val) => ({
      original: val,
      current: val,
      isCanceled: false,
    }));

    let activeStep: CancellationStep | null = null;

    for (let i = 0; i < currentStep; i++) {
      const step = cancellation.steps[i];
      if (!step) continue;

      if (i === currentStep - 1) {
        activeStep = step;
      }

      if (step.type === 'factor' && step.numIndex !== undefined && step.denIndex !== undefined) {
        const color = step.colorKey as ColorKey;
        num[step.numIndex] = {
          ...num[step.numIndex],
          current: step.numAfter ?? num[step.numIndex].current,
          isCanceled: true,
          colorKey: color,
          lastChangedStep: i,
        };
        den[step.denIndex] = {
          ...den[step.denIndex],
          current: step.denAfter ?? den[step.denIndex].current,
          isCanceled: true,
          colorKey: color,
          lastChangedStep: i,
        };
      }
    }

    return { numTerms: num, denTerms: den, activeStepObj: activeStep };
  }, [cancellation, currentStep]);

  const hasFactorialCancel =
    cancellation.hasFactorialCancellation && cancellation.canceledFactorial !== undefined;
  const isFinished = currentStep === totalSteps;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
      {/* Sleek Top Bar with Step Counter & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800/70">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            การตัดทอนเศษส่วน
          </span>
          {totalSteps > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {currentStep} / {totalSteps}
            </span>
          )}
        </div>

        {totalSteps > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
              disabled={currentStep === 0}
              className="size-7 text-slate-500"
              title="เริ่มใหม่"
            >
              <RotateCcw className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((p) => Math.max(0, p - 1));
              }}
              disabled={currentStep === 0}
              className="size-7 text-slate-500"
              title="ย้อนกลับ"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (currentStep >= totalSteps) {
                  setCurrentStep(0);
                  setIsPlaying(true);
                } else {
                  setIsPlaying((prev) => !prev);
                }
              }}
              className="h-7 px-2.5 text-xs font-medium"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-1 size-3" /> หยุด
                </>
              ) : (
                <>
                  <Play className="mr-1 size-3" /> {currentStep >= totalSteps ? 'เล่นซ้ำ' : 'เล่น'}
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((p) => Math.min(totalSteps, p + 1));
              }}
              disabled={currentStep >= totalSteps}
              className="size-7 text-slate-500"
              title="ถัดไป"
            >
              <ChevronRight className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(totalSteps);
              }}
              className="h-7 px-2 text-[11px] text-indigo-600 dark:text-indigo-400"
            >
              <Layers className="mr-1 size-3" /> ทั้งหมด
            </Button>
          </div>
        )}
      </div>

      {/* Main Clean Fraction Display Canvas */}
      <div className="math-scroll relative overflow-x-auto rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex min-w-max items-center justify-start sm:justify-center gap-2.5 sm:gap-3 py-2 sm:py-3 px-1">
          <span className="font-mono text-xl font-bold text-slate-400 dark:text-slate-500">
            =
          </span>

          {/* Fraction Block */}
          <div className="inline-flex flex-col items-center">
            {/* Numerator */}
            <div className="flex items-center gap-1.5 sm:gap-2 pb-2 pt-5 font-mono text-sm sm:text-base md:text-lg font-semibold">
              {numTerms.map((term, idx) => {
                const color = term.colorKey ? colorStyles[term.colorKey] : null;
                const isHovered = term.colorKey && hoveredColor === term.colorKey;
                const isRecent = term.lastChangedStep === currentStep - 1;

                return (
                  <div key={`num-${idx}`} className="flex items-center gap-2">
                    <div
                      onMouseEnter={() => term.colorKey && setHoveredColor(term.colorKey)}
                      onMouseLeave={() => setHoveredColor(null)}
                      className={`relative inline-flex items-center justify-center px-1.5 py-0.5 rounded transition-all ${
                        isHovered ? 'ring-2 ' + (color?.glow ?? '') : ''
                      } ${isRecent ? 'animate-pulse' : ''}`}
                    >
                      {term.isCanceled && (
                        <span
                          className={`absolute -top-5 left-1/2 -translate-x-1/2 rounded px-1 py-0.2 text-[10px] font-bold ${
                            color?.badge ?? 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {term.current}
                        </span>
                      )}
                      <span
                        className={
                          term.isCanceled
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100 font-bold'
                        }
                      >
                        {term.original}
                      </span>
                      {term.isCanceled && (
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-x-0 h-0.5 -rotate-12 rounded-full ${
                            color?.line ?? 'bg-rose-500'
                          }`}
                        />
                      )}
                    </div>
                    {idx < numTerms.length - 1 && (
                      <span className="text-slate-400 select-none">×</span>
                    )}
                  </div>
                );
              })}

              {hasFactorialCancel && (
                <>
                  <span className="text-slate-400 select-none">×</span>
                  <div className="relative inline-flex items-center justify-center px-2 py-0.5 rounded text-rose-700 dark:text-rose-300">
                    <span className="text-slate-400 dark:text-slate-500">
                      {cancellation.canceledFactorial}!
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 h-0.5 -rotate-12 bg-rose-500 rounded-full"
                    />
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                      ตัดออก
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Fraction Line */}
            <div className="h-0.5 w-full rounded-full bg-slate-700 dark:bg-slate-300" />

            {/* Denominator */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-2 pb-5 font-mono text-sm sm:text-base md:text-lg font-semibold">
              {denTerms.map((term, idx) => {
                const color = term.colorKey ? colorStyles[term.colorKey] : null;
                const isHovered = term.colorKey && hoveredColor === term.colorKey;
                const isRecent = term.lastChangedStep === currentStep - 1;

                return (
                  <div key={`den-${idx}`} className="flex items-center gap-2">
                    <div
                      onMouseEnter={() => term.colorKey && setHoveredColor(term.colorKey)}
                      onMouseLeave={() => setHoveredColor(null)}
                      className={`relative inline-flex items-center justify-center px-1.5 py-0.5 rounded transition-all ${
                        isHovered ? 'ring-2 ' + (color?.glow ?? '') : ''
                      } ${isRecent ? 'animate-pulse' : ''}`}
                    >
                      <span
                        className={
                          term.isCanceled
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100 font-bold'
                        }
                      >
                        {term.original}
                      </span>
                      {term.isCanceled && (
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-x-0 h-0.5 -rotate-12 rounded-full ${
                            color?.line ?? 'bg-rose-500'
                          }`}
                        />
                      )}
                      {term.isCanceled && (
                        <span
                          className={`absolute -bottom-5 left-1/2 -translate-x-1/2 rounded px-1 py-0.2 text-[10px] font-bold ${
                            color?.badge ?? 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {term.current}
                        </span>
                      )}
                    </div>
                    {idx < denTerms.length - 1 && (
                      <span className="text-slate-400 select-none">×</span>
                    )}
                  </div>
                );
              })}

              {hasFactorialCancel && (
                <>
                  <span className="text-slate-400 select-none">×</span>
                  <div className="relative inline-flex items-center justify-center px-2 py-0.5 rounded text-rose-700 dark:text-rose-300">
                    <span className="text-slate-400 dark:text-slate-500">
                      {cancellation.canceledFactorial}!
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 h-0.5 -rotate-12 bg-rose-500 rounded-full"
                    />
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                      ตัดออก
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Equality to Final Simplified Product */}
          {isFinished && (
            <div className="flex items-center gap-2 pl-2">
              <span className="font-mono text-xl font-bold text-slate-400 dark:text-slate-500">
                =
              </span>
              <div className="rounded-lg bg-indigo-50/80 px-2.5 py-1 font-mono text-sm font-semibold text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
                {cancellation.isInteger ? (
                  <span>
                    {cancellation.finalNumeratorFactors.filter((x) => x > 1).join(' × ') || '1'}
                    {' = '}
                    <strong className="text-indigo-600 dark:text-indigo-300">
                      {cancellation.finalAnswer}
                    </strong>
                  </span>
                ) : (
                  <span>
                    {cancellation.finalNumeratorFactors.join(' × ')} /{' '}
                    {cancellation.finalDenominatorFactors.join(' × ')} ={' '}
                    <strong className="text-indigo-600 dark:text-indigo-300">
                      {cancellation.finalAnswer}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Single-Line Clean Status Ticker */}
      {totalSteps > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
          {activeStepObj ? (
            <p className="truncate">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1">
                {activeStepObj.explanation}
              </span>
            </p>
          ) : currentStep === 0 ? (
            <p className="text-slate-500">
              กดปุ่ม <span className="font-semibold">เล่น</span> หรือ <span className="font-semibold">ถัดไป</span> เพื่อดูการตัดทอนทีละคู่
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3.5" /> ตัดทอนครบถ้วนแล้ว
            </p>
          )}
        </div>
      )}
    </div>
  );
}
