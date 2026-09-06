'use client';

import { Sigma, Shuffle, ListOrdered, Divide } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export type Mode = 'combination' | 'permutation' | 'factorial' | 'quotient';

const modes = [
  { value: 'combination', label: 'Combination', symbol: 'C(n,r)', icon: Sigma },
  { value: 'permutation', label: 'Permutation', symbol: 'P(n,r)', icon: Shuffle },
  { value: 'factorial', label: 'Factorial', symbol: 'n!', icon: ListOrdered },
  { value: 'quotient', label: 'Factorial Quotient', symbol: 'n! / r!', icon: Divide },
] as const;

export function ModeTabs() {
  return (
    <TabsList aria-label="เลือกประเภทการคำนวณ" className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2 dark:bg-slate-900/70 lg:grid-cols-4">
      {modes.map(({ value, label, symbol, icon: Icon }) => (
        <TabsTrigger key={value} value={value} className="h-auto min-h-16 flex-col gap-0.5 rounded-xl px-3 py-2 data-active:bg-white data-active:text-indigo-700 data-active:shadow-sm dark:data-active:bg-slate-800 dark:data-active:text-indigo-300">
          <span className="flex items-center gap-1.5 text-sm font-semibold"><Icon aria-hidden="true" className="size-4" />{label}</span>
          <span className="font-mono text-xs opacity-70">{symbol}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
