import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ExamEditorForm from '../../components/forms/ExamEditorForm.jsx';
import QuestionEditorForm from '../../components/forms/QuestionEditorForm.jsx';
import ExamWorkspacePassageCard from '../../components/teacher/ExamWorkspacePassageCard.jsx';
import ExamWorkspaceQuestionCard from '../../components/teacher/ExamWorkspaceQuestionCard.jsx';
import {
  addQuestionToPassageApi,
  addTeacherQuestionApi,
  deletePassageApi,
  deleteTeacherExamApi,
  deleteTeacherQuestionApi,
  getTeacherExamDetailApi,
  publishTeacherExamApi,
  updatePassageApi,
  updateTeacherExamApi,
  updateTeacherQuestionApi,
} from '../../api/teacherExamApi.js';
import { buildExamDisplayItems, countDisplayQuestions } from '../../utils/examOrdering.js';
import { formatDateTime, formatScore, getStatusClassName } from '../../utils/formatters.js';
import { buildQuestionInitialForm } from '../../utils/questionForm.js';
import {
  applyPassageQuestionOrderToExam,
  applyTopLevelOrderToExam,
  buildPassagePayload,
  buildQuestionPayload,
  reorderItems,
} from '../../utils/teacherExamWorkspace.js';

export default function ExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingPassageId, setEditingPassageId] = useState(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [creatingPassageQuestionId, setCreatingPassageQuestionId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    loadExamDetail();
  }, [examId]);

  const displayItems = useMemo(() => buildExamDisplayItems(exam), [exam]);
  const totalVisibleQuestions = useMemo(() => countDisplayQuestions(displayItems), [displayItems]);
  const keyedDisplayItems = useMemo(
    () =>
      displayItems.map((item) => ({
        ...item,
        key: item.type === 'question' ? `question-${item.question.id}` : `passage-${item.passage.id}`,
      })),
    [displayItems],
  );

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
      if (editingPassageId === passageId) {
        setEditingPassageId(null);
      }
      if (creatingPassageQuestionId === passageId) {
        setCreatingPassageQuestionId(null);
      }
      await loadExamDetail();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function persistTopLevelOrder(reorderedItems) {
    setIsSavingOrder(true);
    setErrorMessage('');

    try {
      await Promise.all(
        reorderedItems.map((item, index) => {
          const nextOrder = index + 1;

          if (item.type === 'question') {
            return updateTeacherQuestionApi(
              examId,
              item.question.id,
              buildQuestionPayload(item.question, nextOrder),
            );
          }

          return updatePassageApi(item.passage.id, buildPassagePayload(item.passage, nextOrder));
        }),
      );

      setExam((current) => applyTopLevelOrderToExam(current, reorderedItems));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingOrder(false);
      setDragState(null);
    }
  }

  async function persistPassageQuestionOrder(passageId, reorderedQuestions) {
    setIsSavingOrder(true);
    setErrorMessage('');

    try {
      await Promise.all(
        reorderedQuestions.map((question, index) =>
          updateTeacherQuestionApi(examId, question.id, buildQuestionPayload(question, index + 1)),
        ),
      );

      setExam((current) => applyPassageQuestionOrderToExam(current, passageId, reorderedQuestions));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingOrder(false);
      setDragState(null);
    }
  }

  function handleTopLevelDragStart(event, itemKey) {
    if (isSavingOrder) {
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    setDragState({ level: 'top-level', itemKey });
  }

  function handlePassageQuestionDragStart(event, passageId, questionId) {
    if (isSavingOrder) {
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    setDragState({ level: 'passage-question', passageId, questionId });
  }

  function handleTopLevelDragOver(event) {
    if (dragState?.level !== 'top-level') {
      return;
    }

    event.preventDefault();
  }

  function handlePassageQuestionDragOver(event) {
    if (dragState?.level !== 'passage-question') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function handleDragEnd() {
    setDragState(null);
  }

  async function handleTopLevelDrop(event, targetKey) {
    if (dragState?.level !== 'top-level') {
      return;
    }

    event.preventDefault();

    if (isSavingOrder || dragState.itemKey === targetKey) {
      return;
    }

    const reorderedItems = reorderItems(keyedDisplayItems, dragState.itemKey, targetKey);
    await persistTopLevelOrder(reorderedItems);
  }

  async function handlePassageQuestionDrop(event, passageId, targetQuestionId) {
    if (dragState?.level !== 'passage-question') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (
      isSavingOrder ||
      dragState.passageId !== passageId ||
      dragState.questionId === targetQuestionId
    ) {
      return;
    }

    const passageItem = displayItems.find(
      (item) => item.type === 'passage' && item.passage.id === passageId,
    );

    if (!passageItem) {
      setDragState(null);
      return;
    }

    const reorderedQuestions = reorderItems(
      passageItem.questions.map((question) => ({
        ...question,
        key: `question-${question.id}`,
      })),
      `question-${dragState.questionId}`,
      `question-${targetQuestionId}`,
    );

    await persistPassageQuestionOrder(passageId, reorderedQuestions);
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
          <p>Change question order and passage order in one place, then preview the final mixed layout below.</p>
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
          <span className="pill">{totalVisibleQuestions} questions</span>
          <span className="pill">{formatScore(exam.totalScore)} points</span>
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
              totalScore: exam.totalScore || 100,
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
                  <p className="muted">Set `Question order` if this question should appear before or after a passage block.</p>
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

          <article className="surface-card dashboard-card compact-cta-card">
            <div className="section-heading">
              <div>
                <h3>Add Passage</h3>
                <p className="muted">Create a passage block and give it a `Passage order` to place it between questions.</p>
              </div>
              <Link className="button-primary" to={`/teacher/exams/${examId}/passages/new`}>
                Create passage
              </Link>
            </div>
          </article>
        </section>
      </div>

      <section className="detail-section" id="exam-order">
        <div className="section-heading">
          <div>
            <h3>Exam Order Preview</h3>
            <p className="muted">
              Drag cards to reorder standalone questions and passage blocks. Inside a passage, drag
              the question cards to change their order too.
            </p>
          </div>
          {isSavingOrder ? <span className="pill">Saving order...</span> : null}
        </div>

        {keyedDisplayItems.length ? (
          <div className="question-list">
            {keyedDisplayItems.map((item) =>
              item.type === 'question' ? (
                <ExamWorkspaceQuestionCard
                  key={item.question.id}
                  question={item.question}
                  indexLabel={`Question ${item.questionNumber}`}
                  isEditing={editingQuestionId === item.question.id}
                  onStartEdit={setEditingQuestionId}
                  onCancelEdit={() => setEditingQuestionId(null)}
                  onSaveEdit={async (questionId, payload) => {
                    await updateTeacherQuestionApi(examId, questionId, payload);
                    setEditingQuestionId(null);
                    await loadExamDetail();
                  }}
                  onDelete={handleDeleteQuestion}
                  isDragging={dragState?.level === 'top-level' && dragState.itemKey === item.key}
                  onDragStart={(event) => handleTopLevelDragStart(event, item.key)}
                  onDragOver={handleTopLevelDragOver}
                  onDrop={(event) => handleTopLevelDrop(event, item.key)}
                  onDragEnd={handleDragEnd}
                  isDropEnabled
                />
              ) : (
                <ExamWorkspacePassageCard
                  key={item.passage.id}
                  passage={item.passage}
                  questions={item.questions}
                  isEditing={editingPassageId === item.passage.id}
                  isAddingQuestion={creatingPassageQuestionId === item.passage.id}
                  onStartEdit={setEditingPassageId}
                  onCancelEdit={() => setEditingPassageId(null)}
                  onSaveEdit={async (passageId, payload) => {
                    await updatePassageApi(passageId, payload);
                    setEditingPassageId(null);
                    await loadExamDetail();
                  }}
                  onToggleAddQuestion={setCreatingPassageQuestionId}
                  onAddQuestion={async (passageId, payload) => {
                    await addQuestionToPassageApi(passageId, payload);
                    setCreatingPassageQuestionId(null);
                    await loadExamDetail();
                  }}
                  onDelete={handleDeletePassage}
                  editingQuestionId={editingQuestionId}
                  onStartEditQuestion={setEditingQuestionId}
                  onCancelEditQuestion={() => setEditingQuestionId(null)}
                  onSaveEditQuestion={async (questionId, payload) => {
                    await updateTeacherQuestionApi(examId, questionId, payload);
                    setEditingQuestionId(null);
                    await loadExamDetail();
                  }}
                  onDeleteQuestion={handleDeleteQuestion}
                  draggingQuestionId={
                    dragState?.level === 'passage-question' && dragState.passageId === item.passage.id
                      ? dragState.questionId
                      : null
                  }
                  onQuestionDragStart={(event, questionId) =>
                    handlePassageQuestionDragStart(event, item.passage.id, questionId)
                  }
                  onQuestionDragOver={handlePassageQuestionDragOver}
                  onQuestionDrop={(event, questionId) =>
                    handlePassageQuestionDrop(event, item.passage.id, questionId)
                  }
                  isDragging={dragState?.level === 'top-level' && dragState.itemKey === item.key}
                  onDragStart={(event) => handleTopLevelDragStart(event, item.key)}
                  onDragOver={handleTopLevelDragOver}
                  onDrop={(event) => handleTopLevelDrop(event, item.key)}
                  onDragEnd={handleDragEnd}
                  isDropEnabled
                />
              ),
            )}
          </div>
        ) : (
          <div className="empty-state">This exam does not contain any questions or passages yet.</div>
        )}
      </section>
    </section>
  );
}
