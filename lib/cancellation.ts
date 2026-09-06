import { gcdBigInt } from './combinatorics.ts';

export type FactorTerm = {
  id: string;
  original: number;
  current: number;
  isCanceled: boolean;
  cancelStep?: number;
  colorKey?: string;
};

export type CancellationStep = {
  stepIndex: number;
  type: 'factorial' | 'factor';
  numIndex?: number;
  denIndex?: number;
  divisor?: number;
  numBefore?: number;
  numAfter?: number;
  denBefore?: number;
  denAfter?: number;
  factorialValue?: number;
  colorKey: string;
  explanation: string;
};

export type DetailedCancellation = {
  mode: 'combination' | 'permutation' | 'factorial' | 'quotient' | 'multiset';
  formulaLaTeX: string;
  substitutedLaTeX: string;
  
  // Factorial cancellation stage
  hasFactorialCancellation: boolean;
  canceledFactorial?: number;
  numeratorFactorialExpanded?: string;
  denominatorFactorialExpanded?: string;
  
  // Pairwise cancellation stage
  initialNumeratorFactors: number[];
  initialDenominatorFactors: number[];
  steps: CancellationStep[];
  
  // Final remaining factors after cancellation
  finalNumeratorFactors: number[];
  finalDenominatorFactors: number[];
  
  // Final multiplication calculation
  numeratorProduct: bigint;
  denominatorProduct: bigint;
  finalAnswer: string;
  isInteger: boolean;
  
  // Explanatory note
  pedagogicalNotes: string[];
};

export const COLOR_KEYS = [
  'sky',
  'emerald',
  'amber',
  'violet',
  'teal',
  'rose',
  'indigo',
  'fuchsia',
  'cyan',
  'orange',
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number];

function gcdNumber(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return Math.abs(a);
}

/**
 * Builds detailed cancellation steps for Combination C(n, r)
 */
