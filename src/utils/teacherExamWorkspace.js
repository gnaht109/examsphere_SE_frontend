export function buildQuestionPayload(question, questionOrder = question.questionOrder) {
  return {
    content: question.content,
    points: question.points ?? 1,
    type: question.questionType,
    explaination: question.explaination || '',
    questionOrder,
    options:
      question.options?.map((option, index) => ({
        content: option.content,
        isCorrect: Boolean(option.isCorrect),
        optionOrder: option.optionOrder ?? index + 1,
      })) || [],
  };
}

export function buildPassagePayload(passage, passageOrder = passage.passageOrder) {
  return {
    content: passage.content,
    passageOrder,
    questions: [],
  };
}

export function reorderItems(items, draggedKey, targetKey) {
  const nextItems = [...items];
  const draggedIndex = nextItems.findIndex((item) => item.key === draggedKey);
  const targetIndex = nextItems.findIndex((item) => item.key === targetKey);

  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return items;
  }

  const [draggedItem] = nextItems.splice(draggedIndex, 1);
  nextItems.splice(targetIndex, 0, draggedItem);
  return nextItems;
}

export function applyTopLevelOrderToExam(exam, reorderedItems) {
  if (!exam) {
    return exam;
  }

  const questionOrderMap = new Map();
  const passageOrderMap = new Map();

  reorderedItems.forEach((item, index) => {
    const nextOrder = index + 1;

    if (item.type === 'question') {
      questionOrderMap.set(item.question.id, nextOrder);
      return;
    }

    passageOrderMap.set(item.passage.id, nextOrder);
  });

  return {
    ...exam,
    questions: (exam.questions || []).map((question) => ({
      ...question,
      questionOrder: questionOrderMap.get(question.id) ?? question.questionOrder,
    })),
    passages: (exam.passages || []).map((passage) => ({
      ...passage,
      passageOrder: passageOrderMap.get(passage.id) ?? passage.passageOrder,
    })),
  };
}

export function applyPassageQuestionOrderToExam(exam, passageId, reorderedQuestions) {
  if (!exam) {
    return exam;
  }

  const questionOrderMap = new Map(
    reorderedQuestions.map((question, index) => [question.id, index + 1]),
  );

  return {
    ...exam,
    passages: (exam.passages || []).map((passage) =>
      passage.id !== passageId
        ? passage
        : {
            ...passage,
            questions: (passage.questions || []).map((question) => ({
              ...question,
              questionOrder: questionOrderMap.get(question.id) ?? question.questionOrder,
            })),
          },
    ),
  };
}
