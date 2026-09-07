import {
  combination,
  factorial,
  gcdBigInt,
  permutation,
  formatBigInt,
  descendingProduct,
  factorialExpansion,
} from './combinatorics.ts';
import {
  getCombinationCancellation,
  getPermutationCancellation,
  getQuotientCancellation,
  type DetailedCancellation,
} from './cancellation.ts';

export { formatBigInt } from './combinatorics.ts';

export type SubTerm = {
  raw: string;
  type: 'combination' | 'permutation' | 'factorial';
  params: number[];
  expansion: string;
  value: bigint;
  detailedCancellation?: DetailedCancellation;
};

export type ExpressionResult = {
  original: string;
  sanitized: string;
  subTerms: SubTerm[];
  substitutedExpression: string;
  isFraction: boolean;
  numeratorExpr?: string;
  denominatorExpr?: string;
  numeratorRaw?: bigint;
  denominatorRaw?: bigint;
  gcd?: bigint;
  numeratorReduced?: bigint;
  denominatorReduced?: bigint;
  isReduced: boolean;
  finalValueString: string;
  decimalString?: string;
  percentageString?: string;
  cancellationStep?: {
    numBefore: bigint;
    numAfter: bigint;
    denBefore: bigint;
    denAfter: bigint;
    divisor: bigint;
    explanation: string;
  };
  topLevelCancellation?: DetailedCancellation;
};

/**
 * Normalizes input string: replaces { } and [ ] with ( ), × with *, ÷ with /
 */
export function sanitizeExpression(input: string): string {
  return input
    .replace(/[{[]/g, '(')
    .replace(/[}\]]/g, ')')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '');
}

/**
 * Finds and evaluates all combinatorics sub-terms like C(n,r), Cn,r, P(n,r), Pn,r, n!
 */
export function extractAndEvaluateSubTerms(expr: string): {
  subTerms: SubTerm[];
  replacedExpr: string;
} {
  const subTerms: SubTerm[] = [];
  let currentExpr = expr;

  // 1. Matches C(n, r) or Cn,r or C5,2
  // Strictly matches either C(n,r) or Cn,r so it doesn't swallow a trailing ')'
  const cRegex = /C(?:(?:\(\s*(\d+)\s*,\s*(\d+)\s*\))|(?:\s*(\d+)\s*,\s*(\d+)\b))/gi;
  currentExpr = currentExpr.replace(cRegex, (match, n1, r1, n2, r2) => {
    const nStr = n1 ?? n2;
    const rStr = r1 ?? r2;
    const n = Number.parseInt(nStr, 10);
    const r = Number.parseInt(rStr, 10);
    if (r > n) throw new Error(`ใน ${match}: r (${r}) ต้องไม่เกิน n (${n})`);
    const val = combination(n, r);
    const k = Math.min(r, n - r);
    const expansion =
      r === 0
        ? '1'
        : `(${descendingProduct(n, n - k + 1)}) / (${factorialExpansion(k)}) = ${formatBigInt(val)}`;
    const detailedCancellation = getCombinationCancellation(n, r, true);
    subTerms.push({
      raw: match,
      type: 'combination',
      params: [n, r],
      expansion: `C(${n}, ${r}) = ${expansion}`,
      value: val,
      detailedCancellation,
    });
    return val.toString();
  });

  // 2. Matches P(n, r) or Pn,r or P8,3
  const pRegex = /P(?:(?:\(\s*(\d+)\s*,\s*(\d+)\s*\))|(?:\s*(\d+)\s*,\s*(\d+)\b))/gi;
  currentExpr = currentExpr.replace(pRegex, (match, n1, r1, n2, r2) => {
    const nStr = n1 ?? n2;
    const rStr = r1 ?? r2;
    const n = Number.parseInt(nStr, 10);
    const r = Number.parseInt(rStr, 10);
    if (r > n) throw new Error(`ใน ${match}: r (${r}) ต้องไม่เกิน n (${n})`);
    const val = permutation(n, r);
    const expansion =
      r === 0
        ? '1'
        : `${descendingProduct(n, n - r + 1)} = ${formatBigInt(val)}`;
    const detailedCancellation = getPermutationCancellation(n, r);
    subTerms.push({
      raw: match,
      type: 'permutation',
      params: [n, r],
      expansion: `P(${n}, ${r}) = ${expansion}`,
      value: val,
      detailedCancellation,
    });
    return val.toString();
  });

  // 3. Matches n! like 5!, 0!
  const factRegex = /(\d+)!/g;
  currentExpr = currentExpr.replace(factRegex, (match, nStr) => {
    const n = Number.parseInt(nStr, 10);
    if (n > 100) throw new Error(`ค่า ${match} สูงเกินไป (ไม่เกิน 100!)`);
    const val = factorial(n);
    const expansion = `${factorialExpansion(n)} = ${formatBigInt(val)}`;
    subTerms.push({
      raw: match,
      type: 'factorial',
      params: [n],
      expansion: `${n}! = ${expansion}`,
      value: val,
    });
    return val.toString();
  });

  return { subTerms, replacedExpr: currentExpr };
}

