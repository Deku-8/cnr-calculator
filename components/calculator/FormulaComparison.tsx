'use client';

import { useState } from 'react';
import { HelpCircle, ArrowRight, Check, BookOpen, Shuffle, Sigma, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function FormulaComparison() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/70 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 cursor-pointer shrink-0">
        <HelpCircle className="size-3.5 shrink-0" />
        <span className="hidden sm:inline">เมื่อไหร่ควรใช้ C(n,r) หรือ P(n,r)?</span>
        <span className="sm:hidden">เมื่อไหร่ใช้ C vs P?</span>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90dvh] sm:max-h-[85dvh] flex flex-col p-0 overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
      >
        {/* Sticky Header with Title and Touch-Friendly Close Button */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 sm:px-6 sm:py-4 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <BookOpen className="size-4.5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                เปรียบเทียบ Combination vs Permutation
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                เข้าใจความแตกต่างใน 1 นาที และหลักการตัดทอน
              </p>
            </div>
          </div>

          {/* Dedicated Easy-to-Tap Close Button */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="size-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white shrink-0 cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="size-4.5" />
          </Button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm math-scroll">
          {/* Side by side comparison cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Combination Card */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div className="mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <Sigma className="size-5" />
                <h4 className="font-bold text-base">Combination C(n, r)</h4>
              </div>
              <p className="font-mono text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                สูตร: n! / [r!(n − r)!]
              </p>
              <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <Check className="size-3.5" /> <strong>ไม่สนใจลำดับ</strong> (Order does NOT matter)
                </p>
                <p>• เลือกกลุ่มคน คณะกรรมการ ตัวแทน</p>
                <p>• การหยิบไพ่บนมือ, เลือกผลไม้ลงตะกร้า</p>
                <p className="rounded-lg bg-white/70 p-2 dark:bg-slate-900/50 font-mono">
                  เลือก A กับ B = เลือก B กับ A (นับเป็น 1 แบบ)
                </p>
              </div>
            </div>

            {/* Permutation Card */}
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/30">
              <div className="mb-2 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <Shuffle className="size-5" />
                <h4 className="font-bold text-base">Permutation P(n, r)</h4>
              </div>
              <p className="font-mono text-xs font-semibold text-cyan-900 dark:text-cyan-200">
                สูตร: n! / (n − r)!
              </p>
              <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5 font-medium text-indigo-700 dark:text-indigo-400">
                  <Check className="size-3.5" /> <strong>สนใจลำดับ</strong> (Order matters)
                </p>
                <p>• จัดตำแหน่ง ประธาน/รองประธาน/เลขานุการ</p>
                <p>• รหัสผ่าน PIN, การเข้าเส้นชัยอันดับ 1-2-3</p>
                <p className="text-[11px] font-semibold text-cyan-800 dark:text-cyan-300">
                  • ใช้กรณี r ≠ n (เพราะถ้า r = n จะซ้ำกับ Factorial n!)
                </p>
                <p className="rounded-lg bg-white/70 p-2 dark:bg-slate-900/50 font-mono">
                  AB ต่างจาก BA อย่างสิ้นเชิง (นับเป็น 2 แบบ)
                </p>
              </div>
            </div>
          </div>

          {/* Mathematical Connection */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ArrowRight className="size-4 text-indigo-600 dark:text-indigo-400" />
              ความสัมพันธ์ระหว่างทั้งสองสูตร
            </h5>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              สูตรของ Permutation จะมีค่ามากกว่า Combination เสมอ โดยมีความสัมพันธ์คือ:
            </p>
            <div className="mt-2 rounded-xl bg-white p-3 text-center font-mono font-bold text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-400">
              P(n, r) = C(n, r) × r!
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              เพราะในการทำ Combination เราเลือกของมาก่อน จากนั้นถ้าเรานำของ r ชิ้นนั้นมา “สลับที่กันเอง” อีก r! วิธี ก็จะได้จำนวนวิธีของ Permutation พอดี!
            </p>
          </div>
        </div>

        {/* Sticky Bottom Close Button */}
        <div className="border-t border-slate-100 px-4 py-3 sm:px-6 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/70 backdrop-blur-sm shrink-0 flex items-center justify-end">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto h-9 font-semibold text-xs px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
          >
            ปิดหน้าต่าง (เข้าใจแล้ว)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
