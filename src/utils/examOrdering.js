function toPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function sortByOrder(items, getOrder) {
  return [...items].sort((left, right) => {
    const leftOrder = toPositiveNumber(getOrder(left));
    const rightOrder = toPositiveNumber(getOrder(right));

    if (leftOrder !== null && rightOrder !== null && leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    if (leftOrder !== null && rightOrder === null) {
      return -1;
    }

    if (leftOrder === null && rightOrder !== null) {
      return 1;
    }

    return (left.__sourceIndex ?? 0) - (right.__sourceIndex ?? 0);
  });
}

function orderQuestions(questions = []) {
  return sortByOrder(
    questions.map((question, index) => ({
      ...question,
      __sourceIndex: index,
    })),
    (question) => question.questionOrder,
  );
}

export function buildExamDisplayItems(exam) {
  const orderedStandaloneQuestions = orderQuestions(exam?.questions || []);
  const orderedPassages = sortByOrder(
    (exam?.passages || []).map((passage, index) => ({
      ...passage,
      __sourceIndex: index,
      questions: orderQuestions(passage.questions || []),
    })),
    (passage) => passage.passageOrder,
  );

  const topLevelItems = sortByOrder(
    [
      ...orderedStandaloneQuestions.map((question, index) => ({
        type: 'question',
        order: question.questionOrder,
        question,
        __sourceIndex: index,
      })),
      ...orderedPassages.map((passage, index) => ({
        type: 'passage',
        order: passage.passageOrder,
        passage,
        __sourceIndex: orderedStandaloneQuestions.length + index,
      })),
    ],
    (item) => item.order,
  );

  let nextQuestionNumber = 1;

  return topLevelItems.map((item) => {
    if (item.type === 'question') {
      const questionNumber = nextQuestionNumber;
      nextQuestionNumber += 1;

      return {
        type: 'question',
        question: item.question,
        questionNumber,
      };
    }

    const questions = item.passage.questions.map((question) => {
      const questionNumber = nextQuestionNumber;
      nextQuestionNumber += 1;

      return {
        ...question,
        questionNumber,
      };
    });

    return {
      type: 'passage',
      passage: item.passage,
      questions,
    };
  });
}

export function countDisplayQuestions(displayItems = []) {
  return displayItems.reduce((total, item) => {
    if (item.type === 'question') {
      return total + 1;
    }

    return total + (item.questions?.length || 0);
  }, 0);
}
