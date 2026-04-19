import * as XLSX from 'xlsx';

const REQUIRED_QUESTION_HEADERS = ['question', 'type', 'correct'];
const SUPPORTED_EXTENSIONS = ['xlsx', 'xls', 'csv', 'tsv'];

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function getCell(row, headers, name) {
  const index = headers.indexOf(name);
  return index >= 0 ? row[index] : '';
}

function toQuestionType(value) {
  const normalized = String(value || '').trim().toUpperCase();

  if (normalized === 'TRUE_FALSE' || normalized === 'TRUE/FALSE' || normalized === 'TRUE FALSE') {
    return 'TRUE_FALSE';
  }

  return 'MULTIPLE_CHOICE';
}

function buildOptions(row, headers, questionType) {
  if (questionType === 'TRUE_FALSE') {
    const correctValue = String(getCell(row, headers, 'correct')).trim().toLowerCase();

    return [
      { content: 'True', isCorrect: correctValue === 'true', optionOrder: 1 },
      { content: 'False', isCorrect: correctValue === 'false', optionOrder: 2 },
    ];
  }

  const optionHeaders = headers.filter((header) => /^option(_|\d|[a-z])/.test(header));
  const rawOptions = optionHeaders
    .map((header) => String(getCell(row, headers, header) || '').trim())
    .filter(Boolean);

  const correctValue = String(getCell(row, headers, 'correct')).trim();
  const correctIndex = Number.parseInt(correctValue, 10);

  return rawOptions.map((content, index) => ({
    content,
    isCorrect:
      Number.isFinite(correctIndex) && correctIndex > 0
        ? index + 1 === correctIndex
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
    const first = normalizeHeader(rows[index][0]);
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
    throw new Error('Could not find the question table. Add a row with headers like Question, Type, Correct.');
  }

  const headers = rows[tableStartIndex].map(normalizeHeader);
  const missingHeaders = REQUIRED_QUESTION_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required question columns: ${missingHeaders.join(', ')}.`);
  }

  const questions = rows
    .slice(tableStartIndex + 1)
    .filter((row) => row.some((cell) => String(cell || '').trim()))
    .map((row, rowIndex) => {
      const questionType = toQuestionType(getCell(row, headers, 'type'));
      const question = {
        passage: String(getCell(row, headers, 'passage') || '').trim(),
        passageOrder: getCell(row, headers, 'passage_order') || null,
        content: String(getCell(row, headers, 'question') || '').trim(),
        type: questionType,
        points: Number(getCell(row, headers, 'points') || 1),
        explaination: String(getCell(row, headers, 'explanation') || getCell(row, headers, 'explaination') || '').trim(),
        questionOrder: getCell(row, headers, 'question_order') || null,
        options: buildOptions(row, headers, questionType),
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
  return `Title,Sample Midterm Exam
Description,Imported from spreadsheet
Duration,60

Question,Type,Option A,Option B,Option C,Option D,Correct,Points,Question Order,Passage Order,Passage,Explanation
What is 2 + 2?,MULTIPLE_CHOICE,3,4,5,6,2,1,1,,,Basic arithmetic
The earth is round.,TRUE_FALSE,,,,,True,1,2,,,Simple fact
What is the main idea?,MULTIPLE_CHOICE,Choice A,Choice B,Choice C,Choice D,Choice B,2,3,3,This is a shared passage for the next questions.,Reading comprehension
Which detail supports the passage?,MULTIPLE_CHOICE,Detail A,Detail B,Detail C,Detail D,Detail C,2,4,3,This is a shared passage for the next questions.,Second passage question`;
}
