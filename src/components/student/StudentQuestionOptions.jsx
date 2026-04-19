export default function StudentQuestionOptions({
  question,
  answers,
  onSelectAnswer,
  className = '',
}) {
  return (
    <ul className={['option-list', className].filter(Boolean).join(' ')}>
      {question.options?.map((option) => (
        <li key={option.id}>
          <label className="student-option">
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={answers[question.id] === option.id}
              onChange={() => onSelectAnswer(question.id, option.id)}
            />
            <span>{option.content}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
