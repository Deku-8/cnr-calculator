'use client';

import { Sigma, Shuffle, ListOrdered, Calculator, Layers } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export type Mode = 'combination' | 'permutation' | 'multiset' | 'factorial' | 'expression';

const modes = [
  {
    value: 'combination',
    label: 'Combination',
    symbol: 'C(n, r)',
    icon: Sigma,
  },
  {
    value: 'permutation',
    label: 'Permutation',
    symbol: 'P(n, r)',
    icon: Shuffle,
  },
  {
    value: 'multiset',
    label: 'ของซ้ำ',
    symbol: 'n!/∏nᵢ!',
    icon: Layers,
  },
  {
    value: 'factorial',
    label: 'Factorial',
    symbol: 'n!',
    icon: ListOrdered,
  },
  {
    value: 'expression',
    label: 'เครื่องคิดเลข',
    symbol: 'f(C, P, !)',
    icon: Calculator,
  },
] as const;

export function ModeTabs() {
  return (
    <TabsList
      aria-label="เลือกประเภทการคำนวณ"
      className="grid w-full grid-cols-2 gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 dark:bg-slate-900/80 sm:grid-cols-5"
    >
      {modes.map(({ value, label, symbol, icon: Icon }) => (
        <TabsTrigger
          key={value}
          value={value}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:text-slate-900 data-active:bg-white data-active:text-indigo-600 data-active:shadow-xs dark:text-slate-400 dark:hover:text-slate-200 dark:data-active:bg-slate-800 dark:data-active:text-indigo-300 sm:text-xs ${
            value === 'expression' ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <Icon className="size-3.5 shrink-0" />
          <span>{label}</span>
          <span className="font-mono text-[10px] font-normal opacity-60 hidden md:inline">
            {symbol}
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
