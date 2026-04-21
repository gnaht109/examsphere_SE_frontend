import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import StudentExamNavigator from '../../components/student/StudentExamNavigator.jsx';
import StudentExamQuestionView from '../../components/student/StudentExamQuestionView.jsx';
import {
  getPublishedStudentExamDetailApi,
  getStudentAttemptResultApi,
  saveStudentAttemptAnswerApi,
  startStudentAttemptApi,
  submitStudentAttemptApi,
} from '../../api/studentExamApi.js';
import {
  buildExamDisplayItems,
  countDisplayQuestions,
  flattenDisplayQuestions,
} from '../../utils/examOrdering.js';
import { formatDateTime, formatScore } from '../../utils/formatters.js';

const ATTEMPT_STORAGE_KEY = 'examsphere_attempt_answers';

function getStoredAttemptAnswers(attemptId) {
  if (!attemptId) {
    return {};
  }

  try {
    const stored = JSON.parse(localStorage.getItem(ATTEMPT_STORAGE_KEY) || '{}');
    return stored[String(attemptId)] || {};
  } catch {
    return {};
  }
}

function storeAttemptAnswers(attemptId, answers) {
  if (!attemptId) {
    return;
  }

  try {
    const stored = JSON.parse(localStorage.getItem(ATTEMPT_STORAGE_KEY) || '{}');
    stored[String(attemptId)] = answers;
    localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Ignore storage failures and keep the in-memory answers.
  }
}

function clearStoredAttemptAnswers(attemptId) {
  if (!attemptId) {
    return;
  }

  try {
    const stored = JSON.parse(localStorage.getItem(ATTEMPT_STORAGE_KEY) || '{}');
    delete stored[String(attemptId)];
    localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Ignore storage failures.
  }
}

