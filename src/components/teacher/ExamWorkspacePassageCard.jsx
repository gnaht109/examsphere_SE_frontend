import PassageEditorForm from '../forms/PassageEditorForm.jsx';
import QuestionEditorForm from '../forms/QuestionEditorForm.jsx';
import DragHandle from './DragHandle.jsx';
import ExamWorkspaceQuestionCard from './ExamWorkspaceQuestionCard.jsx';
import { buildQuestionInitialForm } from '../../utils/questionForm.js';

export default function ExamWorkspacePassageCard({
  passage,
  questions,
  isEditing,
  isAddingQuestion,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleAddQuestion,
  onAddQuestion,
  onDelete,
  editingQuestionId,
  onStartEditQuestion,
  onCancelEditQuestion,
  onSaveEditQuestion,
  onDeleteQuestion,
  draggingQuestionId,
  onQuestionDragStart,
  onQuestionDragOver,
  onQuestionDrop,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDropEnabled = false,
}) {
  return (
    <article
      className={`surface-card passage-card dashboard-card ${isDropEnabled ? 'draggable-card' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onDragOver={isDropEnabled ? onDragOver : undefined}
      onDrop={isDropEnabled ? onDrop : undefined}
    >
      <div className="section-heading">
        <div>
          <h3>Passage</h3>
          <p className="muted">
            Order: {passage.passageOrder ?? 'Auto'} | {questions.length} linked question
            {questions.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="action-row">
          {onDragStart ? (
            <DragHandle
              title="Drag to move this whole passage block"
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ) : null}
          <button type="button" className="button-secondary" onClick={() => onStartEdit(passage.id)}>
            {isEditing ? 'Editing' : 'Edit passage'}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => onToggleAddQuestion(isAddingQuestion ? null : passage.id)}
          >
            {isAddingQuestion ? 'Adding question' : 'Add passage question'}
          </button>
          <button type="button" className="button-danger" onClick={() => onDelete(passage.id)}>
            Delete passage
          </button>
        </div>
      </div>

      <div className="passage-content">{passage.content}</div>

      {isEditing ? (
        <div className="embedded-editor-block">
          <PassageEditorForm
            initialForm={{
              content: passage.content,
              passageOrder: passage.passageOrder ?? '',
            }}
            heading="Edit Passage"
            description="Update the passage content and where the whole block appears in the exam."
            submitLabel="Save passage"
            submittingLabel="Saving passage..."
            embedded
            cardClassName="embedded-form-card"
            onCancel={onCancelEdit}
            onSubmit={(payload) => onSaveEdit(passage.id, payload)}
          />
        </div>
      ) : null}

      {isAddingQuestion ? (
        <div className="embedded-editor-block">
          <QuestionEditorForm
            initialForm={buildQuestionInitialForm()}
            heading="Add Passage Question"
            description="Create a new question inside this passage without leaving the exam workspace."
            submitLabel="Add passage question"
            submittingLabel="Adding passage question..."
            embedded
            cardClassName="embedded-form-card"
            onCancel={() => onToggleAddQuestion(null)}
            onSubmit={(payload) => onAddQuestion(passage.id, payload)}
          />
        </div>
      ) : null}

      {questions.length ? (
        <div className="question-list passage-question-list">
          {questions.map((question) => (
            <ExamWorkspaceQuestionCard
              key={question.id}
              question={question}
              indexLabel={`Question ${question.questionNumber}`}
              isEditing={editingQuestionId === question.id}
              onStartEdit={onStartEditQuestion}
              onCancelEdit={onCancelEditQuestion}
              onSaveEdit={onSaveEditQuestion}
              onDelete={onDeleteQuestion}
              isDragging={draggingQuestionId === question.id}
              onDragStart={(event) => onQuestionDragStart(event, question.id)}
              onDragOver={onQuestionDragOver}
              onDrop={(event) => onQuestionDrop(event, question.id)}
              onDragEnd={onDragEnd}
              isDropEnabled
              dragLabel="Drag to reorder questions in this passage"
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">This passage does not have any questions yet.</div>
      )}
    </article>
  );
}
