import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getPublishedStudentExamDetailApi } from '../../api/studentExamApi.js';
import { countDisplayQuestions, buildExamDisplayItems } from '../../utils/examOrdering.js';
import { formatDateTime, formatScore } from '../../utils/formatters.js';

export default function StudentExamInfoPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadExam() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getPublishedStudentExamDetailApi(examId);

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

    loadExam();

    return () => {
      ignore = true;
    };
  }, [examId]);

  const totalQuestions = useMemo(() => countDisplayQuestions(buildExamDisplayItems(exam)), [exam]);

  return (
    <section className="detail-layout student-exam-info-page">
      <header className="page-header">
        <div>
          <h2>Exam Information</h2>
          <p>Review the exam details first, then start when you are ready.</p>
        </div>
        <Link className="button-secondary" to="/student/exams">
          Back to Published Exams
        </Link>
      </header>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
      {isLoading ? <div className="empty-state">Loading exam information...</div> : null}

      {!isLoading && !errorMessage && exam ? (
        <article className="surface-card student-exam-info-card">
          <div className="student-exam-info-head">
            <h3>{exam.title}</h3>
            <p>{exam.description || 'No description provided for this exam.'}</p>
          </div>

          <div className="student-exam-info-grid">
            <div className="student-exam-info-row">
              <span className="student-exam-info-label">Teacher</span>
              <strong>{exam.createdByUsername}</strong>
            </div>
            <div className="student-exam-info-row">
              <span className="student-exam-info-label">Duration</span>
              <strong>{exam.duration} minutes</strong>
            </div>
            <div className="student-exam-info-row">
              <span className="student-exam-info-label">Questions</span>
              <strong>{totalQuestions}</strong>
            </div>
            <div className="student-exam-info-row">
              <span className="student-exam-info-label">Total points</span>
              <strong>{formatScore(exam.totalScore)}</strong>
            </div>
            <div className="student-exam-info-row">
              <span className="student-exam-info-label">Type</span>
              <strong>Mixed exam structure</strong>
            </div>
            <div className="student-exam-info-row">
              <span className="student-exam-info-label">Last updated</span>
              <strong>{formatDateTime(exam.updatedAt)}</strong>
            </div>
          </div>

          <div className="student-exam-info-actions">
            <Link className="button-primary student-exam-info-start" to={`/student/exams/${exam.id}/take`}>
              Start exam
            </Link>
            <Link className="button-secondary" to="/student/exams/attempts">
              View attempt history
            </Link>
          </div>
        </article>
      ) : null}
    </section>
  );
}
