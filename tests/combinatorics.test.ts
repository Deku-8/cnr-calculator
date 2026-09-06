import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advancedFactorialQuotient,
  combination,
  factorial,
  factorialQuotient,
  parseNonNegativeInteger,
  permutation,
} from '../lib/combinatorics.ts';
import {
  getCombinationCancellation,
  getPermutationCancellation,
  getQuotientCancellation,
} from '../lib/cancellation.ts';

test('factorial รองรับค่าทั่วไปและนิยาม 0!', () => {
  assert.equal(factorial(5), 120n);
  assert.equal(factorial(0), 1n);
});

test('combination คำนวณแบบจำนวนเต็มแม่นยำ', () => {
  assert.equal(combination(10, 3), 120n);
  assert.equal(combination(52, 5), 2_598_960n);
  assert.equal(combination(10, 7), combination(10, 3));
});

test('permutation คำนวณลำดับได้ถูกต้อง', () => {
  assert.equal(permutation(8, 3), 336n);
  assert.equal(permutation(10, 0), 1n);
});

test('factorial quotient ย่อทั้งจำนวนเต็มและเศษส่วน', () => {
  assert.deepEqual(factorialQuotient(10, 7), { numerator: 720n, denominator: 1n });
  assert.deepEqual(factorialQuotient(5, 8), { numerator: 1n, denominator: 336n });
  assert.deepEqual(advancedFactorialQuotient(5, 2, 3), { numerator: 10n, denominator: 1n });
});

test('ปฏิเสธข้อมูลที่ไม่ถูกต้อง', () => {
  assert.throws(() => parseNonNegativeInteger('-1', 'n'), /จำนวนเต็มที่ไม่ติดลบ/);
  assert.throws(() => parseNonNegativeInteger('2.5', 'n'), /จำนวนเต็มที่ไม่ติดลบ/);
  assert.throws(() => combination(3, 4), /r ต้องมีค่าไม่เกิน n/);
  assert.throws(() => permutation(-1, 0), /จำนวนเต็มที่ไม่ติดลบ/);
});

test('cancellation engine: Combination C(10, 3) ตัดทอนอย่างถูกต้อง', () => {
  const result = getCombinationCancellation(10, 3);
  assert.equal(result.hasFactorialCancellation, true);
  assert.equal(result.canceledFactorial, 7);
  assert.deepEqual(result.initialNumeratorFactors, [10, 9, 8]);
  assert.deepEqual(result.initialDenominatorFactors, [3, 2, 1]);
  // Check that all denominator terms reduce to 1
  for (const d of result.finalDenominatorFactors) {
    assert.equal(d, 1);
  }
  assert.equal(result.finalAnswer, '120');
});

test('cancellation engine: Permutation P(8, 3) ตัดทอน factorial ส่วนล่าง', () => {
  const result = getPermutationCancellation(8, 3);
  assert.equal(result.hasFactorialCancellation, true);
  assert.equal(result.canceledFactorial, 5);
  assert.deepEqual(result.initialNumeratorFactors, [8, 7, 6]);
  assert.equal(result.finalAnswer, '336');
});

test('cancellation engine: Quotient 10! / (7! * 3!) ตัดทอนถูกต้อง', () => {
  const result = getQuotientCancellation(10, 7, 3);
  assert.equal(result.hasFactorialCancellation, true);
  assert.equal(result.canceledFactorial, 7);
  assert.equal(result.isInteger, true);
  assert.equal(result.finalAnswer, '120');
});

test('multisetPermutation คำนวณสิ่งของที่ซ้ำกันถูกต้อง', async () => {
  const { multisetPermutation } = await import('../lib/combinatorics.ts');
  const { getMultisetPermutationCancellation } = await import('../lib/cancellation.ts');

  // "STATISTICS": S=3, T=3, A=1, I=2, C=1 -> 10! / (3! 3! 2! 1! 1!) = 50,400
  assert.equal(multisetPermutation([3, 3, 2, 1, 1]), 50_400n);

  // "BANANA": B=1, A=3, N=2 -> 6! / (3! 2! 1!) = 60
  assert.equal(multisetPermutation([3, 2, 1]), 60n);

  // Cancellation for BANANA: 6! / (3! 2! 1!)
  const bananaResult = getMultisetPermutationCancellation([3, 2, 1]);
  assert.equal(bananaResult.hasFactorialCancellation, true);
  assert.equal(bananaResult.canceledFactorial, 3);
  assert.equal(bananaResult.finalAnswer, '60');
  // Denominator should be reduced to 1
  for (const d of bananaResult.finalDenominatorFactors) {
    assert.equal(d, 1);
  }
});
