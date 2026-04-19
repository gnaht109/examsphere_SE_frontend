import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getPublishedStudentExamDetailApi } from '../../api/studentExamApi.js';
import { buildExamDisplayItems, countDisplayQuestions } from '../../utils/examOrdering.js';

function QuestionOptions({ question, answers, onSelectAnswer }) {
  return (
    <ul className="option-list">
      {question.options?.map((option) => (
        <li key={option.id}>
          <label className="student-option">
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={answers[question.id] === option.id}
              onChange={() => onSelectAnswer(question.id, option.id)}
            />
            <span>{option.content}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export default function StudentTakeExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
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

  const displayItems = useMemo(() => buildExamDisplayItems(exam), [exam]);
  const allQuestionsCount = useMemo(() => countDisplayQuestions(displayItems), [displayItems]);
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null && value !== undefined).length,
    [answers],
  );

  function selectAnswer(questionId, optionId) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionId,
    }));
  }

  return (
    <section className="detail-layout">
      <header className="page-header">
        <div>
          <h2>Take Exam</h2>
          <p>Questions now follow the teacher-defined order, including passage blocks placed between standalone questions.</p>
        </div>
        <Link className="button-secondary" to="/student/exams">
          Back to Published Exams
        </Link>
      </header>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
      {isLoading ? <div className="empty-state">Loading exam...</div> : null}

      {!isLoading && !errorMessage && exam ? (
        <>
          <article className="surface-card detail-summary">
            <div className="detail-meta">
              <span className="pill pill-published">{exam.status}</span>
              <span className="pill">{exam.duration} minutes</span>
              <span className="pill">{allQuestionsCount} visible questions</span>
              <span className="pill">{answeredCount} answered</span>
            </div>

            <h3>{exam.title}</h3>
            <p className="muted">{exam.description || 'No description provided.'}</p>
          </article>

          <div className="student-exam-grid">
            <section className="question-list">
              {displayItems.length ? (
                <div className="detail-section">
                  <div className="section-heading">
                    <div>
                      <h3>Exam Questions</h3>
                      <p className="muted">Standalone questions and passage groups appear in one continuous order.</p>
                    </div>
                  </div>

                  {displayItems.map((item) =>
                    item.type === 'question' ? (
                      <article key={item.question.id} className="surface-card question-card">
                        <h3>
                          Question {item.questionNumber}: {item.question.content}
                        </h3>
                        <p className="muted">
                          Type: {item.question.questionType} | Points: {item.question.points ?? 'Not set'}
                        </p>

                        <QuestionOptions question={item.question} answers={answers} onSelectAnswer={selectAnswer} />
                      </article>
                    ) : (
                      <article key={item.passage.id} className="surface-card passage-card">
                        <h3>Passage</h3>
                        <div className="passage-content">{item.passage.content}</div>

                        <div className="question-list passage-question-list">
                          {item.questions.map((question) => (
                            <article key={question.id} className="question-card passage-question-card">
                              <h3>
                                Question {question.questionNumber}: {question.content}
                              </h3>
                              <p className="muted">
                                Type: {question.questionType} | Points: {question.points ?? 'Not set'}
                              </p>

                              <QuestionOptions question={question} answers={answers} onSelectAnswer={selectAnswer} />
                            </article>
                          ))}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              ) : null}
            </section>

            <aside className="surface-card student-sidebar">
              <h3>Answer Progress</h3>
              <p className="muted">This local tracker helps students see what they have answered so far.</p>

              <div className="student-progress">
                <strong>{answeredCount}</strong> / {allQuestionsCount || 0} answered
              </div>

              <div className="empty-state">
                Submit and grading are not connected yet because the current backend shared with me
                does not expose a student submission endpoint in the frontend contract.
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}