export function getCombinationCancellation(n: number, r: number, useSymmetry = true): DetailedCancellation {
  const k = Math.min(r, n - r);
  const effectiveR = useSymmetry ? k : r;
  const largeFactorial = n - effectiveR;
  const smallFactorial = effectiveR;

  const formulaLaTeX = 'C(n, r) = \\frac{n!}{r!(n - r)!}';
  const substitutedLaTeX = `C(${n}, ${r}) = \\frac{${n}!}{${r}!(${n} - ${r})!} = \\frac{${n}!}{${effectiveR}! \\times ${largeFactorial}!}`;

  if (effectiveR === 0) {
    return {
      mode: 'combination',
      formulaLaTeX,
      substitutedLaTeX,
      hasFactorialCancellation: true,
      canceledFactorial: n,
      initialNumeratorFactors: [1],
      initialDenominatorFactors: [1],
      steps: [],
      finalNumeratorFactors: [1],
      finalDenominatorFactors: [1],
      numeratorProduct: 1n,
      denominatorProduct: 1n,
      finalAnswer: '1',
      isInteger: true,
      pedagogicalNotes: [
        `ตามนิยามทางคณิตศาสตร์ C(${n}, 0) = 1 (การเลือก 0 ชิ้นจาก ${n} ชิ้น มีเพียง 1 วิธีคือไม่เลือกเลย)`,
      ],
    };
  }

  // Numerator factors after cancelling largeFactorial!
  // From n down to largeFactorial + 1
  const initialNumerator: number[] = [];
  for (let i = n; i > largeFactorial; i--) {
    initialNumerator.push(i);
  }

  // Denominator factors: smallFactorial down to 1
  const initialDenominator: number[] = [];
  for (let i = smallFactorial; i >= 1; i--) {
    initialDenominator.push(i);
  }

  const numCurrent = [...initialNumerator];
  const denCurrent = [...initialDenominator];
  const steps: CancellationStep[] = [];
  let colorIdx = 0;

  // Step 0 is the factorial cancellation of largeFactorial!
  steps.push({
    stepIndex: 0,
    type: 'factorial',
    factorialValue: largeFactorial,
    colorKey: 'rose',
    explanation: `ตัดทอนแฟกทอเรียลขนาดใหญ่ ${largeFactorial}! ออกทั้งตัวเศษและตัวส่วน (ประหยัดเวลาคำนวณ)`,
  });

  // Now perform pairwise cancellation for den factors (from largest to smallest > 1)
  for (let dIdx = 0; dIdx < denCurrent.length; dIdx++) {
    if (denCurrent[dIdx] <= 1) continue;

    // First, try to find an exact multiple in numerator
    let matched = false;
    for (let nIdx = 0; nIdx < numCurrent.length; nIdx++) {
      if (numCurrent[nIdx] % denCurrent[dIdx] === 0) {
        const dVal = denCurrent[dIdx];
        const nBefore = numCurrent[nIdx];
        numCurrent[nIdx] = nBefore / dVal;
        denCurrent[dIdx] = 1;
        const color = COLOR_KEYS[colorIdx % COLOR_KEYS.length];
        colorIdx++;

        steps.push({
          stepIndex: steps.length,
          type: 'factor',
          numIndex: nIdx,
          denIndex: dIdx,
          divisor: dVal,
          numBefore: nBefore,
          numAfter: numCurrent[nIdx],
          denBefore: dVal,
          denAfter: 1,
          colorKey: color,
          explanation: `ตัดทอนคู่ที่ ${steps.length}: นำ ${dVal} ไปหารทั้ง ${nBefore} (เศษ) และ ${dVal} (ส่วน) → เศษเหลือ ${numCurrent[nIdx]}, ส่วนเหลือ 1`,
        });
        matched = true;
        break;
      }
    }

    // If no exact multiple, reduce by GCD
    if (!matched) {
      for (let nIdx = 0; nIdx < numCurrent.length; nIdx++) {
        if (numCurrent[nIdx] <= 1) continue;
        const g = gcdNumber(numCurrent[nIdx], denCurrent[dIdx]);
        if (g > 1) {
          const nBefore = numCurrent[nIdx];
          const dBefore = denCurrent[dIdx];
          numCurrent[nIdx] = nBefore / g;
          denCurrent[dIdx] = dBefore / g;
          const color = COLOR_KEYS[colorIdx % COLOR_KEYS.length];
          colorIdx++;

          steps.push({
            stepIndex: steps.length,
            type: 'factor',
            numIndex: nIdx,
            denIndex: dIdx,
            divisor: g,
            numBefore: nBefore,
            numAfter: numCurrent[nIdx],
            denBefore: dBefore,
            denAfter: denCurrent[dIdx],
            colorKey: color,
            explanation: `ตัดทอนคู่ที่ ${steps.length}: ตัวหารร่วมมาก (ห.ร.ม.) คือ ${g} → หาร ${nBefore} เหลือ ${numCurrent[nIdx]}, หาร ${dBefore} เหลือ ${denCurrent[dIdx]}`,
          });

          if (denCurrent[dIdx] <= 1) break;
        }
      }
    }
  }

  const finalNumerator = [...numCurrent];
  const finalDenominator = [...denCurrent];

  let numProd = 1n;
  for (const n of finalNumerator) numProd *= BigInt(n);
  let denProd = 1n;
  for (const d of finalDenominator) denProd *= BigInt(d);

  const finalAnswer = (numProd / denProd).toLocaleString('th-TH');

  const notes: string[] = [];
  if (k !== r && useSymmetry) {
    notes.push(
      `ใช้สมบัติสมมาตร C(${n}, ${r}) = C(${n}, ${k}) เพราะเลือกของ ${r} ชิ้นจาก ${n} ชิ้น ให้ผลลัพธ์เท่ากับการเลือกของ ${k} ชิ้นที่เหลือ`,
    );
  }
  notes.push('ตัวส่วนทั้งหมดถูกตัดทอนจนเหลือ 1 จึงได้ผลลัพธ์เป็นจำนวนเต็มตามทฤษฎีคอมบินาทอริก');

  return {
    mode: 'combination',
    formulaLaTeX,
    substitutedLaTeX,
    hasFactorialCancellation: true,
    canceledFactorial: largeFactorial,
    numeratorFactorialExpanded: `${initialNumerator.join(' \\times ')} \\times ${largeFactorial}!`,
    denominatorFactorialExpanded: `${smallFactorial}! \\times ${largeFactorial}!`,
    initialNumeratorFactors: initialNumerator,
    initialDenominatorFactors: initialDenominator,
    steps,
    finalNumeratorFactors: finalNumerator,
    finalDenominatorFactors: finalDenominator,
    numeratorProduct: numProd,
    denominatorProduct: denProd,
    finalAnswer,
    isInteger: true,
    pedagogicalNotes: notes,
  };
}