export type Rational = {
  num: bigint;
  den: bigint;
};

export function makeRational(n: bigint, d: bigint = 1n): Rational {
  if (d === 0n) throw new Error('ตัวส่วนเป็นศูนย์ ไม่สามารถหารได้');
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcdBigInt(n < 0n ? -n : n, d);
  return { num: n / g, den: d / g };
}

export function addRational(a: Rational, b: Rational): Rational {
  return makeRational(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function subRational(a: Rational, b: Rational): Rational {
  return makeRational(a.num * b.den - b.num * a.den, a.den * b.den);
}

export function mulRational(a: Rational, b: Rational): Rational {
  return makeRational(a.num * b.num, a.den * b.den);
}

export function divRational(a: Rational, b: Rational): Rational {
  if (b.num === 0n) throw new Error('ตัวส่วนเป็นศูนย์ ไม่สามารถหารได้');
  return makeRational(a.num * b.den, a.den * b.num);
}

/**
 * Parses and evaluates an arithmetic expression safely with strict order of operations (BODMAS / PEMDAS):
 * 1. Parentheses ( )
 * 2. Multiplication & Division (from left to right)
 * 3. Addition & Subtraction (from left to right)
 * Evaluates using exact BigInt Rational arithmetic.
 */
export function evaluateArithmeticRational(expr: string): Rational {
  // Validate characters: only digits, +, -, *, /, (, )
  if (!/^[0-9+\-*/()]+$/.test(expr)) {
    throw new Error('นิพจน์มีสัญลักษณ์ที่ไม่ถูกต้อง');
  }

  // Tokenize
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const char = expr[i];
    if (/\d/.test(char)) {
      let numStr = '';
      while (i < expr.length && /\d/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      tokens.push(numStr);
    } else if (['+', '-', '*', '/', '(', ')'].includes(char)) {
      tokens.push(char);
      i++;
    } else {
      throw new Error(`ไม่รู้จักสัญลักษณ์ ${char}`);
    }
  }

  const values: Rational[] = [];
  const ops: string[] = [];

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
  };

  function applyOp(op: string) {
    if (values.length < 2) throw new Error('รูปแบบนิพจน์ไม่สมบูรณ์');
    const b = values.pop()!;
    const a = values.pop()!;
    switch (op) {
      case '+':
        values.push(addRational(a, b));
        break;
      case '-':
        values.push(subRational(a, b));
        break;
      case '*':
        values.push(mulRational(a, b));
        break;
      case '/':
        values.push(divRational(a, b));
        break;
      default:
        throw new Error(`ตัวดำเนินการไม่ถูกต้อง ${op}`);
    }
  }

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];
    if (/^\d+$/.test(token)) {
      values.push(makeRational(BigInt(token), 1n));
    } else if (token === '(') {
      ops.push(token);
    } else if (token === ')') {
      while (ops.length > 0 && ops[ops.length - 1] !== '(') {
        applyOp(ops.pop()!);
      }
      if (ops.length === 0) throw new Error('วงเล็บปิดไม่ตรงกับวงเล็บเปิด');
      ops.pop(); // Remove '('
    } else if (['+', '-', '*', '/'].includes(token)) {
      // Check for unary operator (+ or -)
      const isUnary = idx === 0 || ['(', '+', '-', '*', '/'].includes(tokens[idx - 1]);
      if (isUnary) {
        if (token === '+') {
          continue; // Unary plus can be ignored
        }
        if (token === '-') {
          values.push(makeRational(0n, 1n)); // Convert unary -X to 0 - X
        }
      }

      while (
        ops.length > 0 &&
        ops[ops.length - 1] !== '(' &&
        precedence[ops[ops.length - 1]] >= precedence[token]
      ) {
        applyOp(ops.pop()!);
      }
      ops.push(token);
    }
  }

  while (ops.length > 0) {
    const op = ops.pop()!;
    if (op === '(' || op === ')') throw new Error('วงเล็บไม่สมบูรณ์');
    applyOp(op);
  }

  if (values.length !== 1) throw new Error('การคำนวณไม่ถูกต้อง ตรวจสอบวงเล็บและเครื่องหมาย');
  return values[0];
}

