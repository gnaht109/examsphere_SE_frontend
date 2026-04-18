import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { deleteTeacherExamApi, getMyExamsApi } from '../../api/teacherExamApi.js';
import { formatDateTime, getStatusClassName } from '../../utils/formatters.js';

export default function MyExamsPage() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadExams() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getMyExamsApi();
        if (!ignore) {
          setExams(data);
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

    loadExams();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleDeleteExam(examId) {
    const confirmed = window.confirm('Delete this exam? This cannot be undone.');

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeacherExamApi(examId);
      setExams((current) => current.filter((exam) => exam.id !== examId));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>My Exams</h2>
          <p>
            This page fetches the teacher&apos;s own exams from your backend and renders
            one card per exam.
          </p>
        </div>
        <Link className="button-primary" to="/teacher/exams/new">
          Create exam
        </Link>
      </header>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      {isLoading ? <div className="empty-state">Loading exams from the server...</div> : null}

      {!isLoading && !errorMessage && exams.length === 0 ? (
        <div className="empty-state">No exams found yet.</div>
      ) : null}

      {!isLoading && !errorMessage && exams.length > 0 ? (
        <div className="exam-grid">
          {exams.map((exam) => (
            <article key={exam.id} className="surface-card exam-card">
              <div className="exam-meta">
                <span className={`pill ${getStatusClassName(exam.status)}`}>{exam.status}</span>
                <span className="pill">{exam.duration} minutes</span>
                <span className="pill">{exam.questionCount} questions</span>
              </div>

              <h3>{exam.title}</h3>
              <p className="muted">
                {exam.description || 'No description yet. This is a good candidate for a better empty value later.'}
              </p>

              <div className="exam-meta">
                <span className="muted">Created: {formatDateTime(exam.createdAt)}</span>
                <span className="muted">Updated: {formatDateTime(exam.updatedAt)}</span>
              </div>

              <div className="action-row">
                <Link className="button-primary" to={`/teacher/exams/${exam.id}`}>
                  View details
                </Link>
                <Link className="button-secondary" to={`/teacher/exams/${exam.id}/edit`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="button-danger"
                  onClick={() => handleDeleteExam(exam.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
