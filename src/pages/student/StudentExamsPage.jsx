import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getPublishedStudentExamsApi } from '../../api/studentExamApi.js';

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
      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
      {isLoading ? <div className="empty-state">Loading published exams...</div> : null}

      {!isLoading && !errorMessage && exams.length === 0 ? (
        <div className="empty-state">No published exams are available yet.</div>
      ) : null}

      {!isLoading && !errorMessage && exams.length > 0 ? (
        <div className="student-catalog-grid">
          {exams.map((exam) => (
            <article key={exam.id} className="surface-card student-exam-catalog-card">
              <div className="student-exam-catalog-accent" aria-hidden="true" />
              <div className="student-exam-catalog-content">
                <h3>{exam.title}</h3>
                <p className="student-exam-catalog-teacher">Teacher {exam.createdByUsername}</p>
              </div>

              <div className="student-exam-catalog-actions">
                <Link className="button-primary" to={`/student/exams/${exam.id}`}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
