import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateExpression, sanitizeExpression } from '../lib/expression.ts';

void test('evaluateExpression: คำนวณหลายพจน์คูณกัน C(5,2) * C(6,2) * 3!', () => {
  // C(5,2) = 10, C(6,2) = 15, 3! = 6 -> 10 * 15 * 6 = 900
  const res = evaluateExpression('C(5,2) * C(6,2) * 3!');
  assert.equal(res.finalValueString, '900');
  assert.equal(res.subTerms.length, 3);
  assert.equal(res.isFraction, false);
});

void test('evaluateExpression: รองรับรูปแบบ C5,2*C6,2*3! (ไม่มีวงเล็บ)', () => {
  const res = evaluateExpression('C5,2*C6,2*3!');
  assert.equal(res.finalValueString, '900');
});

void test('evaluateExpression: ความน่าจะเป็น {C30,3 - C25,3} / C30,3 ตัดทอนเสมือนคำนวณมือ', () => {
  // C(30,3) = 4060, C(25,3) = 2300 -> 4060 - 2300 = 1760
  // 1760 / 4060 -> gcd = 20 -> 88 / 203
  const res = evaluateExpression('{C30,3 - C25,3} / C30,3');
  assert.equal(res.isFraction, true);
  assert.equal(res.numeratorRaw, 1760n);
  assert.equal(res.denominatorRaw, 4060n);
  assert.equal(res.gcd, 20n);
  assert.equal(res.numeratorReduced, 88n);
  assert.equal(res.denominatorReduced, 203n);
  assert.equal(res.finalValueString, '88 / 203');
  assert.ok(res.cancellationStep !== undefined);
  assert.equal(res.percentageString, '43.35%');
});

void test('evaluateExpression: ความน่าจะเป็นหยิบไพ่ได้ 1 เอซ', () => {
  // C(4,1) * C(48,4) / C(52,5)
  // C(4,1) = 4, C(48,4) = 194580 -> 778320
  // C(52,5) = 2598960
  // 778320 / 2598960 -> 3243 / 10829
  const res = evaluateExpression('C(4,1) * C(48,4) / C(52,5)');
  assert.equal(res.isFraction, true);
  assert.ok(res.numeratorReduced !== undefined);
  assert.ok(res.denominatorReduced !== undefined);
  assert.equal(res.percentageString, '29.95%');
});

void test('evaluateExpression: การบวกผลลัพธ์ P(5,3) + P(4,2)', () => {
  // P(5,3) = 60, P(4,2) = 12 -> 60 + 12 = 72
  const res = evaluateExpression('P(5,3) + P(4,2)');
  assert.equal(res.finalValueString, '72');
});

void test('evaluateExpression: ตัดทอนแฟกทอเรียล 10! / (7! * 3!) เหมือนในเครื่องมือก่อนนี้', () => {
  // 10! / (7! * 3!) = 120
  const res = evaluateExpression('10! / (7! * 3!)');
  assert.equal(res.finalValueString, '120');
  assert.ok(res.topLevelCancellation !== undefined);
  assert.equal(res.topLevelCancellation.hasFactorialCancellation, true);
  assert.equal(res.topLevelCancellation.canceledFactorial, 7);
});

void test('evaluateExpression: พจน์ย่อย C(30,3) มี detailedCancellation ในรูปแฟกทอเรียล', () => {
  const res = evaluateExpression('{C30,3 - C25,3} / C30,3');
  assert.ok(res.subTerms.length >= 2);
  const c30 = res.subTerms.find((t) => t.raw.includes('30'));
  assert.ok(c30 !== undefined);
  assert.ok(c30.detailedCancellation !== undefined);
  assert.equal(c30.detailedCancellation.canceledFactorial, 27);
});
