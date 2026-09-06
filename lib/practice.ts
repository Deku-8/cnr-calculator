import { evaluateExpression } from './expression.ts';
import type { Mode } from '../components/calculator/ModeTabs';
import type { Values } from '../components/calculator/CalculatorForm';

export type Question = {
  id: number;
  category: string;
  scenario: string;
  correctMode: Mode;
  values: Partial<Values>;
  multisetCounts?: number[];
  multisetLabels?: string[];
  explanation: string;
  hint: string;
  formulaDisplay: string;
  correctNumericAnswer: number;
  answerDisplay: string;
  acceptableAnswers?: string[];
};

export const QUESTION_POOL: Question[] = [
  // --- COMBINATION (5 questions) ---
  {
    id: 1,
    category: 'การเลือกตัวแทน',
    scenario:
      'ครูต้องการเลือกนักเรียน 3 คน จากทั้งหมด 10 คน ไปเป็นตัวแทนตอบปัญหาวิชาการ (ทุกคนในทีมมีบทบาทเท่าเทียมกัน)',
    correctMode: 'combination',
    values: { n: '10', r: '3' },
    formulaDisplay: 'C(10, 3)',
    correctNumericAnswer: 120,
    answerDisplay: '120',
    acceptableAnswers: ['120', 'C(10,3)', 'C(10, 3)', 'C10,3'],
    explanation:
      'ทุกคนในทีมมีบทบาทเท่ากัน การเลือก ก ก่อน ข หรือ ข ก่อน ก ได้ทีมเดียวกัน (ไม่สนใจลำดับ) จึงใช้ Combination: C(10, 3) = 120 วิธี',
    hint: 'ลองพิจารณาว่า: ถ้าสลับลำดับคนที่เลือกมา จะถือเป็นทีมใหม่หรือไม่? และคำนวณ C(10, 3) = 10! / (7! × 3!)',
  },
  {
    id: 2,
    category: 'เกมและการเลือกไพ่',
    scenario:
      'ในสำรับไพ่ 52 ใบ แจกไพ่ให้ผู้เล่นคนหนึ่ง 5 ใบ โดยหน้าไพ่ในมือรวมกันไม่สนใจว่าใบไหนถูกแจกก่อนหรือหลัง',
    correctMode: 'combination',
    values: { n: '52', r: '5' },
    formulaDisplay: 'C(52, 5)',
    correctNumericAnswer: 2598960,
    answerDisplay: '2,598,960',
    acceptableAnswers: ['2598960', '2,598,960', 'C(52,5)', 'C(52, 5)', 'C52,5'],
    explanation:
      'ไพ่ 5 ใบที่ถืออยู่บนมือ จะได้ใบไหนก่อนหลังก็ได้ชุดไพ่เดิม (ไม่สนใจลำดับการหยิบ) จึงใช้ Combination: C(52, 5) = 2,598,960 วิธี',
    hint: 'หยิบไพ่ได้ A ก่อน K หรือ K ก่อน A หน้าไพ่ในมือเปลี่ยนไปหรือไม่?',
  },
  {
    id: 3,
    category: 'การทักทายในงานเลี้ยง',
    scenario:
      'ในงานสังสรรค์มีผู้เข้าร่วม 12 คน ถ้าทุกคนจับมือทักทายกันคนละหนึ่งครั้งกับทุกคน จะมีการจับมือเกิดขึ้นทั้งหมดกี่ครั้ง',
    correctMode: 'combination',
    values: { n: '12', r: '2' },
    formulaDisplay: 'C(12, 2)',
    correctNumericAnswer: 66,
    answerDisplay: '66',
    acceptableAnswers: ['66', 'C(12,2)', 'C(12, 2)', 'C12,2'],
    explanation:
      'การจับมือ 1 ครั้งเกิดจากคน 2 คน ไม่ว่า ก จับมือ ข หรือ ข จับมือ ก ก็นับเป็นการจับมือเดียวกัน 1 ครั้ง จึงเป็นการเลือก 2 จาก 12 คนแบบไม่สนใจลำดับ: C(12, 2) = 66 ครั้ง',
    hint: 'นาย ก จับมือกับ นาย ข ถือเป็นเหตุการณ์เดียวกับ นาย ข จับมือกับ นาย ก หรือไม่?',
  },
  {
    id: 4,
    category: 'เรขาคณิตและจุดบนระนาบ',
    scenario:
      'มีจุด 8 จุดอยู่บนเส้นรอบวงของวงกลมหนึ่ง จะสามารถลากเส้นเชื่อมจุดเพื่อสร้างรูปสามเหลี่ยมได้ทั้งหมดกี่รูป',
    correctMode: 'combination',
    values: { n: '8', r: '3' },
    formulaDisplay: 'C(8, 3)',
    correctNumericAnswer: 56,
    answerDisplay: '56',
    acceptableAnswers: ['56', 'C(8,3)', 'C(8, 3)', 'C8,3'],
    explanation:
      'การสร้างรูปสามเหลี่ยมต้องเลือกจุดยอด 3 จุดจาก 8 จุด โดยสามเหลี่ยม ABC กับ CBA คือรูปเดียวกัน จึงไม่สนใจลำดับ ใช้ Combination: C(8, 3) = 56 รูป',
    hint: 'จุดยอดสามเหลี่ยม ABC กับ BAC ถือเป็นรูปสามเหลี่ยมคนละรูปหรือไม่?',
  },
  {
    id: 5,
    category: 'การจัดทีมทำโครงงาน',
    scenario:
      'มีสมาชิกในชมรมวิทยาศาสตร์ 9 คน ต้องการเลือกตัวแทน 4 คนไปนำเสนอผลงาน โดยทุกคนทำหน้าที่ร่วมกันเท่าเทียมกัน',
    correctMode: 'combination',
    values: { n: '9', r: '4' },
    formulaDisplay: 'C(9, 4)',
    correctNumericAnswer: 126,
    answerDisplay: '126',
    acceptableAnswers: ['126', 'C(9,4)', 'C(9, 4)', 'C9,4'],
    explanation:
      'เป็นการเลือกกลุ่มคน 4 คนจาก 9 คนโดยไม่มีการแบ่งตำแหน่งหน้าที่ (ไม่สนใจลำดับการถูกเลือก) จึงใช้ Combination: C(9, 4) = 126 วิธี',
    hint: 'ไม่มีการกำหนดตำแหน่งหัวหน้าหรือหน้าที่เฉพาะ ทุกคนมีสถานะเท่ากัน',
  },

  // --- PERMUTATION (5 questions) ---
  {
    id: 6,
    category: 'การแข่งขันกีฬา',
    scenario:
      'นักวิ่ง 8 คน วิ่งแข่งขันระยะ 100 เมตร เพื่อมอบเหรียญทอง, เหรียญเงิน และเหรียญทองแดง ตามลำดับการเข้าเส้นชัย',
    correctMode: 'permutation',
    values: { n: '8', r: '3' },
    formulaDisplay: 'P(8, 3)',
    correctNumericAnswer: 336,
    answerDisplay: '336',
    acceptableAnswers: ['336', 'P(8,3)', 'P(8, 3)', 'P8,3'],
    explanation:
      'เหรียญทอง เงิน และทองแดง เป็นตำแหน่งที่มีความต่างกันชัดเจน ลำดับที่เข้าเส้นชัยมีความสำคัญมาก จึงใช้ Permutation: P(8, 3) = 8 × 7 × 6 = 336 วิธี',
    hint: 'คนได้ที่ 1 กับได้ที่ 2 มีผลต่างกันชัดเจน ลำดับมีความหมายหรือไม่?',
  },
  {
    id: 7,
    category: 'ความปลอดภัยและรหัสผ่าน',
    scenario: 'ตั้งรหัสผ่าน PIN ตู้เซฟ 4 หลัก จากเลขโดด 0 ถึง 9 โดยห้ามใช้ตัวเลขซ้ำกันเลย',
    correctMode: 'permutation',
    values: { n: '10', r: '4' },
    formulaDisplay: 'P(10, 4)',
    correctNumericAnswer: 5040,
    answerDisplay: '5,040',
    acceptableAnswers: ['5040', '5,040', 'P(10,4)', 'P(10, 4)', 'P10,4'],
    explanation:
      'รหัส เช่น 1234 กับ 4321 เปิดตู้เซฟคนละอันกันอย่างแน่นอน ลำดับของตัวเลขมีความสำคัญ จึงใช้ Permutation: P(10, 4) = 10 × 9 × 8 × 7 = 5,040 รหัส',
    hint: 'รหัส 1234 กับ 4321 ถือเป็นรหัสเดียวกันหรือไม่?',
  },
  {
    id: 8,
    category: 'การแต่งตั้งตำแหน่ง',
    scenario:
      'มีผู้สมัคร 7 คน ต้องการคัดเลือกคนมารับตำแหน่ง ประธาน, รองประธาน และเหรัญญิก ตำแหน่งละ 1 คน',
    correctMode: 'permutation',
    values: { n: '7', r: '3' },
    formulaDisplay: 'P(7, 3)',
    correctNumericAnswer: 210,
    answerDisplay: '210',
    acceptableAnswers: ['210', 'P(7,3)', 'P(7, 3)', 'P7,3'],
    explanation:
      'แต่ละตำแหน่งมีบทบาทและอำนาจหน้าที่ต่างกัน การที่นาย ก เป็นประธาน ต่างจากนาย ก เป็นเหรัญญิก (สนใจลำดับ/ตำแหน่ง) จึงใช้ Permutation: P(7, 3) = 7 × 6 × 5 = 210 วิธี',
    hint: 'ตำแหน่ง ประธาน กับ เหรัญญิก ถือเป็นตำแหน่งเดียวกันหรือไม่?',
  },
  {
    id: 9,
    category: 'การจัดอันดับยอดนิยม',
    scenario:
      'มีเพลงส่งเข้าประกวด 10 เพลง กรรมการต้องการตัดสินจัดอันดับเพลงยอดเยี่ยม Top 3 (อันดับ 1, อันดับ 2 และอันดับ 3)',
    correctMode: 'permutation',
    values: { n: '10', r: '3' },
    formulaDisplay: 'P(10, 3)',
    correctNumericAnswer: 720,
    answerDisplay: '720',
    acceptableAnswers: ['720', 'P(10,3)', 'P(10, 3)', 'P10,3'],
    explanation:
      'การได้อันดับ 1, 2, 3 มีความแตกต่างกันชัดเจน ลำดับมีผลต่อผลลัพธ์ จึงใช้ Permutation: P(10, 3) = 10 × 9 × 8 = 720 วิธี',
    hint: 'เพลงที่ได้แชมป์อันดับ 1 กับได้อันดับ 3 มีผลต่างกันหรือไม่?',
  },
  {
    id: 10,
    category: 'การจัดที่นั่งตามลำดับ',
    scenario:
      'มีเก้าอี้ว่าง 5 ตัวเรียงแถวหน้ากระดาน มีผู้โดยสาร 3 คนต้องการเลือกนั่งเก้าอี้คนละตัว จะจัดได้กี่วิธี',
    correctMode: 'permutation',
    values: { n: '5', r: '3' },
    formulaDisplay: 'P(5, 3)',
    correctNumericAnswer: 60,
    answerDisplay: '60',
    acceptableAnswers: ['60', 'P(5,3)', 'P(5, 3)', 'P5,3'],
    explanation:
      'เก้าอี้แต่ละตัวตั้งอยู่คนละตำแหน่ง การที่คนหนึ่งนั่งเก้าอี้ตัวที่ 1 กับตัวที่ 2 ให้ภาพการจัดที่นั่งที่ต่างกัน จึงสนใจลำดับ ใช้ Permutation: P(5, 3) = 5 × 4 × 3 = 60 วิธี',
    hint: 'เก้าอี้แต่ละตัวมีตำแหน่งซ้าย-ขวาชัดเจน คนนั่งเก้าอี้ต่างตัวกันให้ผลต่างกันหรือไม่?',
  },

  // --- MULTISET (ของซ้ำ) (5 questions) ---
  {
    id: 11,
    category: 'การเรียงตัวอักษรซ้ำ',
    scenario:
      'นำตัวอักษรทั้งหมดจากคำว่า "STATISTICS" (มีตัว S=3, T=3, A=1, I=2, C=1) มาเรียงสับเปลี่ยนเป็นคำใหม่',
    correctMode: 'multiset',
    values: { n: '10' },
    multisetCounts: [3, 3, 2, 1, 1],
    multisetLabels: ['S: 3', 'T: 3', 'I: 2', 'A: 1', 'C: 1'],
    formulaDisplay: '10! / (3! × 3! × 2! × 1! × 1!)',
    correctNumericAnswer: 50400,
    answerDisplay: '50,400',
    acceptableAnswers: ['50400', '50,400'],
    explanation:
      'มีตัวอักษรทั้งหมด 10 ตัว แต่มีตัวซ้ำกันคือ S ซ้ำ 3, T ซ้ำ 3, I ซ้ำ 2, A ซ้ำ 1, C ซ้ำ 1 จึงหารออกด้วยแฟกทอเรียลของของที่ซ้ำกัน: 10! / (3! × 3! × 2! × 1! × 1!) = 50,400 วิธี',
    hint: 'สังเกตว่ามีตัวอักษรที่ซ้ำกันอยู่หลายตัวหรือไม่?',
  },
  {
    id: 12,
    category: 'การเรียงตัวอักษรซ้ำ',
    scenario: 'นำตัวอักษรจากคำว่า "BANANA" มาเรียงสับเปลี่ยนทั้งหมด จะได้คำที่แตกต่างกันกี่คำ',
    correctMode: 'multiset',
    values: { n: '6' },
    multisetCounts: [3, 2, 1],
    multisetLabels: ['A: 3', 'N: 2', 'B: 1'],
    formulaDisplay: '6! / (3! × 2! × 1!)',
    correctNumericAnswer: 60,
    answerDisplay: '60',
    acceptableAnswers: ['60'],
    explanation:
      'คำว่า BANANA มี 6 ตัวอักษร โดยมี A ซ้ำ 3 ตัว, N ซ้ำ 2 ตัว และ B ซ้ำ 1 ตัว จึงใช้สูตรการเรียงสับเปลี่ยนของซ้ำ: 6! / (3! × 2! × 1!) = 60 คำ',
    hint: 'มีตัว A ซ้ำ 3 ตัว และตัว N ซ้ำ 2 ตัว สลับที่กันเองก็ดูไม่ออก',
  },
  {
    id: 13,
    category: 'สัญญาณไฟและสี',
    scenario:
      'นำธงสัญญาณสีแดง 4 ผืน, สีขาว 3 ผืน และสีน้ำเงิน 2 ผืน (สีเดียวกันเหมือนกันทุกประการ) มาแขวนเรียงเป็นแถวแนวดิ่ง',
    correctMode: 'multiset',
    values: { n: '9' },
    multisetCounts: [4, 3, 2],
    multisetLabels: ['แดง: 4', 'ขาว: 3', 'น้ำเงิน: 2'],
    formulaDisplay: '9! / (4! × 3! × 2!)',
    correctNumericAnswer: 1260,
    answerDisplay: '1,260',
    acceptableAnswers: ['1260', '1,260'],
    explanation:
      'มีธงรวม 9 ผืน โดยมีธงสีแดงซ้ำ 4 ผืน, สีขาวซ้ำ 3 ผืน, สีน้ำเงินซ้ำ 2 ผืน จึงเป็นการเรียงสับเปลี่ยนสิ่งของที่ซ้ำกัน: 9! / (4! × 3! × 2!) = 1,260 วิธี',
    hint: 'ธงสีเดียวกันหน้าตาเหมือนกันทุกประการ สลับที่กันเองก็ไม่เกิดรูปแบบใหม่',
  },
  {
    id: 14,
    category: 'การจัดเรียงลูกปัดหลากสี',
    scenario:
      'มีลูกปัดสีแดง 5 ลูก, สีเหลือง 4 ลูก และสีเขียว 3 ลูก (สีเดียวกันเหมือนกันทุกประการ) นำมาร้อยเป็นเส้นตรงยาว',
    correctMode: 'multiset',
    values: { n: '12' },
    multisetCounts: [5, 4, 3],
    multisetLabels: ['แดง: 5', 'เหลือง: 4', 'เขียว: 3'],
    formulaDisplay: '12! / (5! × 4! × 3!)',
    correctNumericAnswer: 27720,
    answerDisplay: '27,720',
    acceptableAnswers: ['27720', '27,720'],
    explanation:
      'ของทั้งหมด 12 ชิ้น มีของซ้ำกัน 3 กลุ่ม คือ สีแดง 5 ชิ้น, สีเหลือง 4 ชิ้น, สีเขียว 3 ชิ้น จึงใช้สูตรของซ้ำ: 12! / (5! × 4! × 3!) = 27,720 วิธี',
    hint: 'ลูกปัดสีเดียวกันเหมือนกันทุกประการ',
  },
  {
    id: 15,
    category: 'การเดินตามตารางกริด (Lattice Path)',
    scenario:
      'ต้องการเดินทางจากมุมล่างซ้าย (0,0) ไปยังมุมบนขวา (4,3) ของตาราง โดยเดินได้เฉพาะก้าวไปทางขวา (R) 4 ครั้ง และก้าวขึ้นบน (U) 3 ครั้ง',
    correctMode: 'multiset',
    values: { n: '7' },
    multisetCounts: [4, 3],
    multisetLabels: ['ขวา (R): 4', 'ขึ้น (U): 3'],
    formulaDisplay: '7! / (4! × 3!)',
    correctNumericAnswer: 35,
    answerDisplay: '35',
    acceptableAnswers: ['35'],
    explanation:
      'การเดินทางต้องประกอบด้วยก้าว R ทั้งหมด 4 ก้าว และก้าว U ทั้งหมด 3 ก้าว สลับลำดับกัน เปรียบเสมือนการเรียงตัวอักษร RRRRUUU ซึ่งมีของซ้ำ: 7! / (4! × 3!) = 35 เส้นทาง',
    hint: 'เหมือนการเรียงตัวอักษร R 4 ตัว และ U 3 ตัวสลับกัน',
  },

  // --- FACTORIAL (5 questions) ---
  {
    id: 16,
    category: 'การจัดสลับที่สิ่งของ',
    scenario:
      'มีหนังสือที่แตกต่างกัน 6 เล่ม ต้องการนำหนังสือทุกเล่มมาจัดเรียงบนหิ้งแถวตรงจากซ้ายไปขวา',
    correctMode: 'factorial',
    values: { n: '6' },
    formulaDisplay: '6!',
    correctNumericAnswer: 720,
    answerDisplay: '720',
    acceptableAnswers: ['720', '6!'],
    explanation:
      'เป็นการนำสิ่งของที่แตกต่างกัน "ทั้งหมด" 6 สิ่ง มาเรียงสับเปลี่ยนเป็นเส้นตรง จึงใช้ Factorial: 6! = 720 วิธี',
    hint: 'ของทั้งหมด 6 ชิ้น นำมาเรียงทั้งหมด ไม่มีของเหลือและไม่มีของซ้ำ',
  },
  {
    id: 17,
    category: 'การจัดคิวเข้าแถว',
    scenario:
      'มีลูกค้า 5 คนยืนต่อคิวซื้อตั๋วภาพยนตร์ที่เคาน์เตอร์แถวเดียว จะสามารถจัดลำดับการเข้าคิวได้กี่วิธี',
    correctMode: 'factorial',
    values: { n: '5' },
    formulaDisplay: '5!',
    correctNumericAnswer: 120,
    answerDisplay: '120',
    acceptableAnswers: ['120', '5!'],
    explanation:
      'คน 5 คนที่ต่างกัน นำมาเข้าแถวเรียงกันทั้งหมด ลำดับในคิวมีผล จึงคำนวณด้วย 5! = 120 วิธี',
    hint: 'คน 5 คน เรียงแถวตรง 5 ตำแหน่ง สลับได้ทั้งหมด n! วิธี',
  },
  {
    id: 18,
    category: 'การจัดวางต้นไม้ประดับ',
    scenario:
      'มีกระถางไม้ดอกพันธุ์ต่างกัน 7 ชนิด ต้องการนำมาเรียงประดับเป็นแนวยาวริมรั้วหน้าบ้าน',
    correctMode: 'factorial',
    values: { n: '7' },
    formulaDisplay: '7!',
    correctNumericAnswer: 5040,
    answerDisplay: '5,040',
    acceptableAnswers: ['5040', '5,040', '7!'],
    explanation:
      'กระถางต้นไม้ต่างกัน 7 ใบ นำมาวางเรียงเป็นเส้นตรงทั้งหมดครบทุกใบ (r = n) เมื่อจัดเรียงสิ่งของทั้งหมดพร้อมกัน P(7, 7) = 7! ซึ่งจะซ้ำกับ Factorial จึงใช้เครื่องมือ Factorial: 7! = 5,040 วิธี',
    hint: 'สิ่งของต่างกันทั้งหมด 7 ชิ้น นำมาเรียงสลับที่ทั้งหมด (กรณีจัดเรียงทั้งหมด r = n จึงใช้สูตร Factorial n!)',
  },
  {
    id: 19,
    category: 'การเรียงตัวอักษรที่ต่างกัน',
    scenario:
      'นำตัวอักษรทั้งหมดจากคำว่า "MATH" (ไม่มีตัวอักษรซ้ำกันเลย) มาเรียงสับเปลี่ยนเป็นคำใหม่ทั้งหมด',
    correctMode: 'factorial',
    values: { n: '4' },
    formulaDisplay: '4!',
    correctNumericAnswer: 24,
    answerDisplay: '24',
    acceptableAnswers: ['24', '4!'],
    explanation:
      'คำว่า MATH มี 4 ตัวอักษรที่แตกต่างกันทั้งหมด เมื่อนำมาสลับที่กันทั้งหมดจะทำได้ 4! = 24 วิธี',
    hint: 'ตัวอักษร 4 ตัวต่างกันทั้งหมด นำมาเรียงทั้งหมด',
  },
  {
    id: 20,
    category: 'ลำดับการขึ้นพูดสัมมนา',
    scenario:
      'มีวิทยากร 8 ท่าน กำหนดให้ขึ้นบรรยายทีละคนจนครบทุกคน จะสามารถจัดลำดับการขึ้นพูดได้กี่แบบ',
    correctMode: 'factorial',
    values: { n: '8' },
    formulaDisplay: '8!',
    correctNumericAnswer: 40320,
    answerDisplay: '40,320',
    acceptableAnswers: ['40320', '40,320', '8!'],
    explanation:
      'วิทยากร 8 คน นำมาจัดลำดับก่อนหลังในการขึ้นพูดจนครบทุกคน จึงคำนวณด้วย 8! = 40,320 แบบ',
    hint: 'วิทยากร 8 คน จัดลำดับ 1 ถึง 8 ครบทุกคน',
  },

  // --- EXPRESSION / เครื่องคิดเลข (5 questions) ---
  {
    id: 21,
    category: 'การคัดเลือกหลายกลุ่มและจัดแถว',
    scenario:
      'เลือกตัวแทนชาย 2 คนจาก 5 คน และเลือกตัวแทนหญิง 2 คนจาก 6 คน จากนั้นนำตัวแทน 3 คนที่กำหนดมาจัดลำดับยืนถ่ายรูปได้ 3! วิธี',
    correctMode: 'expression',
    values: { expr: 'C(5, 2) * C(6, 2) * 3!' },
    formulaDisplay: 'C(5,2) × C(6,2) × 3!',
    correctNumericAnswer: 900,
    answerDisplay: '900',
    acceptableAnswers: ['900', 'C(5,2)*C(6,2)*3!', 'C(5, 2) * C(6, 2) * 3!'],
    explanation:
      'เป็นโจทย์หลายขั้นตอนต่อเนื่องตามกฎการคูณ: ขั้นแรกเลือกชาย C(5,2) = 10 ขั้นสองเลือกหญิง C(6,2) = 15 ขั้นสามสลับที่ 3! = 6 จึงได้ 10 × 15 × 6 = 900 วิธี',
    hint: 'มีขั้นตอนการเลือก 2 กลุ่ม แล้วนำมาคูณกัน และคูณด้วยการจัดเรียงอีกที',
  },
  {
    id: 22,
    category: 'ความน่าจะเป็นแบบคอมพลีเมนต์',
    scenario:
      'มีสลาก 30 ใบ เป็นสลากมีรางวัล 5 ใบ สุ่มหยิบมา 3 ใบ หาความน่าจะเป็นที่จะได้สลากมีรางวัล "อย่างน้อย 1 ใบ"',
    correctMode: 'expression',
    values: { expr: '{C(30, 3) - C(25, 3)} / C(30, 3)' },
    formulaDisplay: '{C(30,3) - C(25,3)} / C(30,3)',
    correctNumericAnswer: 1760 / 4060,
    answerDisplay: '88/203 (~0.4335)',
    acceptableAnswers: ['88/203', '1760/4060', '0.4335', '0.433', '0.43', '43.35%', '43.4%'],
    explanation:
      'คิดแบบตรงข้าม (1 - ไม่ได้รางวัลเลย): {C(30,3) - C(25,3)} / C(30,3) = (4,060 - 2,300) / 4,060 = 1,760 / 4,060 = 88 / 203 (หรือประมาณ 0.4335)',
    hint: 'หาความน่าจะเป็นที่มีทั้งการลบกันของ Combination แล้วหารด้วย Combination ทั้งหมด',
  },
  {
    id: 23,
    category: 'ความน่าจะเป็นในการหยิบไพ่',
    scenario:
      'สุ่มหยิบไพ่ 5 ใบจากสำรับ 52 ใบ หาความน่าจะเป็นที่จะได้ไพ่เอซ (Ace) พอดี 1 ใบ และไพ่หน้าอื่นๆ 4 ใบ',
    correctMode: 'expression',
    values: { expr: '{C(4, 1) * C(48, 4)} / C(52, 5)' },
    formulaDisplay: '{C(4,1) × C(48,4)} / C(52,5)',
    correctNumericAnswer: 778320 / 2598960,
    answerDisplay: '3243/10829 (~0.2995)',
    acceptableAnswers: ['3243/10829', '778320/2598960', '0.2995', '0.30', '0.299', '29.95%', '30%'],
    explanation:
      'เลือกเอซ 1 ใบจาก 4 ใบ C(4,1) คูณกับเลือกไพ่อื่น 4 ใบจาก 48 ใบ C(48,4) แล้วหารด้วย C(52,5) = (4 × 194,580) / 2,598,960 = 3,243 / 10,829 (หรือประมาณ 0.2995)',
    hint: 'เป็นความน่าจะเป็นที่ตัวเศษเป็นผลคูณของ Combination สองพจน์ และตัวส่วนเป็น Combination',
  },
  {
    id: 24,
    category: 'การบวกผลลัพธ์แยกกรณี',
    scenario:
      'จัดลำดับบุคคลเข้ารับรางวัลเป็น 2 กรณีที่แยกขาดจากกัน: กรณี A มี 5 คนเลือก 3 ตำแหน่ง หรือ กรณี B มี 4 คนเลือก 2 ตำแหน่ง',
    correctMode: 'expression',
    values: { expr: 'P(5, 3) + P(4, 2)' },
    formulaDisplay: 'P(5, 3) + P(4, 2)',
    correctNumericAnswer: 72,
    answerDisplay: '72',
    acceptableAnswers: ['72', 'P(5,3)+P(4,2)', 'P(5, 3) + P(4, 2)'],
    explanation:
      'ตามกฎการบวก เมื่อโจทย์แบ่งเป็น 2 กรณีที่เกิดขึ้นพร้อมกันไม่ได้ ให้นำผลลัพธ์มาบวกกัน: P(5,3) + P(4,2) = 60 + 12 = 72 วิธี',
    hint: 'มีสองกรณีแยกกันอย่างอิสระ นำผลลัพธ์ของ Permutation สองชุดมาบวกกัน',
  },
  {
    id: 25,
    category: 'การจัดที่นั่งแบบแบ่งกลุ่มและสลับหัวแถว',
    scenario:
      'จัดชาย 4 คน และหญิง 4 คน นั่งสลับที่กันเป็นแถวยาว โดยสลับที่ภายในกลุ่มชายได้ 4! สลับภายในกลุ่มหญิงได้ 4! และสลับตำแหน่งหัวแถว (ชายหรือหญิงขึ้นก่อน) ได้ 2 วิธี',
    correctMode: 'expression',
    values: { expr: '4! * 4! * 2' },
    formulaDisplay: '4! × 4! × 2',
    correctNumericAnswer: 1152,
    answerDisplay: '1,152',
    acceptableAnswers: ['1152', '1,152', '4!*4!*2', '4! * 4! * 2'],
    explanation:
      'เกิดจากการคูณกันของหลายพจน์แฟกทอเรียลและค่าคงที่: 4! × 4! × 2 = 24 × 24 × 2 = 1,152 วิธี',
    hint: 'มีแฟกทอเรียลสองพจน์คูณกันแล้วคูณด้วย 2 (24 × 24 × 2)',
  },
];

