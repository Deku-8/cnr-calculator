'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Calculator,
  X,
  Trophy,
  Award,
  BookOpen,
  HelpCircle,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  type Question,
  type EvaluationResult,
  QUESTION_POOL,
  checkSubmission,
  getRandomSessionQuestions,
} from '@/lib/practice';
import type { Mode } from './ModeTabs';
import type { Values } from './CalculatorForm';
import { MathEquation } from './MathFraction';

const modeOptions: { mode: Mode; label: string; sub: string; formulaSample: string }[] = [
  { mode: 'combination', label: 'Combination', sub: 'ไม่สนใจลำดับ C(n,r)', formulaSample: 'C(n, r)' },
  { mode: 'permutation', label: 'Permutation', sub: 'สนใจลำดับ P(n,r) กรณี r ≠ n (เพราะถ้า r = n จะซ้ำกับ n!)', formulaSample: 'P(n, r)' },
  { mode: 'multiset', label: 'ของซ้ำ (Multiset)', sub: 'มีสิ่งของซ้ำกัน n!/∏nᵢ!', formulaSample: 'n! / ∏nᵢ!' },
  { mode: 'factorial', label: 'Factorial', sub: 'สลับที่ของทั้งหมด n!', formulaSample: 'n!' },
  { mode: 'expression', label: 'เครื่องคิดเลข', sub: 'หลายพจน์/ความน่าจะเป็น f(C,P,!)', formulaSample: 'f(C, P, !)' },
];

export interface UserAnswerRecord {
  question: Question;
  selectedMode: Mode;
  userDisplayString: string;
  isModeCorrect: boolean;
  isParamsCorrect: boolean;
  isCorrect: boolean;
}

