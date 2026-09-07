import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMathEquation,
  stripOuterEnclosing,
  findTopLevelSlash,
} from '../lib/mathParser.ts';

test('parseMathEquation: Combination general formula แยกตัวเศษและตัวส่วนถูกต้อง ไม่มีวงเล็บส่วนเกิน', () => {
  const parsed = parseMathEquation('C(n, r) = n! / [r! × (n − r)!]');
  assert.equal(parsed.parts.length, 2);
  assert.equal(parsed.parts[0].raw, 'C(n, r)');
  assert.equal(parsed.parts[0].isFraction, false);
  assert.equal(parsed.operators[0], '=');
  assert.equal(parsed.parts[1].isFraction, true);
  assert.equal(parsed.parts[1].numerator, 'n!');
  assert.equal(parsed.parts[1].denominator, 'r! × (n − r)!');
  assert.equal(parsed.trailingNote, undefined);
});

test('parseMathEquation: Combination substitution แทนค่าเศษส่วนไม่กลายเป็นส่วนว่าง', () => {
  const parsed = parseMathEquation(
    'C(10, 3) = 10! / [3! × (10 − 3)!] = 10! / (3! × 7!)'
  );
  assert.equal(parsed.parts.length, 3);
  assert.equal(parsed.parts[0].raw, 'C(10, 3)');
  assert.equal(parsed.operators[0], '=');

  // Second part: 10! / [3! × (10 − 3)!]
  assert.equal(parsed.parts[1].isFraction, true);
  assert.equal(parsed.parts[1].numerator, '10!');
  assert.equal(parsed.parts[1].denominator, '3! × (10 − 3)!');
  assert.equal(parsed.operators[1], '=');

  // Third part: 10! / (3! × 7!)
  assert.equal(parsed.parts[2].isFraction, true);
  assert.equal(parsed.parts[2].numerator, '10!');
  assert.equal(parsed.parts[2].denominator, '3! × 7!');
  assert.equal(parsed.trailingNote, undefined);
});

test('parseMathEquation: Permutation general formula แยกเศษส่วนถูกต้อง', () => {
  const parsed = parseMathEquation('P(n, r) = n! / (n − r)!');
  assert.equal(parsed.parts.length, 2);
  assert.equal(parsed.parts[0].raw, 'P(n, r)');
  assert.equal(parsed.operators[0], '=');
  assert.equal(parsed.parts[1].isFraction, true);
  assert.equal(parsed.parts[1].numerator, 'n!');
  assert.equal(parsed.parts[1].denominator, '(n − r)!');
});

test('parseMathEquation: Permutation substitution แทนค่าครบถ้วน', () => {
  const parsed = parseMathEquation('P(8, 3) = 8! / (8 − 3)! = 8! / 5!');
  assert.equal(parsed.parts.length, 3);
  assert.equal(parsed.parts[0].raw, 'P(8, 3)');
  assert.equal(parsed.parts[1].numerator, '8!');
  assert.equal(parsed.parts[1].denominator, '(8 − 3)!');
  assert.equal(parsed.parts[2].numerator, '8!');
  assert.equal(parsed.parts[2].denominator, '5!');
});

test('parseMathEquation: Multiset ของซ้ำ แยกหมายเหตุ [โดยที่ n = ...] โดยไม่ตัดเครื่องหมาย = ในหมายเหตุ', () => {
  const parsed = parseMathEquation(
    'n! / (n₁! × n₂! × … × nₖ!)  [โดยที่ n = n₁ + n₂ + … + nₖ]'
  );
  assert.equal(parsed.parts.length, 1);
  assert.equal(parsed.operators.length, 0);
  assert.equal(parsed.parts[0].isFraction, true);
  assert.equal(parsed.parts[0].numerator, 'n!');
  assert.equal(parsed.parts[0].denominator, 'n₁! × n₂! × … × nₖ!');
  assert.equal(
    parsed.trailingNote,
    '[โดยที่ n = n₁ + n₂ + … + nₖ]'
  );
});

test('parseMathEquation: Multiset substitution แสดงตัวเลขกลุ่มซ้ำครบถ้วน', () => {
  const parsed = parseMathEquation('10! / (3! × 3! × 2! × 1! × 1!)');
  assert.equal(parsed.parts.length, 1);
  assert.equal(parsed.parts[0].isFraction, true);
  assert.equal(parsed.parts[0].numerator, '10!');
  assert.equal(parsed.parts[0].denominator, '3! × 3! × 2! × 1! × 1!');
});

test('parseMathEquation: Factorial general & substitution', () => {
  const general = parseMathEquation('n! = n × (n − 1) × … × 1');
  assert.equal(general.parts.length, 2);
  assert.equal(general.parts[0].raw, 'n!');
  assert.equal(general.parts[0].isFraction, false);
  assert.equal(general.parts[1].raw, 'n × (n − 1) × … × 1');
  assert.equal(general.parts[1].isFraction, false);

  const subst = parseMathEquation('5! = 5 × 4 × 3 × 2 × 1 = 120');
  assert.equal(subst.parts.length, 3);
  assert.equal(subst.parts[0].raw, '5!');
  assert.equal(subst.parts[1].raw, '5 × 4 × 3 × 2 × 1');
  assert.equal(subst.parts[2].raw, '120');
});

test('parseMathEquation: Complex expressions and relation operators (≈, \\implies)', () => {
  const approx = parseMathEquation('3 / 8 ≈ 0.375');
  assert.equal(approx.parts.length, 2);
  assert.equal(approx.parts[0].isFraction, true);
  assert.equal(approx.parts[0].numerator, '3');
  assert.equal(approx.parts[0].denominator, '8');
  assert.equal(approx.operators[0], '≈');
  assert.equal(approx.parts[1].raw, '0.375');

  const prob = parseMathEquation('{C(30,3) - C(25,3)} / C(30,3)');
  assert.equal(prob.parts.length, 1);
  assert.equal(prob.parts[0].isFraction, true);
  assert.equal(prob.parts[0].numerator, 'C(30,3) - C(25,3)');
  assert.equal(prob.parts[0].denominator, 'C(30,3)');
});