export const QUESTIONS = QUESTION_POOL;

/**
 * ตรวจสอบคำตอบที่เป็น Expression หรือตัวเลขคำตอบ
 * รองรับทั้งการพิมพ์ในรูป Cnr, Pnr, แฟกทอเรียล, เศษส่วน, ทศนิยม และการดำเนินการทางคณิตศาสตร์
 */
export const checkNumericAnswer = checkExpressionAnswer;

export function checkExpressionAnswer(userInput: string, question: Question): boolean {
  if (!userInput) return false;
  const trimmed = userInput.trim();
  if (!trimmed) return false;

  // 1. Direct match กับรายการคำตอบที่ยอมรับ หรือสูตรเฉลย
  const candidates = [
    ...(question.acceptableAnswers || []),
    question.values?.expr,
    question.formulaDisplay,
    question.answerDisplay,
  ].filter(Boolean) as string[];

  const cleanUser = trimmed.replace(/\s+/g, '').toLowerCase();
  for (const c of candidates) {
    if (c.replace(/\s+/g, '').toLowerCase() === cleanUser) {
      return true;
    }
  }

  // 2. ตรวจสอบกรณีพิมพ์เศษส่วนโดยตรง เช่น 88/203
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0].trim());
      const den = parseFloat(parts[1].trim());
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        if (Math.abs(num / den - question.correctNumericAnswer) < 0.005) {
          return true;
        }
      }
    }
  }

  // 3. ตรวจสอบกรณีพิมพ์ตัวเลขจำนวนจริง/ทศนิยมโดยตรง
  const parsedNum = parseFloat(trimmed.replace(/(\d),(\d)/g, '$1$2'));
  if (!isNaN(parsedNum) && !/[a-zA-Z!{}]/.test(trimmed)) {
    if (Math.abs(parsedNum - question.correctNumericAnswer) < 0.005) {
      return true;
    }
  }

  // 4. คำนวณนิพจน์คณิตศาสตร์ผ่าน evaluateExpression (รองรับ C(n,r), P(n,r), n!, +, -, *, /)
  try {
    const res = evaluateExpression(trimmed);
    if (res) {
      let evalVal: number | null = null;
      if (
        res.isFraction &&
        res.numeratorReduced !== undefined &&
        res.denominatorReduced !== undefined
      ) {
        const num = Number(res.numeratorReduced);
        const den = Number(res.denominatorReduced);
        if (den !== 0) evalVal = num / den;
      } else if (res.finalValueString) {
        const clean = res.finalValueString.replace(/(\d),(\d)/g, '$1$2').trim();
        if (clean.includes('/')) {
          const [nStr, dStr] = clean.split('/');
          const n = parseFloat(nStr);
          const d = parseFloat(dStr);
          if (!isNaN(n) && !isNaN(d) && d !== 0) evalVal = n / d;
        } else {
          evalVal = parseFloat(clean);
        }
      }

      if (evalVal !== null && !isNaN(evalVal)) {
        if (Math.abs(evalVal - question.correctNumericAnswer) < 0.005) {
          return true;
        }
      }
    }
  } catch {
    // ข้ามหาก evaluate ไม่สำเร็จ
  }

  return false;
}

