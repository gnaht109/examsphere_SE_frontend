const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
};

function createEmptyOption(index) {
  return {
    content: '',
    isCorrect: false,
    optionOrder: index + 1,
  };
}

export function buildQuestionInitialForm(question) {
  if (!question) {
    return {
      content: '',
      points: '',
      type: QUESTION_TYPES.MULTIPLE_CHOICE,
      explaination: '',
      questionOrder: '',
      trueFalseCorrect: 'True',
      options: [createEmptyOption(0), createEmptyOption(1)],
    };
  }

  const isTrueFalse = question.questionType === QUESTION_TYPES.TRUE_FALSE;
  const trueFalseCorrect = question.options?.find((option) => option.isCorrect)?.content || 'True';
  const options = isTrueFalse
    ? []
    : question.options?.length
      ? question.options.map((option, index) => ({
          content: option.content,
          isCorrect: Boolean(option.isCorrect),
          optionOrder: option.optionOrder ?? index + 1,
        }))
      : [createEmptyOption(0), createEmptyOption(1)];

  return {
    content: question.content || '',
    points: question.points ?? '',
    type: question.questionType || QUESTION_TYPES.MULTIPLE_CHOICE,
    explaination: question.explaination || '',
    questionOrder: question.questionOrder ?? '',
    trueFalseCorrect,
    options,
  };
}
