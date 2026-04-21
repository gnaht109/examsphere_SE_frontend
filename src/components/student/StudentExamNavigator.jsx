function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function StudentExamNavigator({
  questions,
  currentIndex,
  answers,
  secondsRemaining,
  onJumpToQuestion,
  onSubmit,
  isSubmitting = false,
  canSubmit = true,
}) {
  const answeredCount = questions.filter((item) => answers[item.id] !== undefined && answers[item.id] !== null).length;
  const progressPercent = questions.length ? (answeredCount / questions.length) * 100 : 0;

  return (
    <aside className="surface-card student-sidebar student-question-map">
      <div className="student-timer">{formatTime(secondsRemaining)}</div>
      <div className="student-map-progress-text">
        Question {currentIndex + 1} of {questions.length}
      </div>

      <div className="student-progress-track" aria-hidden="true">
        <div className="student-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="student-question-bubbles">
        {questions.map((item, index) => {
          const isActive = index === currentIndex;
          const isAnswered = answers[item.id] !== undefined && answers[item.id] !== null;

          return (
            <button
              key={item.id}
              type="button"
              className={[
                'student-question-bubble',
                isActive ? 'student-question-bubble-active' : '',
                isAnswered ? 'student-question-bubble-answered' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onJumpToQuestion(index)}
            >
              {item.questionNumber}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="button-primary student-submit-button"
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </aside>
  );
}
