import StudentQuestionOptions from './StudentQuestionOptions.jsx';

export default function StudentExamQuestionView({
  item,
  answers,
  onSelectAnswer,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isSavingAnswer = false,
}) {
  if (!item) {
    return null;
  }

  return (
    <article className="student-active-question-card surface-card">
      <header className="student-active-question-header">
        <div>
          <span className="student-active-question-kicker">
            {item.isPassageQuestion ? 'Passage' : 'Question'}
          </span>
          <h3>#{item.questionNumber}</h3>
        </div>
        <span className="student-active-question-type">{item.question.questionType}</span>
      </header>

      {item.passage ? (
        <section className="student-inline-passage">
          <div className="student-inline-passage-label">Passage</div>
          <div className="student-inline-passage-content">{item.passage.content}</div>
        </section>
      ) : null}

      <section className="student-active-prompt">
        {/* <div className="student-active-prompt-label">Question prompt</div> */}
        <p>{item.question.content}</p>
      </section>

      <div className="student-active-answer-box">
        <StudentQuestionOptions
          question={item.question}
          answers={answers}
          onSelectAnswer={onSelectAnswer}
          className="student-active-option-list"
        />
        {isSavingAnswer ? <div className="field-help">Saving your answer...</div> : null}
      </div>

      <footer className="student-active-question-footer">
        <div className="student-question-nav-actions">
          <button
            type="button"
            className="button-secondary student-nav-button"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            Previous
          </button>
          <button
            type="button"
            className="button-primary student-nav-button"
            onClick={onNext}
            disabled={!hasNext}
          >
            Next
          </button>
        </div>
      </footer>
    </article>
  );
}
