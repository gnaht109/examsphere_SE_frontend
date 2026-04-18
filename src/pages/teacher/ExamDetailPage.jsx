import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ExamEditorForm from '../../components/forms/ExamEditorForm.jsx';
import QuestionEditorForm from '../../components/forms/QuestionEditorForm.jsx';
import {
  addQuestionToPassageApi,
  addTeacherQuestionApi,
  deletePassageApi,
  deleteTeacherExamApi,
  deleteTeacherQuestionApi,
  getTeacherExamDetailApi,
  publishTeacherExamApi,
  updateTeacherExamApi,
  updateTeacherQuestionApi,
} from '../../api/teacherExamApi.js';
import { formatDateTime, getStatusClassName } from '../../utils/formatters.js';
import { buildQuestionInitialForm } from '../../utils/questionForm.js';

function QuestionCard({
  question,
  indexLabel,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}) {
  return (
    <article className="surface-card question-card dashboard-card" id={`question-${question.id}`}>
      <div className="section-heading">
        <div>
          <h3>
            {indexLabel}: {question.content}
          </h3>
          <p className="muted">
            Type: {question.questionType} | Points: {question.points ?? 'Not set'}
          </p>
        </div>
        <div className="action-row">
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

export default function ExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [creatingPassageQuestionId, setCreatingPassageQuestionId] = useState(null);

  async function loadExamDetail() {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getTeacherExamDetailApi(examId);
      setExam(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadExamDetail();
  }, [examId]);

  async function handleDeleteExam() {
    const confirmed = window.confirm('Delete this exam? This will remove its questions and passages too.');

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeacherExamApi(examId);
      navigate('/teacher/exams', { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteQuestion(questionId) {
    const confirmed = window.confirm('Delete this question?');

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeacherQuestionApi(examId, questionId);
      if (editingQuestionId === questionId) {
        setEditingQuestionId(null);
      }
      await loadExamDetail();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeletePassage(passageId) {
    const confirmed = window.confirm(
      'Delete this passage? All questions inside the passage will be removed too.',
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePassageApi(passageId);
      await loadExamDetail();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (isLoading) {
    return <div className="empty-state">Loading exam workspace...</div>;
  }

  if (errorMessage) {
    return <div className="error-banner">{errorMessage}</div>;
  }

  if (!exam) {
    return <div className="empty-state">Exam not found.</div>;
  }

  return (
    <section className="detail-layout exam-workspace">
      <header className="page-header">
        <div>
          <h2>Exam Workspace</h2>
          <p>Edit exam settings and manage questions from the same dashboard-style page.</p>
        </div>
        <div className="action-row">
          <button type="button" className="button-danger" onClick={handleDeleteExam}>
            Delete exam
          </button>
          <Link className="button-secondary" to="/teacher/exams">
            Back to My Exams
          </Link>
        </div>
      </header>

      <article className="surface-card detail-summary dashboard-card">
        <div className="detail-meta">
          <span className={`pill ${getStatusClassName(exam.status)}`}>{exam.status}</span>
          <span className="pill">{exam.duration} minutes</span>
          <span className="pill">{exam.questionCount} questions</span>
          <span className="pill">
            {exam.passages?.length || 0} passage{(exam.passages?.length || 0) === 1 ? '' : 's'}
          </span>
        </div>

        <h3>{exam.title}</h3>
        <p className="muted">{exam.description || 'No description yet.'}</p>

        <div className="detail-meta">
          <span className="muted">Author: {exam.createdByUsername}</span>
          <span className="muted">Created: {formatDateTime(exam.createdAt)}</span>
          <span className="muted">Updated: {formatDateTime(exam.updatedAt)}</span>
        </div>
      </article>

      <div className="exam-workspace-grid">
        <section className="detail-section" id="settings">
          <ExamEditorForm
            initialForm={{
              title: exam.title || '',
              description: exam.description || '',
              duration: exam.duration || 60,
            }}
            heading="Edit Exam"
            description="Update title, description, and timing without leaving this workspace."
            submitLabel="Save exam"
            submittingLabel="Saving exam..."
            embedded
            cardClassName="embedded-form-card"
            secondaryAction={
              exam.status !== 'PUBLISHED'
                ? {
                    label: 'Publish exam',
                    loadingLabel: 'Publishing...',
                    onClick: async () => {
                      await publishTeacherExamApi(examId);
                      await loadExamDetail();
                    },
                  }
                : null
            }
            onSubmit={async (payload) => {
              await updateTeacherExamApi(examId, payload);
              await loadExamDetail();
            }}
          />
        </section>

        <section className="detail-section" id="questions">
          {!isCreatingQuestion ? (
            <article className="surface-card dashboard-card compact-cta-card">
              <div className="section-heading">
                <div>
                  <h3>Add Standalone Question</h3>
                  <p className="muted">Create a new question directly from the exam workspace.</p>
                </div>
                <button type="button" className="button-primary" onClick={() => setIsCreatingQuestion(true)}>
                  Add question
                </button>
              </div>
            </article>
          ) : (
            <QuestionEditorForm
              initialForm={buildQuestionInitialForm()}
              heading="Add Standalone Question"
              description="Create a new question without leaving the current exam."
              submitLabel="Add question"
              submittingLabel="Adding question..."
              embedded
              cardClassName="embedded-form-card"
              onCancel={() => setIsCreatingQuestion(false)}
              onSubmit={async (payload) => {
                await addTeacherQuestionApi(examId, payload);
                setIsCreatingQuestion(false);
                await loadExamDetail();
              }}
            />
          )}
        </section>
      </div>

      <section className="detail-section" id="questions">
        <div className="section-heading">
          <div>
            <h3>Standalone Questions</h3>
            <p className="muted">These questions belong directly to the exam, outside of a passage.</p>
          </div>
        </div>

        {exam.questions?.length ? (
          <div className="question-list">
            {exam.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                indexLabel={`Question ${index + 1}`}
                isEditing={editingQuestionId === question.id}
                onStartEdit={setEditingQuestionId}
                onCancelEdit={() => setEditingQuestionId(null)}
                onSaveEdit={async (questionId, payload) => {
                  await updateTeacherQuestionApi(examId, questionId, payload);
                  setEditingQuestionId(null);
                  await loadExamDetail();
                }}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">This exam does not contain any standalone questions yet.</div>
        )}
      </section>

      <section className="detail-section" id="passages">
        <div className="section-heading">
          <div>
            <h3>Passages</h3>
            <p className="muted">Passages still have their own creation flow, but question editing is now inline here.</p>
          </div>
          <Link className="button-primary" to={`/teacher/exams/${examId}/passages/new`}>
            Create passage
          </Link>
        </div>

        {exam.passages?.length ? (
          <div className="question-list">
            {exam.passages.map((passage, passageIndex) => (
              <article key={passage.id} className="surface-card passage-card dashboard-card">
                <div className="section-heading">
                  <div>
                    <h3>Passage {passageIndex + 1}</h3>
                    <p className="muted">
                      {passage.questions?.length || 0} linked question
                      {(passage.questions?.length || 0) === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="action-row">
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() =>
                        setCreatingPassageQuestionId((current) =>
                          current === passage.id ? null : passage.id,
                        )
                      }
                    >
                      Add passage question
                    </button>
                    <button type="button" className="button-danger" onClick={() => handleDeletePassage(passage.id)}>
                      Delete passage
                    </button>
                  </div>
                </div>

                <div className="passage-content">{passage.content}</div>

                {creatingPassageQuestionId === passage.id ? (
                  <div className="embedded-editor-block">
                    <QuestionEditorForm
                      initialForm={buildQuestionInitialForm()}
                      heading="Add Passage Question"
                      description="Create a new question inside this passage without leaving the exam workspace."
                      submitLabel="Add passage question"
                      submittingLabel="Adding passage question..."
                      embedded
                      cardClassName="embedded-form-card"
                      onCancel={() => setCreatingPassageQuestionId(null)}
                      onSubmit={async (payload) => {
                        await addQuestionToPassageApi(passage.id, payload);
                        setCreatingPassageQuestionId(null);
                        await loadExamDetail();
                      }}
                    />
                  </div>
                ) : null}

                {passage.questions?.length ? (
                  <div className="question-list passage-question-list">
                    {passage.questions.map((question, questionIndex) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        indexLabel={`Passage Question ${questionIndex + 1}`}
                        isEditing={editingQuestionId === question.id}
                        onStartEdit={setEditingQuestionId}
                        onCancelEdit={() => setEditingQuestionId(null)}
                        onSaveEdit={async (questionId, payload) => {
                          await updateTeacherQuestionApi(examId, questionId, payload);
                          setEditingQuestionId(null);
                          await loadExamDetail();
                        }}
                        onDelete={handleDeleteQuestion}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">This passage does not have any questions yet.</div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">This exam does not contain any passages yet.</div>
        )}
      </section>
    </section>
  );
}