/**
 * Builds cancellation steps for Permutation P(n, r)
 */
export function getPermutationCancellation(n: number, r: number): DetailedCancellation {
  const formulaLaTeX = 'P(n, r) = \\frac{n!}{(n - r)!}';
  const rem = n - r;
  const substitutedLaTeX = `P(${n}, ${r}) = \\frac{${n}!(${n} - ${r})!} = \\frac{${n}!}{${rem}!}`;

  if (r === 0) {
    return {
      mode: 'permutation',
      formulaLaTeX,
      substitutedLaTeX,
      hasFactorialCancellation: true,
      canceledFactorial: n,
      initialNumeratorFactors: [1],
      initialDenominatorFactors: [1],
      steps: [],
      finalNumeratorFactors: [1],
      finalDenominatorFactors: [1],
      numeratorProduct: 1n,
      denominatorProduct: 1n,
      finalAnswer: '1',
      isInteger: true,
      pedagogicalNotes: [
        `ตามนิยามทางคณิตศาสตร์ P(${n}, 0) = 1 (การจัดลำดับสิ่งของ 0 ชิ้น มี 1 วิธีคือไม่มีการจัด)`,
      ],
    };
  }

  const initialNumerator: number[] = [];
  for (let i = n; i > rem; i--) {
    initialNumerator.push(i);
  }

  const steps: CancellationStep[] = [
    {
      stepIndex: 0,
      type: 'factorial',
      factorialValue: rem,
      colorKey: 'rose',
      explanation: `ตัดทอนแฟกทอเรียล ${rem}! ออกทั้งตัวเศษและตัวส่วนทั้งหมด`,
    },
  ];

  let numProd = 1n;
  for (const val of initialNumerator) numProd *= BigInt(val);

  return {
    mode: 'permutation',
    formulaLaTeX,
    substitutedLaTeX,
    hasFactorialCancellation: true,
    canceledFactorial: rem,
    numeratorFactorialExpanded: `${initialNumerator.join(' \\times ')} \\times ${rem}!`,
    denominatorFactorialExpanded: `${rem}!`,
    initialNumeratorFactors: initialNumerator,
    initialDenominatorFactors: [1],
    steps,
    finalNumeratorFactors: initialNumerator,
    finalDenominatorFactors: [1],
    numeratorProduct: numProd,
    denominatorProduct: 1n,
    finalAnswer: numProd.toLocaleString('th-TH'),
    isInteger: true,
    pedagogicalNotes: [
      `Permutation จัดลำดับสิ่งของ ${r} สิ่งจากทั้งหมด ${n} สิ่ง`,
      `ตัวส่วน ${rem}! ถูกตัดทอนกับหางของ ${n}! ในตัวเศษ ทำให้เหลือเพียงผลคูณถอยหลัง ${r} จำนวน`,
      `เปรียบเทียบกับ C(${n}, ${r}): มีค่ามากกว่าเป็นจำนวน ${r}! เท่า เพราะสนใจลำดับ`,
    ],
  };
}

/**
 * Builds cancellation steps for Factorial Quotient a! / b! or a! / (b! * c!)
 */
