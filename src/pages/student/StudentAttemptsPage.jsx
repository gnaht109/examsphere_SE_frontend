import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getStudentAttemptsApi } from '../../api/studentExamApi.js';
import { formatDateTime, formatScore } from '../../utils/formatters.js';

export default function StudentAttemptsPage({ status = 'SUBMITTED' }) {
  const [searchParams] = useSearchParams();
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedStatus = searchParams.get('status') || status;
  const isOngoingView = selectedStatus === 'IN_PROGRESS';

  useEffect(() => {
    let ignore = false;

    async function loadAttempts() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getStudentAttemptsApi(selectedStatus);

        if (!ignore) {
          setAttempts(data);
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

    loadAttempts();

    return () => {
      ignore = true;
    };
  }, [selectedStatus]);

  const pageCopy = useMemo(
    () =>
      isOngoingView
        ? {
            kicker: 'My Ongoing Attempts',
            title: 'Continue unfinished exams',
            description:
              'Any exam that is still in progress and not submitted yet appears here so you can jump straight back in.',
            empty: 'No ongoing attempts right now.',
            ctaLabel: 'Browse exams',
            ctaTo: '/student/exams',
          }
        : {
            kicker: 'My Attempts',
            title: 'Review submitted exam attempts',
            description:
              'This page shows the exams you have already submitted, along with when you submitted them and your score.',
            empty: 'No submitted attempts yet.',
            ctaLabel: 'My ongoing attempts',
            ctaTo: '/student/exams/ongoing',
          },
    [isOngoingView],
  );

  return (
    <section className="student-page student-attempts-page">
      <header className="student-page-hero surface-card">
        <div className="student-page-hero-copy">
          <span className="student-page-kicker">{pageCopy.kicker}</span>
          <h2>{pageCopy.title}</h2>
          <p>{pageCopy.description}</p>
        </div>
        <div className="student-page-hero-actions">
          <Link className="button-primary" to={pageCopy.ctaTo}>
            {pageCopy.ctaLabel}
          </Link>
        </div>
      </header>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
      {isLoading ? <div className="empty-state">Loading attempts...</div> : null}

      {!isLoading && !errorMessage && attempts.length === 0 ? (
        <div className="empty-state">{pageCopy.empty}</div>
      ) : null}

      {!isLoading && !errorMessage && attempts.length > 0 ? (
        <div className="student-attempts-grid">
          {attempts.map((attempt) => (
            <article key={attempt.id} className="surface-card student-attempt-card">
              <div className="student-attempt-card-accent" aria-hidden="true" />
              <div className="student-attempt-card-content">
                <div className="student-attempt-card-topline">
                  <span className={`pill ${isOngoingView ? 'pill-draft' : 'pill-published'}`}>
                    {attempt.status}
                  </span>
                  <span className="pill">Attempt #{attempt.id}</span>
                  <span className="pill">{attempt.answeredQuestions} / {attempt.totalQuestions} answered</span>
                  {isOngoingView ? (
                    <span className="pill">{attempt.remainingSeconds} seconds left</span>
                  ) : (
                    <span className="pill">
                      Score {formatScore(attempt.score)} / {formatScore(attempt.totalScore)}
                    </span>
                  )}
                </div>

                <h3>{attempt.examTitle}</h3>

                <div className="student-attempt-card-meta">
                  <span className="muted">Started {formatDateTime(attempt.startedAt)}</span>
                  {attempt.submittedAt ? (
                    <span className="muted">Submitted {formatDateTime(attempt.submittedAt)}</span>
                  ) : null}
                </div>
              </div>

              <div className="student-attempt-card-actions">
                <Link
                  className="button-secondary"
                  to={
                    isOngoingView
                      ? `/student/exams/${attempt.examId}/take`
                      : `/student/exams/${attempt.examId}/take?attemptId=${attempt.id}`
                  }
                >
                  {isOngoingView ? 'Continue' : 'View result'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
