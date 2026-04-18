import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  deletePassageApi,
  deleteTeacherExamApi,
  deleteTeacherQuestionApi,
  getTeacherExamDetailApi,
} from '../../api/teacherExamApi.js';
import { formatDateTime, getStatusClassName } from '../../utils/formatters.js';

function QuestionCard({ question, indexLabel, examId, onDelete }) {
  return (
    <article className="surface-card question-card">
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
          <Link className="button-secondary" to={`/teacher/exams/${examId}/questions/${question.id}/edit`}>
            Edit
          </Link>
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
    </article>
  );
}

export default function ExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadExamDetail() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getTeacherExamDetailApi(examId);
        if (!ignore) {
          setExam(data);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadExamDetail();

    return () => {
      ignore = true;
    };
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
      setExam((current) => ({
        ...current,
        questions: current.questions.filter((question) => question.id !== questionId),
        passages: current.passages.map((passage) => ({
          ...passage,
          questions: passage.questions.filter((question) => question.id !== questionId),
        })),
      }));
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
      setExam((current) => ({
        ...current,
        passages: current.passages.filter((passage) => passage.id !== passageId),
      }));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <section className="detail-layout">
      <header className="page-header">
        <div>
          <h2>Exam Detail</h2>
          <p>
            This page now acts as the teacher management hub for the exam. From here you
            can update exam metadata, manage questions, and delete standalone content.
          </p>
        </div>
        <div className="action-row">
          <Link className="button-primary" to={`/teacher/exams/${examId}/questions/new`}>
            Add standalone question
          </Link>
          <Link className="button-secondary" to={`/teacher/exams/${examId}/passages/new`}>
            Create passage
          </Link>
          <Link className="button-secondary" to={`/teacher/exams/${examId}/edit`}>
            Edit exam
          </Link>
          <button type="button" className="button-danger" onClick={handleDeleteExam}>
            Delete exam
          </button>
          <Link className="button-secondary" to="/teacher/exams">
            Back to My Exams
          </Link>
        </div>
      </header>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
      {isLoading ? <div className="empty-state">Loading exam detail...</div> : null}

      {!isLoading && !errorMessage && exam ? (
        <>
          <article className="surface-card detail-summary">
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

          <section className="detail-section">
            <div className="section-heading">
              <div>
                <h3>Standalone Questions</h3>
                <p className="muted">
                  These questions belong directly to the exam, outside of a passage.
                </p>
              </div>
              <Link className="button-secondary" to={`/teacher/exams/${examId}/questions/new`}>
                Add standalone question
              </Link>
            </div>

            {exam.questions?.length ? (
              <div className="question-list">
                {exam.questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    indexLabel={`Question ${index + 1}`}
                    examId={examId}
                    onDelete={handleDeleteQuestion}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">This exam does not contain any standalone questions yet.</div>
            )}
          </section>

          <section className="detail-section">
            <div className="section-heading">
              <div>
                <h3>Passages</h3>
                <p className="muted">
                  A passage groups many linked questions under one shared reading block.
                </p>
              </div>
              <Link className="button-primary" to={`/teacher/exams/${examId}/passages/new`}>
                Create passage
              </Link>
            </div>

            {exam.passages?.length ? (
              <div className="question-list">
                {exam.passages.map((passage, passageIndex) => (
                  <article key={passage.id} className="surface-card passage-card">
                    <div className="section-heading">
                      <div>
                        <h3>Passage {passageIndex + 1}</h3>
                        <p className="muted">
                          {passage.questions?.length || 0} linked question
                          {(passage.questions?.length || 0) === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="action-row">
                        <Link
                          className="button-secondary"
                          to={`/teacher/exams/${examId}/passages/${passage.id}/questions/new`}
                        >
                          Add passage question
                        </Link>
                        <button
                          type="button"
                          className="button-danger"
                          onClick={() => handleDeletePassage(passage.id)}
                        >
                          Delete passage
                        </button>
                      </div>
                    </div>

                    <div className="passage-content">{passage.content}</div>
                    <div className="field-help">
                      Passage editing is not available yet because the current backend does not expose an update-passage endpoint.
                    </div>

                    {passage.questions?.length ? (
                      <div className="question-list passage-question-list">
                        {passage.questions.map((question, questionIndex) => (
                          <QuestionCard
                            key={question.id}
                            question={question}
                            indexLabel={`Passage Question ${questionIndex + 1}`}
                            examId={examId}
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
        </>
      ) : null}
    </section>
  );
}