export function getQuotientCancellation(
  a: number,
  b: number,
  c?: number,
): DetailedCancellation {
  if (c !== undefined) {
    // Advanced: a! / (b! * c!)
    const formulaLaTeX = '\\frac{a!}{b! \\times c!}';
    const substitutedLaTeX = `\\frac{${a}!}{${b}! \\times ${c}!}`;
    const maxDen = Math.max(b, c);
    const minDen = Math.min(b, c);

    if (a >= maxDen) {
      const initialNumerator: number[] = [];
      for (let i = a; i > maxDen; i--) {
        initialNumerator.push(i);
      }
      if (initialNumerator.length === 0) initialNumerator.push(1);

      const initialDenominator: number[] = [];
      for (let i = minDen; i >= 1; i--) {
        initialDenominator.push(i);
      }
      if (initialDenominator.length === 0) initialDenominator.push(1);

      const numCurrent = [...initialNumerator];
      const denCurrent = [...initialDenominator];
      const steps: CancellationStep[] = [
        {
          stepIndex: 0,
          type: 'factorial',
          factorialValue: maxDen,
          colorKey: 'rose',
          explanation: `ตัดแฟกทอเรียลที่ใหญ่ที่สุด (${maxDen}!) ออกจากทั้งเศษและส่วน`,
        },
      ];

      let colorIdx = 0;
      for (let dIdx = 0; dIdx < denCurrent.length; dIdx++) {
        if (denCurrent[dIdx] <= 1) continue;
        for (let nIdx = 0; nIdx < numCurrent.length; nIdx++) {
          const g = gcdNumber(numCurrent[nIdx], denCurrent[dIdx]);
          if (g > 1) {
            const nBefore = numCurrent[nIdx];
            const dBefore = denCurrent[dIdx];
            numCurrent[nIdx] = nBefore / g;
            denCurrent[dIdx] = dBefore / g;
            const color = COLOR_KEYS[colorIdx % COLOR_KEYS.length];
            colorIdx++;

            steps.push({
              stepIndex: steps.length,
              type: 'factor',
              numIndex: nIdx,
              denIndex: dIdx,
              divisor: g,
              numBefore: nBefore,
              numAfter: numCurrent[nIdx],
              denBefore: dBefore,
              denAfter: denCurrent[dIdx],
              colorKey: color,
              explanation: `ตัดทอนคู่ที่ ${steps.length}: หาร ${nBefore} และ ${dBefore} ด้วย ${g} → เศษเหลือ ${numCurrent[nIdx]}, ส่วนเหลือ ${denCurrent[dIdx]}`,
            });
            if (denCurrent[dIdx] <= 1) break;
          }
        }
      }

      let numProd = 1n;
      for (const n of numCurrent) numProd *= BigInt(n);
      let denProd = 1n;
      for (const d of denCurrent) denProd *= BigInt(d);

      const g = gcdBigInt(numProd, denProd);
      numProd /= g;
      denProd /= g;

      const isInteger = denProd === 1n;
      const finalAnswer = isInteger
        ? numProd.toLocaleString('th-TH')
        : `${numProd.toLocaleString('th-TH')} / ${denProd.toLocaleString('th-TH')}`;

      return {
        mode: 'quotient',
        formulaLaTeX,
        substitutedLaTeX,
        hasFactorialCancellation: true,
        canceledFactorial: maxDen,
        numeratorFactorialExpanded: `${initialNumerator.join(' \\times ')} \\times ${maxDen}!`,
        denominatorFactorialExpanded: `${minDen}! \\times ${maxDen}!`,
        initialNumeratorFactors: initialNumerator,
        initialDenominatorFactors: initialDenominator,
        steps,
        finalNumeratorFactors: numCurrent,
        finalDenominatorFactors: denCurrent,
        numeratorProduct: numProd,
        denominatorProduct: denProd,
        finalAnswer,
        isInteger,
        pedagogicalNotes: [
          `ตัดทอนแฟกทอเรียลขนาดใหญ่สุด ${maxDen}! ก่อนเพื่อลดขนาดตัวเลข`,
          isInteger ? 'ตัดทอนจนตัวส่วนเป็น 1 ได้ผลลัพธ์เป็นจำนวนเต็ม' : 'ตัดทอนจนเป็นเศษส่วนอย่างต่ำแล้ว',
        ],
      };
    } else {
      // a < maxDen
      const initialNumerator = [1];
      const initialDenominator: number[] = [];
      for (let i = maxDen; i > a; i--) {
        initialDenominator.push(i);
      }
      for (let i = minDen; i >= 1; i--) {
        initialDenominator.push(i);
      }

      let denProd = 1n;
      for (const d of initialDenominator) denProd *= BigInt(d);

      return {
        mode: 'quotient',
        formulaLaTeX,
        substitutedLaTeX,
        hasFactorialCancellation: true,
        canceledFactorial: a,
        initialNumeratorFactors: [1],
        initialDenominatorFactors: initialDenominator,
        steps: [
          {
            stepIndex: 0,
            type: 'factorial',
            factorialValue: a,
            colorKey: 'rose',
            explanation: `ตัวเศษมีค่าน้อยกว่าตัวส่วน ตัด ${a}! ออกจากตัวส่วน ${maxDen}!`,
          },
        ],
        finalNumeratorFactors: [1],
        finalDenominatorFactors: initialDenominator,
        numeratorProduct: 1n,
        denominatorProduct: denProd,
        finalAnswer: `1 / ${denProd.toLocaleString('th-TH')}`,
        isInteger: false,
        pedagogicalNotes: ['ตัวเศษน้อยกว่าตัวส่วน ทำให้ผลลัพธ์เป็นเศษส่วนแท้ (น้อยกว่า 1)'],
      };
    }
  }

  // Simple a! / b!
  const formulaLaTeX = '\\frac{a!}{b!}';
  const substitutedLaTeX = `\\frac{${a}!}{${b}!}`;

  if (a >= b) {
    const initialNumerator: number[] = [];
    for (let i = a; i > b; i--) {
      initialNumerator.push(i);
    }
    if (initialNumerator.length === 0) initialNumerator.push(1);

    let numProd = 1n;
    for (const n of initialNumerator) numProd *= BigInt(n);

    return {
      mode: 'quotient',
      formulaLaTeX,
      substitutedLaTeX,
      hasFactorialCancellation: true,
      canceledFactorial: b,
      numeratorFactorialExpanded: b === a ? `${b}!` : `${initialNumerator.join(' \\times ')} \\times ${b}!`,
      denominatorFactorialExpanded: `${b}!`,
      initialNumeratorFactors: initialNumerator,
      initialDenominatorFactors: [1],
      steps: [
        {
          stepIndex: 0,
          type: 'factorial',
          factorialValue: b,
          colorKey: 'rose',
          explanation: `ตัด ${b}! ออกจากตัวเศษและตัวส่วน`,
        },
      ],
      finalNumeratorFactors: initialNumerator,
      finalDenominatorFactors: [1],
      numeratorProduct: numProd,
      denominatorProduct: 1n,
      finalAnswer: numProd.toLocaleString('th-TH'),
      isInteger: true,
      pedagogicalNotes: [`ตัวเศษ ${a}! ถูกตัดด้วย ${b}! จนตัวส่วนเหลือ 1 ได้ผลคูณ ${initialNumerator.join(' × ')}`],
    };
  } else {
    // a < b
    const initialDenominator: number[] = [];
    for (let i = b; i > a; i--) {
      initialDenominator.push(i);
    }

    let denProd = 1n;
    for (const d of initialDenominator) denProd *= BigInt(d);

    return {
      mode: 'quotient',
      formulaLaTeX,
      substitutedLaTeX,
      hasFactorialCancellation: true,
      canceledFactorial: a,
      numeratorFactorialExpanded: `${a}!`,
      denominatorFactorialExpanded: `${initialDenominator.join(' \\times ')} \\times ${a}!`,
      initialNumeratorFactors: [1],
      initialDenominatorFactors: initialDenominator,
      steps: [
        {
          stepIndex: 0,
          type: 'factorial',
          factorialValue: a,
          colorKey: 'rose',
          explanation: `ตัด ${a}! ออกจากตัวส่วน ${b}! เหลือ 1 ส่วนผลคูณถอยหลัง`,
        },
      ],
      finalNumeratorFactors: [1],
      finalDenominatorFactors: initialDenominator,
      numeratorProduct: 1n,
      denominatorProduct: denProd,
      finalAnswer: `1 / ${denProd.toLocaleString('th-TH')}`,
      isInteger: false,
      pedagogicalNotes: ['เนื่องจากตัวเศษน้อยกว่าตัวส่วน ผลลัพธ์จึงอยู่ในรูปเศษส่วน 1 / (ผลคูณ)'],
    };
  }
}

