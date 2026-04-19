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
    <section className="student-page student-catalog-page">
      <header className="student-page-hero surface-card">
        <div className="student-page-hero-copy">
          <span className="student-page-kicker">Published Exams</span>
          <h2>Choose an exam and start when you are ready</h2>
          <p>
            Browse the student-facing exam catalog, review duration and question count, then open an
            exam in the one-question player.
          </p>
        </div>
      </header>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
      {isLoading ? <div className="empty-state">Loading published exams...</div> : null}

      {!isLoading && !errorMessage && exams.length === 0 ? (
        <div className="empty-state">No published exams are available yet.</div>
      ) : null}

      {!isLoading && !errorMessage && exams.length > 0 ? (
        <div className="student-catalog-grid">
          {exams.map((exam) => (
            <article key={exam.id} className="surface-card student-exam-catalog-card">
              <div className="student-exam-catalog-topline">
                <span className="pill pill-published">{exam.status}</span>
                <span className="pill">{exam.duration} minutes</span>
                <span className="pill">{exam.questionCount} questions</span>
              </div>

              <h3>{exam.title}</h3>
              <p className="student-exam-catalog-description">
                {exam.description || 'No description provided.'}
              </p>

              <div className="student-exam-catalog-meta">
                <span className="muted">Teacher: {exam.createdByUsername}</span>
                <span className="muted">Updated: {formatDateTime(exam.updatedAt)}</span>
              </div>

              <div className="student-exam-catalog-actions">
                <Link className="button-primary" to={`/student/exams/${exam.id}`}>
                  Open exam
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