/**
 * Parses and evaluates an arithmetic expression safely using BigInt/number logic
 */
export function evaluateArithmetic(expr: string): bigint {
  const r = evaluateArithmeticRational(expr);
  if (r.den !== 1n) {
    return r.num / r.den;
  }
  return r.num;
}

/**
 * Checks if the expression has a top-level division (Fraction Form A / B)
 * Returns null if there are addition/subtraction operators at top level,
 * or multiplication after division at top level, because in those cases
 * division is NOT the outermost operation of the expression.
 * E.g.
 * - "(C30,3 - C25,3) / C30,3" -> { numerator: "(C30,3 - C25,3)", denominator: "C30,3" }
 * - "C(4,1) * C(48,4) / C(52,5)" -> { numerator: "C(4,1) * C(48,4)", denominator: "C(52,5)" }
 * - "C(5,2) + C(5,1) / C(4,2)" -> null (top-level operator is +, so C(5,1)/C(4,2) is evaluated first)
 */
export function findTopLevelDivision(expr: string): {
  numerator: string;
  denominator: string;
} | null {
  let parenDepth = 0;
  let divIndex = -1;
  let hasTopLevelAddSub = false;
  let hasMultipleDiv = false;
  let hasMulAfterDiv = false;

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if (char === '(') {
      parenDepth++;
    } else if (char === ')') {
      parenDepth--;
    } else if (parenDepth === 0) {
      if (char === '+' || char === '-') {
        hasTopLevelAddSub = true;
      } else if (char === '/') {
        if (divIndex !== -1) {
          hasMultipleDiv = true;
        }
        divIndex = i;
      } else if (char === '*' && divIndex !== -1) {
        hasMulAfterDiv = true;
      }
    }
  }

  if (hasTopLevelAddSub || hasMultipleDiv || hasMulAfterDiv || divIndex === -1) {
    return null;
  }

  const num = expr.slice(0, divIndex).trim();
  const den = expr.slice(divIndex + 1).trim();
  if (num && den) {
    return { numerator: num, denominator: den };
  }

  return null;
}

/**
 * Evaluates a complete combinatorics expression with step-by-step reduction
 */
