import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import StudentExamNavigator from '../../components/student/StudentExamNavigator.jsx';
import StudentExamQuestionView from '../../components/student/StudentExamQuestionView.jsx';
import { getPublishedStudentExamDetailApi } from '../../api/studentExamApi.js';
import {
  buildExamDisplayItems,
  countDisplayQuestions,
  flattenDisplayQuestions,
} from '../../utils/examOrdering.js';

export default function StudentTakeExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadExam() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getPublishedStudentExamDetailApi(examId);
        if (!ignore) {
          setExam(data);
          setCurrentQuestionIndex(0);
          setSecondsRemaining((data.duration || 0) * 60);
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

  useEffect(() => {
    if (isLoading || !exam || secondsRemaining <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [exam, isLoading, secondsRemaining]);

  const displayItems = useMemo(() => buildExamDisplayItems(exam), [exam]);
  const questionFlow = useMemo(() => flattenDisplayQuestions(displayItems), [displayItems]);
  const allQuestionsCount = useMemo(() => countDisplayQuestions(displayItems), [displayItems]);
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null && value !== undefined).length,
    [answers],
  );
  const currentItem = questionFlow[currentQuestionIndex] || null;

  function selectAnswer(questionId, optionId) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
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
              <span className="pill">{allQuestionsCount} visible questions</span>
              <span className="pill">{answeredCount} answered</span>
            </div>

            <h3>{exam.title}</h3>
            <p className="muted">{exam.description || 'No description provided.'}</p>
          </article>

          <div className="student-exam-grid student-exam-player">
            <StudentExamNavigator
              questions={questionFlow}
              currentIndex={currentQuestionIndex}
              answers={answers}
              secondsRemaining={secondsRemaining}
              onJumpToQuestion={jumpToQuestion}
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
              />
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