export default function StudentTakeExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [attemptResult, setAttemptResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadExamAndAttempt() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [examData, attemptData] = await Promise.all([
          getPublishedStudentExamDetailApi(examId),
          startStudentAttemptApi(examId),
        ]);

        if (ignore) {
          return;
        }

        setExam(examData);
        setAttempt(attemptData);
        setAnswers(getStoredAttemptAnswers(attemptData.id));
        setCurrentQuestionIndex(0);
        setSecondsRemaining(attemptData.remainingSeconds ?? (examData.duration || 0) * 60);
        setHasAutoSubmitted(false);

        if (attemptData.status === 'SUBMITTED' || attemptData.status === 'EXPIRED') {
          const result = await getStudentAttemptResultApi(attemptData.id);

          if (!ignore) {
            setAttemptResult(result);
          }
        } else {
          setAttemptResult(null);
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

    loadExamAndAttempt();
    return () => {
      ignore = true;
    };
  }, [examId]);

  useEffect(() => {
    if (isLoading || !attempt || attemptResult || secondsRemaining <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timerId);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [attempt, attemptResult, isLoading, secondsRemaining]);

  useEffect(() => {
    if (!attempt || attemptResult || secondsRemaining > 0 || hasAutoSubmitted) {
      return;
    }

    setHasAutoSubmitted(true);
    void handleSubmitAttempt(true);
  }, [attempt, attemptResult, hasAutoSubmitted, secondsRemaining]);

  const displayItems = useMemo(() => buildExamDisplayItems(exam), [exam]);
  const questionFlow = useMemo(() => flattenDisplayQuestions(displayItems), [displayItems]);
  const allQuestionsCount = useMemo(() => countDisplayQuestions(displayItems), [displayItems]);
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null && value !== undefined).length,
    [answers],
  );
  const currentItem = questionFlow[currentQuestionIndex] || null;

  async function selectAnswer(questionId, optionId) {
    if (!attempt || attemptResult) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [questionId]: optionId,
    };

    setAnswers(nextAnswers);
    storeAttemptAnswers(attempt.id, nextAnswers);
    setIsSavingAnswer(true);
    setErrorMessage('');

    try {
      await saveStudentAttemptAnswerApi(attempt.id, {
        questionId,
        selectedOptionId: optionId,
      });

      setAttempt((current) =>
        current
          ? {
              ...current,
              answeredQuestions: Object.values(nextAnswers).filter(
                (value) => value !== null && value !== undefined,
              ).length,
            }
          : current,
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSavingAnswer(false);
    }
  }

  async function handleSubmitAttempt(triggeredByTimer = false) {
    if (!attempt || isSubmittingAttempt || attemptResult) {
      return;
    }

    if (!triggeredByTimer) {
      const confirmed = window.confirm(
        'Submit this attempt now? You will not be able to change answers afterwards.',
      );

      if (!confirmed) {
        return;
      }
    }

    setIsSubmittingAttempt(true);
    setErrorMessage('');

    try {
      const submittedAttempt = await submitStudentAttemptApi(attempt.id);
      const result = await getStudentAttemptResultApi(attempt.id);

      clearStoredAttemptAnswers(attempt.id);
      setAttempt(submittedAttempt);
      setAttemptResult(result);
      setSecondsRemaining(0);
    } catch (error) {
      if (triggeredByTimer) {
        setHasAutoSubmitted(false);
      }
      setErrorMessage(error.message);
    } finally {
      setIsSubmittingAttempt(false);
    }
  }

  function goToPreviousQuestion() {
    setCurrentQuestionIndex((current) => Math.max(0, current - 1));
  }

  function goToNextQuestion() {
    setCurrentQuestionIndex((current) => Math.min(questionFlow.length - 1, current + 1));
  }

  function jumpToQuestion(index) {
    setCurrentQuestionIndex(index);
  }

  return (
    <section className="detail-layout student-taking-page">
      <header className="page-header">
        <div>
          <h2>Take Exam</h2>
          <p>
            Work through the exam one question at a time, jump with the question bubbles, and keep
            an eye on your progress from the left panel.
          </p>
        </div>
        <Link className="button-secondary" to="/student/exams">
          Back to Published Exams
        </Link>
      </header>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
      {isLoading ? <div className="empty-state">Loading exam...</div> : null}

      {!isLoading && !errorMessage && exam ? (
        <>
          <article className="surface-card detail-summary student-exam-summary">
            <div className="detail-meta">
              <span className="pill pill-published">{exam.status}</span>
              <span className="pill">{exam.duration} minutes</span>
              <span className="pill">{formatScore(exam.totalScore)} points</span>
              <span className="pill">{allQuestionsCount} visible questions</span>
              <span className="pill">{answeredCount} answered</span>
              {attempt ? <span className="pill">Attempt #{attempt.id}</span> : null}
            </div>

            <h3>{exam.title}</h3>
            <p className="muted">{exam.description || 'No description provided.'}</p>
          </article>

          {attemptResult ? (
            <section className="student-result-grid">
              <article className="surface-card detail-summary student-result-summary">
                <div className="detail-meta">
                  <span className="pill">{attemptResult.status}</span>
                  <span className="pill">
                    Score: {formatScore(attemptResult.score)} / {formatScore(attemptResult.totalScore)}
                  </span>
                  <span className="pill">{attemptResult.correctAnswers} correct</span>
                  <span className="pill">{attemptResult.incorrectAnswers} incorrect</span>
                  <span className="pill">{attemptResult.unansweredQuestions} unanswered</span>
                </div>

                <h3>Attempt Result</h3>
                <p className="muted">
                  Started: {formatDateTime(attemptResult.startedAt)} | Submitted:{' '}
                  {formatDateTime(attemptResult.submittedAt)}
                </p>
              </article>

              {attemptResult.questions?.map((question) => (
                <article key={question.questionId} className="surface-card student-result-card">
                  <div className="detail-meta">
                    <span className="pill">Question {question.questionOrder ?? '-'}</span>
                    <span className={`pill ${question.correct ? 'pill-published' : 'pill-draft'}`}>
                      {question.correct ? 'Correct' : question.answered ? 'Incorrect' : 'Unanswered'}
                    </span>
                    <span className="pill">
                      {formatScore(question.earnedPoints)} / {formatScore(question.points)}
                    </span>
                  </div>

                  <h3>{question.content}</h3>
                  <p className="muted">
                    Your answer: {question.selectedOptionContent || 'No answer submitted'}
                  </p>
                  <p className="muted">
                    Correct answer: {question.correctOptionContent || 'No correct option configured'}
                  </p>
                </article>
              ))}
            </section>
          ) : (
            <div className="student-exam-grid student-exam-player">
              <StudentExamNavigator
                questions={questionFlow}
                currentIndex={currentQuestionIndex}
                answers={answers}
                secondsRemaining={secondsRemaining}
                onJumpToQuestion={jumpToQuestion}
                onSubmit={() => handleSubmitAttempt(false)}
                isSubmitting={isSubmittingAttempt}
                canSubmit={Boolean(attempt)}
              />

              <section className="student-question-stage">
                <StudentExamQuestionView
                  item={currentItem}
                  answers={answers}
                  onSelectAnswer={selectAnswer}
                  onPrevious={goToPreviousQuestion}
                  onNext={goToNextQuestion}
                  hasPrevious={currentQuestionIndex > 0}
                  hasNext={currentQuestionIndex < questionFlow.length - 1}
                  isSavingAnswer={isSavingAnswer}
                />
              </section>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
