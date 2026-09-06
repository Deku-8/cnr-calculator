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
