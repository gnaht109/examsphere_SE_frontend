import QuestionEditorForm from '../forms/QuestionEditorForm.jsx';
import DragHandle from './DragHandle.jsx';
import { buildQuestionInitialForm } from '../../utils/questionForm.js';

export default function ExamWorkspaceQuestionCard({
  question,
  indexLabel,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDropEnabled = false,
  dragLabel = 'Drag to reorder',
}) {
  return (
    <article
      className={`surface-card question-card dashboard-card ${isDropEnabled ? 'draggable-card' : ''} ${isDragging ? 'is-dragging' : ''}`}
      id={`question-${question.id}`}
      onDragOver={isDropEnabled ? onDragOver : undefined}
      onDrop={isDropEnabled ? onDrop : undefined}
    >
      <div className="section-heading">
        <div>
          <h3>
            {indexLabel}: {question.content}
          </h3>
          <p className="muted">
            Type: {question.questionType} | Points: {question.points ?? 'Not set'} | Order:{' '}
            {question.questionOrder ?? 'Auto'}
          </p>
        </div>
        <div className="action-row">
          {onDragStart ? (
            <DragHandle title={dragLabel} onDragStart={onDragStart} onDragEnd={onDragEnd} />
          ) : null}
          <button type="button" className="button-secondary" onClick={() => onStartEdit(question.id)}>
            {isEditing ? 'Editing' : 'Edit inline'}
          </button>
          <button type="button" className="button-danger" onClick={() => onDelete(question.id)}>
            Delete
          </button>
        </div>
      </div>

      {question.options?.length ? (
        <ul className="option-list">
          {question.options.map((option, optionIndex) => (
            <li key={option.id} className={`option-item ${option.isCorrect ? 'correct' : ''}`}>
              {String.fromCharCode(65 + optionIndex)}. {option.content}
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">This question does not have options yet.</div>
      )}

      {isEditing ? (
        <div className="embedded-editor-block">
          <QuestionEditorForm
            initialForm={buildQuestionInitialForm(question)}
            heading="Edit Question"
            description="Update the question directly from the exam workspace."
            submitLabel="Save question"
            submittingLabel="Saving question..."
            embedded
            cardClassName="embedded-form-card"
            onCancel={onCancelEdit}
            onSubmit={(payload) => onSaveEdit(question.id, payload)}
          />
        </div>
      ) : null}
    </article>
  );
}