export function evaluateExpression(rawInput: string): ExpressionResult {
  const trimmed = rawInput.trim();
  if (!trimmed) throw new Error('กรุณากรอกนิพจน์ที่ต้องการคำนวณ');

  const sanitized = sanitizeExpression(trimmed);

  // Check if expression is a direct factorial quotient or single C/P term
  let topLevelCancellation: DetailedCancellation | undefined;
  const q3 = sanitized.match(/^(\d+)!\/\(?(\d+)![*×](\d+)!\)?$/);
  const q2 = sanitized.match(/^(\d+)!\/(\d+)!$/);
  if (q3) {
    topLevelCancellation = getQuotientCancellation(Number(q3[1]), Number(q3[2]), Number(q3[3]));
  } else if (q2) {
    topLevelCancellation = getQuotientCancellation(Number(q2[1]), Number(q2[2]));
  } else if (/^C(?:\(\d+,\d+\)|\d+,\d+)$/i.test(sanitized)) {
    const m = sanitized.match(/(\d+),(\d+)/);
    if (m) topLevelCancellation = getCombinationCancellation(Number(m[1]), Number(m[2]), true);
  } else if (/^P(?:\(\d+,\d+\)|\d+,\d+)$/i.test(sanitized)) {
    const m = sanitized.match(/(\d+),(\d+)/);
    if (m) topLevelCancellation = getPermutationCancellation(Number(m[1]), Number(m[2]));
  }

  // 1. Check if top-level expression is a single fraction A / B
  const topFraction = findTopLevelDivision(sanitized);

  if (topFraction) {
    const { subTerms: numSubTerms, replacedExpr: numReplaced } =
      extractAndEvaluateSubTerms(topFraction.numerator);
    const { subTerms: denSubTerms, replacedExpr: denReplaced } =
      extractAndEvaluateSubTerms(topFraction.denominator);

    const allSubTerms = [...numSubTerms, ...denSubTerms];

    const numRat = evaluateArithmeticRational(numReplaced);
    const denRat = evaluateArithmeticRational(denReplaced);

    if (denRat.num === 0n) throw new Error('ตัวส่วนมีค่าเป็น 0 ไม่สามารถหาผลลัพธ์ได้');

    const finalRat = divRational(numRat, denRat);
    const isPureIntegerFraction = numRat.den === 1n && denRat.den === 1n;
    const numVal = isPureIntegerFraction ? numRat.num : finalRat.num;
    const denVal = isPureIntegerFraction ? denRat.num : finalRat.den;

    const g = isPureIntegerFraction
      ? gcdBigInt(numVal < 0n ? -numVal : numVal, denVal < 0n ? -denVal : denVal)
      : 1n;
    const numReduced = finalRat.num;
    const denReduced = finalRat.den;
    const isReduced = g > 1n;

    const finalValStr =
      denReduced === 1n
        ? formatBigInt(numReduced)
        : `${formatBigInt(numReduced)} / ${formatBigInt(denReduced)}`;

    // Decimal approximation & percentage for probability
    const decimalNum = Number(numReduced) / Number(denReduced);
    const decimalString = Number.isFinite(decimalNum)
      ? decimalNum.toFixed(6).replace(/\.?0+$/, '')
      : undefined;
    const percentageString =
      Number.isFinite(decimalNum) && decimalNum >= 0 && decimalNum <= 1
        ? `${(decimalNum * 100).toFixed(2)}%`
        : undefined;

    const cancellationStep = isReduced
      ? {
          numBefore: numVal,
          numAfter: numReduced,
          denBefore: denVal,
          denAfter: denReduced,
          divisor: g,
          explanation: `ตัดทอนด้วยตัวหารร่วมมาก (ห.ร.ม. = ${formatBigInt(g)}): นำ ${formatBigInt(g)} ไปหาร ${formatBigInt(numVal)} เหลือ ${formatBigInt(numReduced)} และหาร ${formatBigInt(denVal)} เหลือ ${formatBigInt(denReduced)}`,
        }
      : undefined;

    const substitutedExprStr =
      isPureIntegerFraction && isReduced
        ? `(${numReplaced}) / (${denReplaced}) = ${formatBigInt(numVal)} / ${formatBigInt(denVal)} = ${finalValStr}`
        : `(${numReplaced}) / (${denReplaced}) = ${finalValStr}`;

    return {
      original: trimmed,
      sanitized,
      subTerms: allSubTerms,
      substitutedExpression: substitutedExprStr,
      isFraction: denReduced !== 1n,
      numeratorExpr: topFraction.numerator,
      denominatorExpr: topFraction.denominator,
      numeratorRaw: numVal,
      denominatorRaw: denVal,
      gcd: g,
      numeratorReduced: numReduced,
      denominatorReduced: denReduced,
      isReduced,
      finalValueString: finalValStr,
      decimalString,
      percentageString,
      cancellationStep,
      topLevelCancellation,
    };
  }

  // 2. Full arithmetic expression (respects PEMDAS: () -> * and / -> + and -)
  const { subTerms, replacedExpr } = extractAndEvaluateSubTerms(sanitized);
  const rational = evaluateArithmeticRational(replacedExpr);

  const isFraction = rational.den !== 1n;
  const numReduced = rational.num;
  const denReduced = rational.den;

  const finalValStr = isFraction
    ? `${formatBigInt(numReduced)} / ${formatBigInt(denReduced)}`
    : formatBigInt(numReduced);

  const decimalNum = isFraction ? Number(numReduced) / Number(denReduced) : Number(numReduced);
  const decimalString = Number.isFinite(decimalNum)
    ? decimalNum.toFixed(6).replace(/\.?0+$/, '')
    : undefined;
  const percentageString =
    Number.isFinite(decimalNum) && decimalNum >= 0 && decimalNum <= 1
      ? `${(decimalNum * 100).toFixed(2)}%`
      : undefined;

  // Format replaced expression with clean spacing around operators
  const formattedReplaced = replacedExpr
    .replace(/\s+/g, '')
    .replace(/([+\-*/])/g, ' $1 ');

  return {
    original: trimmed,
    sanitized,
    subTerms,
    substitutedExpression: `${formattedReplaced} = ${finalValStr}`,
    isFraction,
    numeratorRaw: isFraction ? numReduced : undefined,
    denominatorRaw: isFraction ? denReduced : undefined,
    numeratorReduced: isFraction ? numReduced : undefined,
    denominatorReduced: isFraction ? denReduced : undefined,
    gcd: isFraction ? 1n : undefined,
    isReduced: false,
    finalValueString: finalValStr,
    decimalString: isFraction ? decimalString : undefined,
    percentageString,
    topLevelCancellation,
  };
}