export function PracticeTrainer({
  onLoadQuestion,
  onClose,
}: {
  onLoadQuestion: (
    mode: Mode,
    values: Partial<Values>,
    multisetCounts?: number[],
    multisetLabels?: string[],
  ) => void;
  onClose?: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>(() => getRandomSessionQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [nickname, setNickname] = useState('');

  // Parameter input states for step 2
  const [inputN, setInputN] = useState('');
  const [inputR, setInputR] = useState('');
  const [inputMultiset, setInputMultiset] = useState('');
  const [inputExpr, setInputExpr] = useState('');

  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswerRecord[]>([]);
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const question = questions[currentIndex];
  const correctCount = userAnswers.filter((a) => a.isCorrect).length;

  // ตรวจสอบว่าปุ่มตรวจคำตอบพร้อมใช้งานหรือไม่
  const isReadyToCheck = Boolean(
    selectedMode &&
      (selectedMode === 'combination'
        ? inputN.trim() && inputR.trim()
        : selectedMode === 'permutation'
        ? inputN.trim() && inputR.trim()
        : selectedMode === 'factorial'
        ? inputN.trim()
        : selectedMode === 'multiset'
        ? inputMultiset.trim()
        : selectedMode === 'expression'
        ? inputExpr.trim()
        : false),
  );

  function handleCheck() {
    if (!selectedMode || !question || !isReadyToCheck) return;
    setIsAnswered(true);

    const result = checkSubmission(
      {
        mode: selectedMode,
        n: inputN,
        r: inputR,
        multisetCounts: inputMultiset,
        expr: inputExpr,
      },
      question,
    );

    setCurrentResult(result);

    setUserAnswers((prev) => {
      const copy = [...prev];
      copy[currentIndex] = {
        question,
        selectedMode,
        userDisplayString: result.userDisplayString,
        isModeCorrect: result.isModeCorrect,
        isParamsCorrect: result.isParamsCorrect,
        isCorrect: result.isAllCorrect,
      };
      return copy;
    });
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setSelectedMode(null);
      setInputN('');
      setInputR('');
      setInputMultiset('');
      setInputExpr('');
      setIsAnswered(false);
      setCurrentResult(null);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  }

  function handleRestart() {
    const newQuestions = getRandomSessionQuestions();
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedMode(null);
    setInputN('');
    setInputR('');
    setInputMultiset('');
    setInputExpr('');
    setIsAnswered(false);
    setCurrentResult(null);
    setUserAnswers([]);
    setIsFinished(false);
  }

  function handleApply(q: Question) {
    onLoadQuestion(q.correctMode, q.values, q.multisetCounts, q.multisetLabels);
  }

  // --- 1. SUMMARY VIEW (เมื่อทำครบ 5 ข้อ) ---
  if (isFinished) {
    const scorePct = Math.round((correctCount / questions.length) * 100);
    const trimmedName = nickname.trim();
    const displayName = trimmedName ? `คุณ${trimmedName}` : 'คุณ';

    let evaluation = {
      title: trimmedName ? `ไม่เป็นไร ลองใหม่อีกครั้งนะ ${displayName}! 📚` : 'ไม่เป็นไร ลองใหม่อีกครั้ง! 📚',
      desc: `${displayName} สามารถอ่านทบทวนคำอธิบายของแต่ละข้อด้านล่าง แล้วกดเริ่มฝึกชุดใหม่อีกครั้งได้ทันทีเพื่อพัฒนาความเข้าใจ`,
      color:
        'border-slate-200 bg-slate-50/90 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
    };

    if (correctCount === 5) {
      evaluation = {
        title: trimmedName ? `ยอดเยี่ยมระดับเซียนเลย ${displayName}! 🏆` : 'ยอดเยี่ยมระดับเซียน! 🏆',
        desc: `${displayName} เข้าใจการเลือกใช้เครื่องมือคณิตศาสตร์และกำหนดสูตรตัวเลขได้อย่างแม่นยำสมบูรณ์แบบ ถูกครบ 5 เต็ม 5 ข้อ!`,
        color:
          'border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
      };
    } else if (correctCount === 4) {
      evaluation = {
        title: trimmedName ? `เก่งมาก ยอดเยี่ยมเลย ${displayName}! 🌟` : 'เก่งมาก ยอดเยี่ยม! 🌟',
        desc: `${displayName} มีความเข้าใจในสูตรและการกำหนดตัวเลขเป็นอย่างดี พลาดเพียงข้อเดียวเท่านั้น สามารถทบทวนข้อที่ผิดด้านล่างได้เลย`,
        color:
          'border-indigo-200 bg-indigo-50/90 text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200',
      };
    } else if (correctCount === 3) {
      evaluation = {
        title: trimmedName ? `ผ่านเกณฑ์ ทำได้ดีมาก ${displayName}! 👍` : 'ผ่านเกณฑ์ ทำได้ดี! 👍',
        desc: `${displayName} มีพื้นฐานที่ดีพอสมควร ลองฝึกชุดใหม่เพื่อความชำนาญและความแม่นยำในการเลือกตัวเลขยิ่งขึ้น`,
        color:
          'border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
      };
    } else if (correctCount >= 1) {
      evaluation = {
        title: trimmedName ? `สู้ๆ ฝึกฝนต่อไปนะ ${displayName}! 💡` : 'สู้ๆ ฝึกฝนต่อไปนะ! 💡',
        desc: `${displayName} เริ่มจับทางได้แล้ว ลองสังเกตคำสำคัญ เช่น ลำดับความสำคัญ, การมีของซ้ำ หรือการคิดหลายขั้นตอนร่วมกับการกำหนดตัวแปร`,
        color:
          'border-rose-200 bg-rose-50/90 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200',
      };
    }

    return (
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/70 p-5 shadow-md dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30 sm:p-6 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3 dark:border-indigo-900/50">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xs">
              <Trophy className="size-4.5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
                <span>สรุปผลการฝึกทำโจทย์</span>
                {trimmedName && (
                  <Badge className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 shadow-2xs">
                    ผู้ฝึก: คุณ{trimmedName}
                  </Badge>
                )}
                <Badge className="bg-indigo-600 text-white text-[10px] font-bold">สุ่ม 5 ข้อ</Badge>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ผลประเมินความแม่นยำในการเลือกเครื่องมือและการระบุตัวเลขในสูตร
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="ปิดแบบฝึกหัด"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Nickname Display / Edit Bar in Summary */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-indigo-100 bg-white/70 px-3.5 py-2 text-xs shadow-2xs dark:border-indigo-950 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <User className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-slate-700 dark:text-slate-200">ชื่อเล่นผู้ฝึก:</span>
            {trimmedName ? (
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">คุณ{trimmedName}</span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 italic">(ยังไม่ได้ระบุชื่อเล่น)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="กรอก/แก้ไขชื่อเล่น..."
              maxLength={30}
              className="h-7 w-36 sm:w-48 text-xs rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        {/* Score Banner Card */}
        <div className={`mt-3 rounded-2xl border p-4 sm:p-5 shadow-xs ${evaluation.color}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                ผลการทดสอบรอบนี้
              </span>
              <h4 className="text-base sm:text-lg font-extrabold">{evaluation.title}</h4>
              <p className="text-xs sm:text-sm leading-relaxed opacity-90">{evaluation.desc}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
              <div className="text-center rounded-2xl bg-white/80 dark:bg-slate-900/80 px-4 py-2.5 border border-current/20 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {correctCount} <span className="text-sm font-bold opacity-60">/ 5</span>
                </div>
                <div className="text-[10px] font-semibold opacity-70">คะแนน ({scorePct}%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Review list of all 5 questions */}
        <div className="mt-5 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>เฉลยและสรุปรายละเอียด 5 ข้อ:</span>
          </h4>

          <div className="space-y-2.5">
            {userAnswers.map((record, idx) => {
              const q = record.question;
              const chosenOpt = modeOptions.find((o) => o.mode === record.selectedMode);
              const correctOpt = modeOptions.find((o) => o.mode === q.correctMode);

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-3.5 transition-all ${
                    record.isCorrect
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ข้อ {idx + 1}. [{q.category}]
                      </span>
                      {record.isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" /> ถูกต้อง (+1 คะแนน)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                          <AlertCircle className="size-3.5" /> ไม่ถูกต้อง (0 คะแนน)
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {q.scenario}
                    </p>
                  </div>

                  <div className="mt-2.5 space-y-1.5 border-t border-slate-200/60 pt-2 text-[11px] dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400">
                      <span>
                        คุณเลือกเครื่องมือ:{' '}
                        <strong className={record.isModeCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                          {chosenOpt?.label || record.selectedMode} {record.isModeCorrect ? '✓' : '✗'}
                        </strong>
                      </span>
                      <span>
                        สิ่งที่คุณระบุ/เติม:{' '}
                        <strong className={record.isParamsCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                          {record.userDisplayString} {record.isParamsCorrect ? '✓' : '✗'}
                        </strong>
                      </span>
                    </div>

                    <div className="text-slate-700 dark:text-slate-300 flex flex-wrap items-center gap-1.5">
                      <span>→ คำตอบที่ถูกต้อง:</span>
                      <strong className="text-indigo-700 dark:text-indigo-300 inline-flex flex-wrap items-center gap-1">
                        <span>{correctOpt?.label}</span>
                        <span>(</span>
                        <MathEquation text={`${q.formulaDisplay} = ${q.answerDisplay}`} />
                        <span>)</span>
                      </strong>
                    </div>

                    <div className="text-slate-500 dark:text-slate-400 italic">
                      ({q.explanation})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-100 pt-4 dark:border-indigo-900/50">
          <Button
            onClick={handleRestart}
            className="h-10 gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-xs font-bold text-white shadow-md hover:from-indigo-700 hover:to-violet-700"
          >
            <Sparkles className="size-4" />
            ฝึกทำโจทย์อีกครั้ง (สุ่ม 5 ข้อใหม่)
          </Button>

          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-10 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              ปิดแบบฝึกหัด
            </Button>
          )}
        </div>
      </section>
    );
  }

  // --- 2. ACTIVE QUIZ VIEW (กำลังทำโจทย์ข้อ 1-5) ---
  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 p-4 sm:p-6 shadow-md dark:border-indigo-900/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-blue-950/30 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-3 dark:border-indigo-900/50">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
              <Award className="size-4" />
            </span>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 sm:gap-2">
                <span>แบบฝึกหัดเลือกเครื่องมือและเติมสูตร</span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-indigo-300 bg-indigo-50/80 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                >
                  ข้อที่ {currentIndex + 1}/{questions.length}
                </Badge>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                เลือกเครื่องมือที่เหมาะสมแล้วเติมตัวเลขพารามิเตอร์
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="ปิดโหมดแบบฝึกหัด"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="rounded-full bg-indigo-100/90 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200">
            คะแนนสะสม: {correctCount}/{currentIndex + (isAnswered ? 1 : 0)}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:block rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="ปิดโหมดแบบฝึกหัด"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nickname Input Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-indigo-200/80 bg-white/80 p-2.5 sm:px-4 sm:py-2.5 shadow-xs backdrop-blur-xs dark:border-indigo-900/60 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <User className="size-3.5" />
          </span>
          <label htmlFor="practice-nickname" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
            กรอกชื่อเล่น:
          </label>
        </div>
        <div className="flex-1 min-w-[170px] max-w-xs">
          <Input
            id="practice-nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="พิมพ์ชื่อเล่นของคุณ (เช่น ต้น, พิม)..."
            maxLength={30}
            className="h-8 rounded-xl text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
        {nickname.trim() && (
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            ผู้ฝึก: คุณ{nickname.trim()} ✨
          </span>
        )}
      </div>

      {/* Question Body */}
      <div className="mt-4 space-y-4">
        {/* High-Contrast Question & Answer Box */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-4 sm:p-5 text-white shadow-lg shadow-indigo-950/25 dark:border-indigo-500/50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 ring-4 ring-indigo-500/10">
          {/* Top Info Bar: Category and Question Number Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-lg bg-indigo-500 text-white shadow-xs">
                <HelpCircle className="size-3.5" />
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-200 border border-indigo-400/30">
                หมวด: {question.category}
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-300/90">
              โจทย์ข้อที่ {currentIndex + 1} จาก {questions.length}
            </span>
          </div>

          {/* Question Scenario */}
          <div className="pt-3">
            <p className="text-base sm:text-lg font-bold leading-relaxed text-white tracking-wide">
              {question.scenario}
            </p>
          </div>

          {/* Answer Box: Displayed with maximum prominence once answered */}
          {isAnswered && (
            <div className="mt-4 pt-3.5 border-t border-white/15 animate-in fade-in slide-in-from-top-1">
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-white/10 p-3 backdrop-blur-xs border border-white/20">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black text-slate-950 shadow-xs flex items-center gap-1">
                    <Sparkles className="size-3 text-slate-950" />
                    เฉลยคำตอบ:
                  </span>
                  <div className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wide inline-flex items-center">
                    <MathEquation text={`${question.formulaDisplay} = ${question.answerDisplay}`} />
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-200 bg-indigo-500/30 px-2.5 py-1 rounded-lg border border-indigo-400/30">
                  เครื่องมือที่ถูกต้อง: {modeOptions.find((o) => o.mode === question.correctMode)?.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 1: 5 Tool Option Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="grid size-4.5 place-items-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                1
              </span>
              <span>เลือกเครื่องมือที่เหมาะสมกับโจทย์:</span>
            </span>
            {selectedMode && (
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                เลือกแล้ว: {modeOptions.find((o) => o.mode === selectedMode)?.label}
              </span>
            )}
          </div>

          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {modeOptions.map((opt) => {
              const isChosen = selectedMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => setSelectedMode(opt.mode)}
                  className={`flex flex-col items-start rounded-2xl border p-2.5 sm:p-3 text-left transition-all ${
                    isChosen
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                      : 'border-slate-200/90 bg-white text-slate-800 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80'
                  } ${isAnswered ? 'cursor-default opacity-90' : 'cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 duration-75'}`}
                >
                  <span className="font-bold text-xs sm:text-sm">{opt.label}</span>
                  <span
                    className={`mt-0.5 text-[10px] sm:text-[11px] leading-tight ${
                      isChosen ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {opt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Fill in parameters based on chosen tool */}
        {selectedMode && (
          <div className="space-y-3 rounded-2xl border border-indigo-100 bg-white/90 p-4 shadow-xs dark:border-indigo-900/40 dark:bg-slate-900/90 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="grid size-4.5 place-items-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                  2
                </span>
                <span>
                  {selectedMode === 'combination'
                    ? 'เติมตัวเลขในสูตร C(n, r):'
                    : selectedMode === 'permutation'
                    ? 'เติมตัวเลขในสูตร P(n, r) (กรณี r ≠ n เพราะถ้า r = n จะซ้ำกับ n!):'
                    : selectedMode === 'factorial'
                    ? 'เติมตัวเลขในสูตร n! (สลับที่ของทั้งหมด):'
                    : selectedMode === 'multiset'
                    ? 'เติมตัวเลขในสูตรของซ้ำ n! / (n₁! × n₂! × ...):'
                    : 'พิมพ์นิพจน์คำนวณ หรือตัวเลขคำตอบ:'}
                </span>
              </span>

              {/* Live Preview Pill */}
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {selectedMode === 'combination'
                  ? `C(${inputN || 'n'}, ${inputR || 'r'})`
                  : selectedMode === 'permutation'
                  ? `P(${inputN || 'n'}, ${inputR || 'r'})`
                  : selectedMode === 'factorial'
                  ? `${inputN || 'n'}!`
                  : selectedMode === 'multiset'
                  ? `${inputN || 'n'}! / (${
                      inputMultiset
                        ? inputMultiset.split(/[,+\s]+/).filter(Boolean).map((x) => `${x}!`).join(' × ')
                        : 'n₁! × n₂!...'
                    })`
                  : inputExpr || 'f(C, P, !)'}
              </span>
            </div>

            {/* Inputs by Tool */}
            {selectedMode === 'combination' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    เลือก n (สิ่งของทั้งหมด):
                  </label>
                  <Input
                    type="number"
                    min="0"
                    disabled={isAnswered}
                    placeholder="เช่น 10"
                    value={inputN}
                    onChange={(e) => setInputN(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isReadyToCheck && !isAnswered) handleCheck();
                    }}
                    className="h-10 rounded-xl bg-white text-sm font-medium border-slate-200 focus-visible:border-indigo-600 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    เลือก r (จำนวนที่เลือก):
                  </label>
                  <Input
                    type="number"
                    min="0"
                    disabled={isAnswered}
                    placeholder="เช่น 3"
                    value={inputR}
                    onChange={(e) => setInputR(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isReadyToCheck && !isAnswered) handleCheck();
                    }}
                    className="h-10 rounded-xl bg-white text-sm font-medium border-slate-200 focus-visible:border-indigo-600 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>
            )}

            {selectedMode === 'permutation' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    เลือก n (สิ่งของทั้งหมด):
                  </label>
                  <Input
                    type="number"
                    min="0"
                    disabled={isAnswered}
                    placeholder="เช่น 8"
                    value={inputN}
                    onChange={(e) => setInputN(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isReadyToCheck && !isAnswered) handleCheck();
                    }}
                    className="h-10 rounded-xl bg-white text-sm font-medium border-slate-200 focus-visible:border-indigo-600 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    เลือก r (จำนวนที่นำมาจัดลำดับ):
                  </label>
                  <Input
                    type="number"
                    min="0"
                    disabled={isAnswered}
                    placeholder="เช่น 3"
                    value={inputR}
                    onChange={(e) => setInputR(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isReadyToCheck && !isAnswered) handleCheck();
                    }}
                    className="h-10 rounded-xl bg-white text-sm font-medium border-slate-200 focus-visible:border-indigo-600 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>
            )}

            {selectedMode === 'factorial' && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  เลือก n (จำนวนสิ่งของทั้งหมดที่นำมาสลับที่):
                </label>
                <Input
                  type="number"
                  min="0"
                  disabled={isAnswered}
                  placeholder="เช่น 6"
                  value={inputN}
                  onChange={(e) => setInputN(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isReadyToCheck && !isAnswered) handleCheck();
                  }}
                  className="h-10 rounded-xl bg-white text-sm font-medium border-slate-200 focus-visible:border-indigo-600 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
            )}

            {selectedMode === 'multiset' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    เลือก n (สิ่งของทั้งหมด):
                  </label>
                  <Input
                    type="number"
                    min="0"
                    disabled={isAnswered}
                    placeholder="เช่น 9 (หรือเว้นว่างให้รวมอัตโนมัติ)"
                    value={inputN}
                    onChange={(e) => setInputN(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isReadyToCheck && !isAnswered) handleCheck();
                    }}
                    className="h-10 rounded-xl bg-white text-sm font-medium border-slate-200 focus-visible:border-indigo-600 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    กลุ่มของที่ซ้ำกัน เช่น n₁, n₂, ... (คั่นด้วยจุลภาค):
                  </label>
                  <Input
                    type="text"
                    disabled={isAnswered}
                    placeholder="เช่น 4, 3, 2 (หรือ 3, 2, 1)"
                    value={inputMultiset}
                    onChange={(e) => setInputMultiset(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isReadyToCheck && !isAnswered) handleCheck();
                    }}
                    className="h-10 rounded-xl bg-white text-sm font-medium border-slate-200 focus-visible:border-indigo-600 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>
            )}

            {selectedMode === 'expression' && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  พิมพ์นิพจน์คำนวณ (ในรูป Cnr, Pnr, แฟกทอเรียล หรือการดำเนินการ) หรือคำตอบ:
                </label>
                <Input
                  type="text"
                  disabled={isAnswered}
                  placeholder="เช่น {C(30,3) - C(25,3)} / C(30,3) หรือ 4!*4!*2 หรือ 1152"
                  value={inputExpr}
                  onChange={(e) => setInputExpr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isReadyToCheck && !isAnswered) handleCheck();
                  }}
                  className="h-10 rounded-xl bg-white text-sm font-medium border-slate-200 focus-visible:border-indigo-600 dark:bg-slate-950 dark:border-slate-800"
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  * รองรับการตอบในรูป Cnr, Pnr และการดำเนินการคณิตศาสตร์ เช่น + - * / วงเล็บ หรือค่าคำตอบ
                </p>
              </div>
            )}

            {/* Check Button inside Step 2 */}
            {!isAnswered && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {!isReadyToCheck
                    ? 'กรุณากรอกตัวเลขให้ครบถ้วนก่อนตรวจคำตอบ'
                    : 'พร้อมตรวจคำตอบแล้ว กดปุ่มตรวจคำตอบหรือกด Enter'}
                </span>
                <Button
                  onClick={handleCheck}
                  disabled={!isReadyToCheck}
                  className="h-10 shrink-0 gap-1.5 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40 dark:bg-indigo-500"
                >
                  <span>ตรวจคำตอบ</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Feedback Section */}
        {isAnswered && currentResult && (
          <div className="space-y-3 pt-1 animate-in fade-in">
            {/* Feedback Banner */}
            {currentResult.isAllCorrect ? (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200 shadow-xs">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">
                    ถูกต้องครบถ้วนยอดเยี่ยม! 🎉 (+1 คะแนน)
                  </h4>
                  <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 flex flex-wrap items-center gap-1">
                    <span>เลือกเครื่องมือ</span> <strong>{modeOptions.find((o) => o.mode === selectedMode)?.label}</strong>
                    <span>และระบุสูตร/ตัวเลข</span> <strong>{currentResult.userDisplayString}</strong>
                    <span>ได้ตรงตามสูตร</span> <MathEquation text={`${question.formulaDisplay} = ${question.answerDisplay}`} />
                  </p>
                  <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 pt-1">
                    {question.explanation}
                  </p>
                </div>
              </div>
            ) : currentResult.isModeCorrect && !currentResult.isParamsCorrect ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200 shadow-xs">
                <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">
                    เลือกเครื่องมือถูกต้อง แต่ตัวเลขที่เติมยังไม่ตรง 💡
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300 flex flex-wrap items-center gap-1">
                    <span>คุณเลือกเครื่องมือ</span> <strong>{modeOptions.find((o) => o.mode === selectedMode)?.label}</strong>
                    <span>ถูกต้องแล้ว แต่ตัวเลขที่คุณระบุคือ</span> <strong>{currentResult.userDisplayString}</strong>
                    <span>ซึ่งที่ถูกต้องของโจทย์นี้คือสูตร</span> <MathEquation text={`${question.formulaDisplay} = ${question.answerDisplay}`} />
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 pt-1">
                    {question.explanation}
                  </p>
                </div>
              </div>
            ) : !currentResult.isModeCorrect && currentResult.isParamsCorrect ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200 shadow-xs">
                <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">
                    ตัวเลขที่เติมสอดคล้อง แต่เครื่องมือยังไม่ตรงนิยาม 💡
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300 flex flex-wrap items-center gap-1">
                    <span>คุณระบุค่าตัวเลข</span> <strong>{currentResult.userDisplayString}</strong>
                    <span>ตรงกับจำนวนในโจทย์ แต่เครื่องมือทางคณิตศาสตร์ที่ถูกต้องตามบริบทคือ</span> <strong>{modeOptions.find((o) => o.mode === question.correctMode)?.label}</strong>
                    <span>(สูตร</span> <MathEquation text={question.formulaDisplay} /><span>)</span>
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 pt-1">
                    {question.explanation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200 shadow-xs">
                <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">ยังไม่ถูกต้อง ❌</h4>
                  <p className="text-xs leading-relaxed text-rose-800 dark:text-rose-300 flex flex-wrap items-center gap-1">
                    <span>เครื่องมือที่ถูกต้องคือ</span> <strong>{modeOptions.find((o) => o.mode === question.correctMode)?.label}</strong>
                    <span>(สูตร</span> <MathEquation text={`${question.formulaDisplay} = ${question.answerDisplay}`} /><span>)</span>
                    <span>โดยคุณตอบ:</span> <span>{modeOptions.find((o) => o.mode === selectedMode)?.label} ({currentResult.userDisplayString})</span>
                  </p>
                  {selectedMode === 'permutation' && question.correctMode === 'factorial' && (
                    <div className="mt-1 rounded-xl bg-amber-100/80 p-2.5 text-xs font-medium text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60">
                      💡 <strong>ข้อสังเกต:</strong> โจทย์ข้อนี้เป็นการนำสิ่งของทั้งหมด {question.values?.n || 'n'} ชิ้นมาจัดเรียงทั้งหมดพร้อมกัน (r = n) ซึ่ง P(n, n) = n! จะซ้ำกับสูตร Factorial ทางสถิติจึงจัดให้ใช้เครื่องมือ <strong>Factorial (n!)</strong> โดยตรง ส่วน <strong>Permutation P(n, r)</strong> จะใช้ในกรณี r ≠ n (เลือกมาจัดเพียงบางส่วน)
                    </div>
                  )}
                  <p className="text-xs text-rose-800/90 dark:text-rose-300/90 pt-1">
                    <strong>คำใบ้:</strong> {question.hint}
                  </p>
                  <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">
                    {question.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Actions: Take to Calculator or Next */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApply(question)}
                className="h-9 gap-1.5 rounded-xl border-indigo-300 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
              >
                <Calculator className="size-4" />
                นำโจทย์นี้ไปคำนวณและดูการตัดทอน →
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleNext}
                  className="h-9 gap-1 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-500"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? 'ข้อถัดไป' : 'ดูสรุปผลคะแนน'}
                  </span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
