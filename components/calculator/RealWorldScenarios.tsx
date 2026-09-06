'use client';

import { useState } from 'react';
import { Trophy, Lock, BookOpen, Layers, Dices, Users, Utensils, X, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Mode } from './ModeTabs';

export type Scenario = {
  id: string;
  title: string;
  shortLabel: string;
  icon: typeof Trophy;
  mode: Mode;
  values: { n?: string; r?: string; a?: string; b?: string; c?: string; expr?: string };
  multisetCounts?: number[];
  multisetLabels?: string[];
  mathBadge: string;
  description: string;
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'poker',
    title: 'แจกไพ่โป๊กเกอร์',
    shortLabel: 'ไพ่โป๊กเกอร์',
    icon: Dices,
    mode: 'combination',
    values: { n: '52', r: '5' },
    mathBadge: 'C(52, 5)',
    description: 'เลือก 5 ใบจากสำรับ 52 ใบ ลำดับที่หยิบไม่มีผลต่อหน้าไพ่ในมือ',
  },
  {
    id: 'football',
    title: 'เลือกนักเตะตัวจริง',
    shortLabel: 'ทีมฟุตบอล',
    icon: Users,
    mode: 'combination',
    values: { n: '18', r: '11' },
    mathBadge: 'C(18, 11)',
    description: 'คัดเลือกผู้เล่น 11 คนจาก 18 คนลงสนาม ไม่สนใจลำดับที่เรียก',
  },
  {
    id: 'pizza',
    title: 'ท็อปปิ้งพิซซ่า',
    shortLabel: 'หน้าพิซซ่า',
    icon: Utensils,
    mode: 'combination',
    values: { n: '10', r: '3' },
    mathBadge: 'C(10, 3)',
    description: 'เลือก 3 ท็อปปิ้งโปรดจาก 10 อย่าง หน้าไหนลงก่อนหลังได้ผลลัพธ์เหมือนกัน',
  },
  {
    id: 'pin',
    title: 'รหัสผ่าน PIN 4 หลัก',
    shortLabel: 'รหัส PIN',
    icon: Lock,
    mode: 'permutation',
    values: { n: '10', r: '4' },
    mathBadge: 'P(10, 4)',
    description: 'รหัส 4 หลักจากเลข 0-9 ไม่ซ้ำกัน ลำดับของตัวเลขมีความสำคัญ',
  },
  {
    id: 'podium',
    title: 'เหรียญทอง-เงิน-ทองแดง',
    shortLabel: 'มอบรางวัล',
    icon: Trophy,
    mode: 'permutation',
    values: { n: '8', r: '3' },
    mathBadge: 'P(8, 3)',
    description: 'แข่งขัน 8 คน มอบรางวัลอันดับ 1, 2, 3 ตามลำดับเข้าเส้นชัย',
  },
  {
    id: 'bookshelf',
    title: 'จัดเรียงหนังสือ 7 เล่ม',
    shortLabel: 'จัดหนังสือ',
    icon: BookOpen,
    mode: 'factorial',
    values: { n: '7' },
    mathBadge: '7!',
    description: 'สลับที่หนังสือต่างกัน 7 เล่มบนหิ้งจากซ้ายไปขวา',
  },
  {
    id: 'multiset-statistics',
    title: 'สลับอักษร STATISTICS',
    shortLabel: 'ของซ้ำ STATISTICS',
    icon: Layers,
    mode: 'multiset',
    values: {},
    multisetCounts: [3, 3, 2, 1, 1],
    multisetLabels: ['S', 'T', 'I', 'A', 'C'],
    mathBadge: '10! / (3! × 3! × 2!)',
    description: 'จัดเรียงอักษร S:3, T:3, I:2, A:1, C:1 รวม 10 ตัวที่มีของซ้ำ',
  },
  {
    id: 'expression-probability',
    title: 'ความน่าจะเป็นหยิบของ',
    shortLabel: 'ความน่าจะเป็น',
    icon: Dices,
    mode: 'expression',
    values: { expr: '{C30,3 - C25,3} / C30,3' },
    mathBadge: '{C30,3-C25,3}/C30,3',
    description: 'คำนวณความน่าจะเป็นพร้อมตัดทอนเศษส่วนเสมือนคิดมือ',
  },
];

export function RealWorldScenarios({
  selectedId,
  onSelectScenario,
  onClearScenario,
}: {
  selectedId?: string | null;
  onSelectScenario: (scenario: Scenario) => void;
  onClearScenario?: () => void;
}) {
  const activeScenario = SCENARIOS.find((s) => s.id === selectedId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="size-3.5 text-indigo-500" />
          ตัวอย่างโจทย์ในชีวิตจริง:
        </span>
        <span className="text-[11px] opacity-70 hidden sm:inline">คลิกเพื่อลองคำนวณ</span>
      </div>

      {/* Sleek Horizontal Scrollable Scenario Pills */}
      <div className="math-scroll flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
        {SCENARIOS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectScenario(item)}
              className={`group flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/70 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                  : 'border-slate-200/90 bg-white/90 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className={`size-3.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 group-hover:text-indigo-500'}`} />
              <span>{item.shortLabel}</span>
              <span className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${isSelected ? 'bg-indigo-200/70 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {item.mathBadge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clean, Subtle Context Ribbon when a scenario is active */}
      {activeScenario && (
        <div className="animate-in fade-in slide-in-from-top-1 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold shrink-0">{activeScenario.title}:</span>
            <span className="text-slate-600 dark:text-slate-300 truncate">{activeScenario.description}</span>
          </div>
          {onClearScenario && (
            <button
              type="button"
              onClick={onClearScenario}
              className="shrink-0 rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="ปิดคำอธิบายตัวอย่าง"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
