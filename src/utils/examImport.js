import * as XLSX from 'xlsx';

const REQUIRED_QUESTION_HEADERS = ['question', 'answer'];
const SUPPORTED_EXTENSIONS = ['xlsx', 'xls', 'csv', 'tsv'];
const HEADER_ALIASES = {
  title: ['title', 'exam_title', 'name', 'exam_name'],
  description: ['description', 'exam_description', 'details'],
  duration: ['duration', 'duration_minutes', 'minutes', 'time_limit'],
  total_score: ['total_score', 'totalscore', 'total', 'score', 'max_score'],
  question: ['question', 'question_text', 'content'],
  type: ['type', 'question_type', 'format'],
  answer: ['answer', 'correct', 'correct_answer'],
  points: ['points', 'score', 'marks'],
  question_order: ['question_order', 'order', 'question_no', 'question_number'],
  passage_order: ['passage_order', 'group_order', 'reading_order'],
  passage: ['passage', 'reading', 'reading_text', 'shared_passage'],
  explanation: ['explanation', 'explaination', 'exaplanation', 'note', 'notes'],
  option_a: ['option_a', 'a', 'choice_a'],
  option_b: ['option_b', 'b', 'choice_b'],
  option_c: ['option_c', 'c', 'choice_c'],
  option_d: ['option_d', 'd', 'choice_d'],
  option_e: ['option_e', 'e', 'choice_e'],
  option_f: ['option_f', 'f', 'choice_f'],
};
const CANONICAL_OPTION_HEADERS = ['option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'option_f'];

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function getCanonicalHeader(name) {
  const normalized = normalizeHeader(name);

  return (
    Object.entries(HEADER_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] || normalized
  );
}

function normalizeRowHeaders(row) {
  return row.map(getCanonicalHeader);
}

function getCell(row, headers, name) {
  const index = headers.indexOf(name);
  return index >= 0 ? row[index] : '';
}

function toQuestionType(value) {
  const normalized = String(value || '').trim().toUpperCase();

  if (
    normalized === 'TRUE_FALSE' ||
    normalized === 'TRUE/FALSE' ||
    normalized === 'TRUE FALSE' ||
    normalized === 'TF' ||
    normalized === 'TRUEFALSE'
  ) {
    return 'TRUE_FALSE';
  }

  if (normalized === 'MCQ' || normalized === 'MULTIPLE' || normalized === 'MULTIPLECHOICE') {
    return 'MULTIPLE_CHOICE';
  }

  return 'MULTIPLE_CHOICE';
}

function buildOptions(row, headers, questionType, answerValue) {
  if (questionType === 'TRUE_FALSE') {
    const correctValue = String(answerValue || '').trim().toLowerCase();

    return [
      { content: 'True', isCorrect: correctValue === 'true', optionOrder: 1 },
      { content: 'False', isCorrect: correctValue === 'false', optionOrder: 2 },
    ];
  }

  const optionHeaders = CANONICAL_OPTION_HEADERS.filter((header) => headers.includes(header));
  const rawOptions = optionHeaders
    .map((header) => String(getCell(row, headers, header) || '').trim())
    .filter(Boolean);

  const correctValue = String(answerValue || '').trim();
  const correctIndex = Number.parseInt(correctValue, 10);
  const exactMatchCount = rawOptions.filter((content) => content === correctValue).length;

  return rawOptions.map((content, index) => ({
    content,
    isCorrect:
      Number.isFinite(correctIndex) && correctIndex > 0
        ? index + 1 === correctIndex
        : exactMatchCount > 0
          ? content === correctValue
          : content.toLowerCase() === correctValue.toLowerCase(),
    optionOrder: index + 1,
  }));
}

function validateQuestion(question, rowNumber) {
  if (!question.content) {
    throw new Error(`Row ${rowNumber}: Question content is required.`);
  }

  if (question.type === 'MULTIPLE_CHOICE') {
    if (question.options.length < 2) {
      throw new Error(`Row ${rowNumber}: Multiple choice needs at least two options.`);
    }

    const correctCount = question.options.filter((option) => option.isCorrect).length;

    if (correctCount !== 1) {
      throw new Error(`Row ${rowNumber}: Multiple choice needs exactly one correct option.`);
    }
  }

  if (question.type === 'TRUE_FALSE') {
    const correctCount = question.options.filter((option) => option.isCorrect).length;

    if (correctCount !== 1) {
      throw new Error(`Row ${rowNumber}: True/False needs one correct answer.`);
    }
  }
}

function parseWorkbookRows(rows) {
  const metadata = {};
  let tableStartIndex = -1;

  for (let index = 0; index < rows.length; index += 1) {
    const first = getCanonicalHeader(rows[index][0]);
    const second = rows[index][1];

    if (first === 'question') {
      tableStartIndex = index;
      break;
    }

    if (first && second !== undefined && second !== null && String(second).trim()) {
      metadata[first] = String(second).trim();
    }
  }

  if (tableStartIndex === -1) {
    throw new Error('Could not find the question table. Add a row with headers like Question, A, B, C, D, Answer.');
  }

  const headers = normalizeRowHeaders(rows[tableStartIndex]);
  const missingHeaders = REQUIRED_QUESTION_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required question columns: ${missingHeaders.join(', ')}.`);
  }

  const questions = rows
    .slice(tableStartIndex + 1)
    .filter((row) => row.some((cell) => String(cell || '').trim()))
    .map((row, rowIndex) => {
      const answerValue = getCell(row, headers, 'answer');
      const questionType = toQuestionType(getCell(row, headers, 'type'));
      const question = {
        passage: String(getCell(row, headers, 'passage') || '').trim(),
        passageOrder: getCell(row, headers, 'passage_order') || null,
        content: String(getCell(row, headers, 'question') || '').trim(),
        type: questionType,
        points: getCell(row, headers, 'points') === '' ? null : Number(getCell(row, headers, 'points')),
        explaination: String(getCell(row, headers, 'explanation') || '').trim(),
        questionOrder: getCell(row, headers, 'question_order') || null,
        options: buildOptions(row, headers, questionType, answerValue),
      };

      validateQuestion(question, tableStartIndex + rowIndex + 2);
      return question;
    });

  if (questions.length === 0) {
    throw new Error('The spreadsheet does not contain any question rows.');
  }

  return {
    exam: {
      title: metadata.title || '',
      description: metadata.description || '',
      duration: Number(metadata.duration || 60),
      totalScore: Number(metadata.total_score || 100),
    },
    questions,
  };
}

export async function parseExamImportFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error('Use an .xlsx, .xls, .csv, or .tsv file.');
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('The spreadsheet does not contain any sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    defval: '',
  });

  return parseWorkbookRows(rows);
}

export function buildExamImportTemplate() {
  return `Title,Midterm Exam
Description,This is example of the template
Duration,60
TotalScore,100

Question,A,B,C,D,Answer,Points,Type,Passage,Exaplanation
What is 2+2?,3,5,1,4,4,10,MCQ,,Math
The earth is round,True,False,,,True,10,TF,,Geo
What is the main idea?,One,Two,Three,Four,One,10,MCQ,This is passage,Passage
What is the passage support,Answer A,Answer B,Answer C,Answer D,Answer C,10,MCQ,This is passage,Passage`;
}
