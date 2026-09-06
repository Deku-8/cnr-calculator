export const MAX_INPUT = 10_000;

export type Calculation = {
  general: string;
  substituted: string;
  simplification: string;
  answer: string;
  answerLabel: string;
  note?: string;
};

export function parseNonNegativeInteger(value: string, label: string): number {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`กรุณากรอกค่า ${label}`);
  if (!/^\d+$/.test(trimmed)) throw new Error(`${label} ต้องเป็นจำนวนเต็มที่ไม่ติดลบ`);
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed)) throw new Error(`${label} มีค่ามากเกินไป`);
  if (parsed > MAX_INPUT) throw new Error(`${label} ต้องไม่เกิน ${MAX_INPUT.toLocaleString('th-TH')}`);
  return parsed;
}

export function factorial(n: number): bigint {
  if (!Number.isInteger(n) || n < 0) throw new Error('n ต้องเป็นจำนวนเต็มที่ไม่ติดลบ');
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result;
}

export function combination(n: number, r: number): bigint {
  validateNR(n, r);
  const k = Math.min(r, n - r);
  let result = 1n;
  for (let i = 1; i <= k; i++) result = (result * BigInt(n - k + i)) / BigInt(i);
  return result;
}

export function permutation(n: number, r: number): bigint {
  validateNR(n, r);
  let result = 1n;
  for (let i = 0; i < r; i++) result *= BigInt(n - i);
  return result;
}

export function factorialQuotient(a: number, b: number): { numerator: bigint; denominator: bigint } {
  validateSingle(a, 'ตัวเศษ');
  validateSingle(b, 'ตัวส่วน');
  return reduceFraction(factorial(a), factorial(b));
}

export function advancedFactorialQuotient(a: number, b: number, c: number): { numerator: bigint; denominator: bigint } {
  validateSingle(a, 'a');
  validateSingle(b, 'b');
  validateSingle(c, 'c');
  return reduceFraction(factorial(a), factorial(b) * factorial(c));
}

export function formatBigInt(value: bigint): string {
  const sign = value < 0n ? '-' : '';
  const digits = (value < 0n ? -value : value).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatFraction(numerator: bigint, denominator: bigint): string {
  return denominator === 1n ? formatBigInt(numerator) : `${formatBigInt(numerator)} / ${formatBigInt(denominator)}`;
}

export function descendingProduct(high: number, low: number): string {
  if (high < low) return '1';
  const count = high - low + 1;
  if (count <= 12) return Array.from({ length: count }, (_, i) => high - i).join(' × ');
  return `${high} × ${high - 1} × ${high - 2} × … × ${low + 1} × ${low}`;
}

export function factorialExpansion(n: number): string {
  if (n === 0 || n === 1) return '1';
  return descendingProduct(n, 1);
}

function validateNR(n: number, r: number) {
  validateSingle(n, 'n');
  validateSingle(r, 'r');
  if (r > n) throw new Error('r ต้องมีค่าไม่เกิน n');
}

function validateSingle(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} ต้องเป็นจำนวนเต็มที่ไม่ติดลบ`);
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function reduceFraction(numerator: bigint, denominator: bigint) {
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}