export type UserSubmission = {
  mode: Mode;
  n?: string;
  r?: string;
  multisetCounts?: string;
  expr?: string;
};

export type EvaluationResult = {
  isModeCorrect: boolean;
  isParamsCorrect: boolean;
  isAllCorrect: boolean;
  userDisplayString: string;
};

/**
 * ตรวจสอบคำตอบของผู้ใช้ตามประเภทเครื่องมือ:
 * - C(n,r): เติม n, r
 * - P(n,r): เติม n, r
 * - n!: เติม n
 * - Multiset: เติม n และของที่ซ้ำ
 * - Expression: พิมพ์สูตร/นิพจน์คำนวณ หรือคำตอบ
 */
export function checkSubmission(
  submission: UserSubmission,
  question: Question,
): EvaluationResult {
  const isModeCorrect = submission.mode === question.correctMode;
  let isParamsCorrect = false;
  let userDisplayString = '';

  if (submission.mode === 'combination') {
    const n = parseInt(submission.n?.trim() || '0', 10);
    const r = parseInt(submission.r?.trim() || '0', 10);
    userDisplayString = `C(${submission.n?.trim() || 'n'}, ${submission.r?.trim() || 'r'})`;

    const targetN = parseInt(question.values?.n || '0', 10);
    const targetR = parseInt(question.values?.r || '0', 10);

    if (n === targetN && (r === targetR || (targetN > 0 && r === targetN - targetR))) {
      isParamsCorrect = true;
    }
  } else if (submission.mode === 'permutation') {
    const n = parseInt(submission.n?.trim() || '0', 10);
    const r = parseInt(submission.r?.trim() || '0', 10);
    userDisplayString = `P(${submission.n?.trim() || 'n'}, ${submission.r?.trim() || 'r'})`;

    const targetN = parseInt(question.values?.n || '0', 10);
    const targetR = parseInt(question.values?.r || '0', 10);

    if (n === targetN && r === targetR) {
      isParamsCorrect = true;
    }
  } else if (submission.mode === 'factorial') {
    const n = parseInt(submission.n?.trim() || '0', 10);
    userDisplayString = `${submission.n?.trim() || 'n'}!`;

    const targetN = parseInt(question.values?.n || '0', 10);
    if (n === targetN) {
      isParamsCorrect = true;
    }
  } else if (submission.mode === 'multiset') {
    const n = parseInt(submission.n?.trim() || '0', 10);
    const counts = (submission.multisetCounts || '')
      .split(/[,+\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((num) => !isNaN(num) && num > 0);

    const countsStr = counts.map((c) => `${c}!`).join(' × ');
    const totalN = counts.reduce((sum, v) => sum + v, 0);
    const displayN = submission.n?.trim() || (totalN > 0 ? String(totalN) : 'n');
    userDisplayString = `${displayN}! / (${countsStr || '...' })`;

    const targetCounts = [...(question.multisetCounts || [])].sort((a, b) => b - a);
    const userSorted = [...counts].sort((a, b) => b - a);
    const targetTotalN =
      parseInt(question.values?.n || '0', 10) || targetCounts.reduce((sum, v) => sum + v, 0);

    const targetNoOnes = targetCounts.filter((x) => x > 1);
    const userNoOnes = userSorted.filter((x) => x > 1);

    const countsMatch =
      (userSorted.length === targetCounts.length &&
        userSorted.every((v, i) => v === targetCounts[i])) ||
      (userNoOnes.length === targetNoOnes.length &&
        userNoOnes.every((v, i) => v === targetNoOnes[i]));

    if (countsMatch && (n === targetTotalN || isNaN(n) || n === 0 || !submission.n?.trim())) {
      isParamsCorrect = true;
    }
  } else if (submission.mode === 'expression') {
    userDisplayString = submission.expr?.trim() || '';
    isParamsCorrect = checkExpressionAnswer(submission.expr || '', question);
  }

  const isAllCorrect = isModeCorrect && isParamsCorrect;

  return {
    isModeCorrect,
    isParamsCorrect,
    isAllCorrect,
    userDisplayString,
  };
}

/**
 * สุ่มเลือกโจทย์ 5 ข้อแบบ Balanced
 */
export function getRandomSessionQuestions(): Question[] {
  const modes: Mode[] = ['combination', 'permutation', 'multiset', 'factorial', 'expression'];
  const picked: Question[] = [];

  for (const m of modes) {
    const matching = QUESTION_POOL.filter((q) => q.correctMode === m);
    if (matching.length > 0) {
      const randomIndex = Math.floor(Math.random() * matching.length);
      picked.push(matching[randomIndex]);
    }
  }

  // สลับลำดับทั้ง 5 ข้อ
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked;
}