/**
 * Builds cancellation steps for Multiset Permutation (การเรียงสับเปลี่ยนสิ่งของที่ซ้ำกัน)
 * n! / (n_1! * n_2! * ... * n_k!) where n = n_1 + n_2 + ... + n_k
 */
export function getMultisetPermutationCancellation(
  counts: number[],
  groupLabels?: string[],
): DetailedCancellation {
  const validCounts = counts.filter((c) => c > 0);
  const totalN = validCounts.reduce((sum, val) => sum + val, 0);

  const formulaLaTeX =
    '\\frac{n!}{n_1! \\times n_2! \\times \\dots \\times n_k!} \\quad (n = \\sum_{i=1}^k n_i)';
  const substitutedLaTeX = `\\frac{${totalN}!}{${validCounts.map((c) => `${c}!`).join(' \\times ') || '1!'}}`;

  if (totalN <= 1 || validCounts.length <= 1) {
    return {
      mode: 'multiset',
      formulaLaTeX,
      substitutedLaTeX,
      hasFactorialCancellation: false,
      initialNumeratorFactors: [1],
      initialDenominatorFactors: [1],
      steps: [],
      finalNumeratorFactors: [1],
      finalDenominatorFactors: [1],
      numeratorProduct: 1n,
      denominatorProduct: 1n,
      finalAnswer: '1',
      isInteger: true,
      pedagogicalNotes: [
        'สิ่งของทั้งหมดซ้ำกันกลุ่มเดียว หรือมีเพียง 1 ชิ้น จึงจัดได้ 1 วิธี',
      ],
    };
  }

  // Sort descending to find the largest group factorial to cancel
  const sorted = [...validCounts].sort((a, b) => b - a);
  const maxFactorial = sorted[0];

  // Initial numerator factors: from totalN down to maxFactorial + 1
  const initialNumerator: number[] = [];
  for (let i = totalN; i > maxFactorial; i--) {
    initialNumerator.push(i);
  }
  if (initialNumerator.length === 0) initialNumerator.push(1);

  // Remaining denominator factorials: sorted[1..k] that are > 1
  const remainingCounts = sorted.slice(1).filter((c) => c > 1);
  const initialDenominator: number[] = [];
  for (const c of remainingCounts) {
    for (let i = c; i >= 2; i--) {
      initialDenominator.push(i);
    }
  }
  if (initialDenominator.length === 0) initialDenominator.push(1);

  const numCurrent = [...initialNumerator];
  const denCurrent = [...initialDenominator];
  const steps: CancellationStep[] = [];
  let colorIdx = 0;

  // Step 0: Factorial cancellation of the largest group
  steps.push({
    stepIndex: 0,
    type: 'factorial',
    factorialValue: maxFactorial,
    colorKey: 'rose',
    explanation: `ตัดทอนกลุ่มที่ซ้ำมากที่สุด (${maxFactorial}!) ออกจาก ${totalN}! ในตัวเศษเพื่อลดทอนขนาดตัวเลข`,
  });

  // Pairwise cancellation for each denominator factor
  for (let dIdx = 0; dIdx < denCurrent.length; dIdx++) {
    if (denCurrent[dIdx] <= 1) continue;

    // First try exact multiple
    let matched = false;
    for (let nIdx = 0; nIdx < numCurrent.length; nIdx++) {
      if (numCurrent[nIdx] % denCurrent[dIdx] === 0) {
        const dVal = denCurrent[dIdx];
        const nBefore = numCurrent[nIdx];
        numCurrent[nIdx] = nBefore / dVal;
        denCurrent[dIdx] = 1;
        const color = COLOR_KEYS[colorIdx % COLOR_KEYS.length];
        colorIdx++;

        steps.push({
          stepIndex: steps.length,
          type: 'factor',
          numIndex: nIdx,
          denIndex: dIdx,
          divisor: dVal,
          numBefore: nBefore,
          numAfter: numCurrent[nIdx],
          denBefore: dVal,
          denAfter: 1,
          colorKey: color,
          explanation: `ตัดทอนคู่ที่ ${steps.length}: นำ ${dVal} ไปหารทั้ง ${nBefore} (เศษ) และ ${dVal} (ส่วน) → เศษเหลือ ${numCurrent[nIdx]}, ส่วนเหลือ 1`,
        });
        matched = true;
        break;
      }
    }

    // If no exact multiple, reduce by GCD
    if (!matched) {
      for (let nIdx = 0; nIdx < numCurrent.length; nIdx++) {
        if (numCurrent[nIdx] <= 1) continue;
        const g = gcdNumber(numCurrent[nIdx], denCurrent[dIdx]);
        if (g > 1) {
          const nBefore = numCurrent[nIdx];
          const dBefore = denCurrent[dIdx];
          numCurrent[nIdx] = nBefore / g;
          denCurrent[dIdx] = dBefore / g;
          const color = COLOR_KEYS[colorIdx % COLOR_KEYS.length];
          colorIdx++;

          steps.push({
            stepIndex: steps.length,
            type: 'factor',
            numIndex: nIdx,
            denIndex: dIdx,
            divisor: g,
            numBefore: nBefore,
            numAfter: numCurrent[nIdx],
            denBefore: dBefore,
            denAfter: denCurrent[dIdx],
            colorKey: color,
            explanation: `ตัดทอนคู่ที่ ${steps.length}: ตัวหารร่วมมาก (ห.ร.ม.) คือ ${g} → หาร ${nBefore} เหลือ ${numCurrent[nIdx]}, หาร ${dBefore} เหลือ ${denCurrent[dIdx]}`,
          });

          if (denCurrent[dIdx] <= 1) break;
        }
      }
    }
  }

  let numProd = 1n;
  for (const n of numCurrent) numProd *= BigInt(n);
  let denProd = 1n;
  for (const d of denCurrent) denProd *= BigInt(d);

  const finalAnswer = (numProd / denProd).toLocaleString('th-TH');

  const notes: string[] = [
    `สูตรเรียงสับเปลี่ยนสิ่งของ ${totalN} สิ่ง ที่มีของซ้ำกัน ${validCounts.length} กลุ่ม`,
    `ตัดกลุ่มใหญ่สุด ${maxFactorial}! ก่อน และนำแฟกทอเรียลที่เหลือมาตัดทอนทีละตัวจนตัวส่วนเป็น 1`,
  ];
  if (groupLabels && groupLabels.length > 0) {
    notes.push(`กลุ่มของซ้ำ: ${groupLabels.join(', ')}`);
  }

  return {
    mode: 'multiset',
    formulaLaTeX,
    substitutedLaTeX,
    hasFactorialCancellation: true,
    canceledFactorial: maxFactorial,
    numeratorFactorialExpanded: `${initialNumerator.join(' \\times ')} \\times ${maxFactorial}!`,
    denominatorFactorialExpanded: `${remainingCounts.map((c) => `${c}!`).join(' \\times ') || '1'} \\times ${maxFactorial}!`,
    initialNumeratorFactors: initialNumerator,
    initialDenominatorFactors: initialDenominator,
    steps,
    finalNumeratorFactors: numCurrent,
    finalDenominatorFactors: denCurrent,
    numeratorProduct: numProd,
    denominatorProduct: denProd,
    finalAnswer,
    isInteger: true,
    pedagogicalNotes: notes,
  };
}
