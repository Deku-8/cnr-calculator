import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTION_POOL, checkNumericAnswer, checkSubmission } from '../lib/practice.ts';

void test('PracticeTrainer: ตรวจสอบคำตอบทั้ง 25 ข้อด้วยค่าตัวเลขและรูปแบบที่ยอมรับ', () => {
  for (const q of QUESTION_POOL) {
    // 1. Exact number
    assert.equal(
      checkNumericAnswer(String(q.correctNumericAnswer), q),
      true,
      `Failed on question ${q.id} with numeric string ${q.correctNumericAnswer}`
    );

    // 2. Acceptable answers
    if (q.acceptableAnswers) {
      for (const ans of q.acceptableAnswers) {
        assert.equal(
          checkNumericAnswer(ans, q),
          true,
          `Failed on question ${q.id} with acceptable answer "${ans}"`
        );
      }
    }

    // 3. Reject completely wrong answer
    assert.equal(
      checkNumericAnswer('999999999', q),
      false,
      `Should reject false answer on question ${q.id}`
    );
  }
});

void test('PracticeTrainer: ข้อที่ 25 (จัดชาย 4 หญิง 4) รองรับทั้ง 1152, 1,152 และ 4!*4!*2', () => {
  const q25 = QUESTION_POOL.find((q) => q.id === 25)!;
  assert.equal(checkNumericAnswer('1152', q25), true);
  assert.equal(checkNumericAnswer('1,152', q25), true);
  assert.equal(checkNumericAnswer('4!*4!*2', q25), true);
  assert.equal(checkNumericAnswer('4! * 4! * 2', q25), true);
  assert.equal(checkNumericAnswer('100', q25), false);
});

void test('PracticeTrainer: ข้อที่ 22 (ความน่าจะเป็น) รองรับเศษส่วน 88/203 และทศนิยม 0.4335', () => {
  const q22 = QUESTION_POOL.find((q) => q.id === 22)!;
  assert.equal(checkNumericAnswer('88/203', q22), true);
  assert.equal(checkNumericAnswer('1760/4060', q22), true);
  assert.equal(checkNumericAnswer('0.4335', q22), true);
  assert.equal(checkNumericAnswer('0.43', q22), true);
  assert.equal(checkNumericAnswer('0.5', q22), false);
});

void test('PracticeTrainer: checkSubmission ครอบคลุม 5 เครื่องมือ และการเติมตัวเลข n, r, counts, expr', () => {
  // 1. Combination: ข้อ 5 (ชมรม 9 คน เลือก 4 คน)
  const q5 = QUESTION_POOL.find((q) => q.id === 5)!;
  const resC1 = checkSubmission({ mode: 'combination', n: '9', r: '4' }, q5);
  assert.equal(resC1.isModeCorrect, true);
  assert.equal(resC1.isParamsCorrect, true);
  assert.equal(resC1.isAllCorrect, true);
  assert.equal(resC1.userDisplayString, 'C(9, 4)');

  // Combination สมมาตร C(9, 5) ก็ถูกต้อง
  const resC2 = checkSubmission({ mode: 'combination', n: '9', r: '5' }, q5);
  assert.equal(resC2.isAllCorrect, true);

  // Combination เลือก r ผิด
  const resCWrong = checkSubmission({ mode: 'combination', n: '9', r: '3' }, q5);
  assert.equal(resCWrong.isModeCorrect, true);
  assert.equal(resCWrong.isParamsCorrect, false);
  assert.equal(resCWrong.isAllCorrect, false);

  // 2. Permutation: ข้อ 6 (เก้าอี้ 8 ตัว คน 3 คน)
  const q6 = QUESTION_POOL.find((q) => q.id === 6)!;
  const resP = checkSubmission({ mode: 'permutation', n: '8', r: '3' }, q6);
  assert.equal(resP.isAllCorrect, true);
  assert.equal(resP.userDisplayString, 'P(8, 3)');

  // Permutation ผิดเครื่องมือ (เลือก Combination แทน)
  const resPWrongMode = checkSubmission({ mode: 'combination', n: '8', r: '3' }, q6);
  assert.equal(resPWrongMode.isModeCorrect, false);
  assert.equal(resPWrongMode.isAllCorrect, false);

  // 3. Factorial: ข้อ 16 (หนังสือ 6 เล่ม)
  const q16 = QUESTION_POOL.find((q) => q.id === 16)!;
  const resF = checkSubmission({ mode: 'factorial', n: '6' }, q16);
  assert.equal(resF.isAllCorrect, true);
  assert.equal(resF.userDisplayString, '6!');

  // 4. Multiset: ข้อ 13 (ธง 9 ผืน: แดง 4, ขาว 3, น้ำเงิน 2)
  const q13 = QUESTION_POOL.find((q) => q.id === 13)!;
  const resM1 = checkSubmission({ mode: 'multiset', n: '9', multisetCounts: '4, 3, 2' }, q13);
  assert.equal(resM1.isAllCorrect, true);

  // Multiset: สลับลำดับกลุ่ม เช่น '2, 4, 3' ก็ยังถูกต้อง
  const resM2 = checkSubmission({ mode: 'multiset', n: '9', multisetCounts: '2, 4, 3' }, q13);
  assert.equal(resM2.isAllCorrect, true);

  // Multiset: ข้อ 12 (BANANA: A 3, N 2, B 1) ยอมรับทั้ง '3, 2, 1' และละ 1 เป็น '3, 2'
  const q12 = QUESTION_POOL.find((q) => q.id === 12)!;
  const resM3 = checkSubmission({ mode: 'multiset', n: '6', multisetCounts: '3, 2' }, q12);
  assert.equal(resM3.isAllCorrect, true);

  // Multiset: ผิดกลุ่ม
  const resMWrong = checkSubmission({ mode: 'multiset', n: '9', multisetCounts: '4, 4, 1' }, q13);
  assert.equal(resMWrong.isParamsCorrect, false);
  assert.equal(resMWrong.isAllCorrect, false);

  // 5. Expression: ข้อ 22 (ลูกแก้ว 30 ลูก ขาว 25 แดง 5 สุ่ม 3 ได้แดงอย่างน้อย 1)
  const q22 = QUESTION_POOL.find((q) => q.id === 22)!;
  const resExpr1 = checkSubmission({ mode: 'expression', expr: '{C(30,3) - C(25,3)} / C(30,3)' }, q22);
  assert.equal(resExpr1.isModeCorrect, true);
  assert.equal(resExpr1.isParamsCorrect, true);
  assert.equal(resExpr1.isAllCorrect, true);

  // Expression: ตอบในรูปเศษส่วนทอนแล้ว 88/203
  const resExpr2 = checkSubmission({ mode: 'expression', expr: '88/203' }, q22);
  assert.equal(resExpr2.isAllCorrect, true);

  // Expression: ข้อ 25 (ชาย 4 หญิง 4 นั่งสลับ)
  const q25 = QUESTION_POOL.find((q) => q.id === 25)!;
  const resExpr3 = checkSubmission({ mode: 'expression', expr: '4! * 4! * 2' }, q25);
  assert.equal(resExpr3.isAllCorrect, true);
});

