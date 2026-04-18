import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPublishedStudentExamsApi } from '../../api/studentExamApi.js';
import { formatDateTime } from '../../utils/formatters.js';

export default function StudentExamsPage() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadExams() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getPublishedStudentExamsApi();
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

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Published Exams</h2>
          <p>
            This page is the student-facing published exam catalog. It only reads the
            `/api/student/exams` endpoint.
          </p>
        </div>
      </header>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
      {isLoading ? <div className="empty-state">Loading published exams...</div> : null}

      {!isLoading && !errorMessage && exams.length === 0 ? (
        <div className="empty-state">No published exams are available yet.</div>
      ) : null}

      {!isLoading && !errorMessage && exams.length > 0 ? (
        <div className="exam-grid">
          {exams.map((exam) => (
            <article key={exam.id} className="surface-card exam-card">
              <div className="exam-meta">
                <span className="pill pill-published">{exam.status}</span>
                <span className="pill">{exam.duration} minutes</span>
                <span className="pill">{exam.questionCount} questions</span>
              </div>

              <h3>{exam.title}</h3>
              <p className="muted">{exam.description || 'No description provided.'}</p>

              <div className="exam-meta">
                <span className="muted">Teacher: {exam.createdByUsername}</span>
                <span className="muted">Updated: {formatDateTime(exam.updatedAt)}</span>
              </div>

              <Link className="button-primary" to={`/student/exams/${exam.id}`}>
                Open exam
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
