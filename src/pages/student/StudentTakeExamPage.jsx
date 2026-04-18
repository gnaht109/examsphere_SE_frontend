import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getPublishedStudentExamDetailApi } from '../../api/studentExamApi.js';

function flattenQuestions(exam) {
  const standalone = (exam?.questions || []).map((question) => ({
    ...question,
    sourceLabel: 'Standalone',
  }));

  const passageQuestions = (exam?.passages || []).flatMap((passage, passageIndex) =>
    (passage.questions || []).map((question) => ({
      ...question,
      sourceLabel: `Passage ${passageIndex + 1}`,
    })),
  );

  return [...standalone, ...passageQuestions];
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

  const allQuestions = useMemo(() => flattenQuestions(exam), [exam]);
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
          <p>
            This is the first student exam-taking screen. It uses the published exam detail
            endpoint, and the backend already hides `isCorrect` values from the response.
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
          <article className="surface-card detail-summary">
            <div className="detail-meta">
              <span className="pill pill-published">{exam.status}</span>
              <span className="pill">{exam.duration} minutes</span>
              <span className="pill">{allQuestions.length} visible questions</span>
              <span className="pill">{answeredCount} answered</span>
            </div>

            <h3>{exam.title}</h3>
            <p className="muted">{exam.description || 'No description provided.'}</p>
          </article>

          <div className="student-exam-grid">
            <section className="question-list">
              {exam.questions?.length ? (
                <div className="detail-section">
                  <div className="section-heading">
                    <div>
                      <h3>Standalone Questions</h3>
                      <p className="muted">Questions that are not attached to a reading passage.</p>
                    </div>
                  </div>

                  {exam.questions.map((question, index) => (
                    <article key={question.id} className="surface-card question-card">
                      <h3>
                        Question {index + 1}: {question.content}
                      </h3>
                      <p className="muted">
                        Type: {question.questionType} | Points: {question.points ?? 'Not set'}
                      </p>

                      <ul className="option-list">
                        {question.options?.map((option) => (
                          <li key={option.id}>
                            <label className="student-option">
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                checked={answers[question.id] === option.id}
                                onChange={() => selectAnswer(question.id, option.id)}
                              />
                              <span>{option.content}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              ) : null}

              {exam.passages?.length ? (
                <div className="detail-section">
                  <div className="section-heading">
                    <div>
                      <h3>Passage Questions</h3>
                      <p className="muted">Reading sections with shared passage content.</p>
                    </div>
                  </div>

                  {exam.passages.map((passage, passageIndex) => (
                    <article key={passage.id} className="surface-card passage-card">
                      <h3>Passage {passageIndex + 1}</h3>
                      <div className="passage-content">{passage.content}</div>

                      <div className="question-list passage-question-list">
                        {passage.questions?.map((question, questionIndex) => (
                          <article key={question.id} className="question-card passage-question-card">
                            <h3>
                              Passage Question {questionIndex + 1}: {question.content}
                            </h3>
                            <p className="muted">
                              Type: {question.questionType} | Points: {question.points ?? 'Not set'}
                            </p>

                            <ul className="option-list">
                              {question.options?.map((option) => (
                                <li key={option.id}>
                                  <label className="student-option">
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      checked={answers[question.id] === option.id}
                                      onChange={() => selectAnswer(question.id, option.id)}
                                    />
                                    <span>{option.content}</span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </article>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>

            <aside className="surface-card student-sidebar">
              <h3>Answer Progress</h3>
              <p className="muted">
                This local tracker helps students see what they have answered so far.
              </p>

              <div className="student-progress">
                <strong>{answeredCount}</strong> / {allQuestions.length || 0} answered
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
