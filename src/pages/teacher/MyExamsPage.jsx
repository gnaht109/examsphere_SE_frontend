import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { deleteTeacherExamApi, getMyExamsApi } from '../../api/teacherExamApi.js';
import { formatDateTime, formatScore, getStatusClassName } from '../../utils/formatters.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


const STATUS_FILTERS = [
  { label: 'Publish', value: 'PUBLISHED' },
  { label: 'Draft', value: 'DRAFT' },
];

export default function MyExamsPage() {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('PUBLISHED');

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

  const filteredExams = exams.filter((exam) => exam.status === activeFilter);

  return (
    <section className="teacher-exams-page">
      <header className="teacher-exams-header">
        <div>
          <h2>My Exams</h2>
          {/* <p>Manage your exam list with a cleaner grouped view by status.</p> */}
        </div>
        <Link className="button-primary" to="/teacher/exams/new">
          Create exam
        </Link>
      </header>

      <div className="teacher-exams-filters" role="tablist" aria-label="Exam status filters">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`teacher-filter-chip ${activeFilter === filter.value ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

      {isLoading ? <div className="empty-state">Loading exams from the server...</div> : null}

      {!isLoading && !errorMessage && exams.length === 0 ? (
        <div className="empty-state">No exams found yet.</div>
      ) : null}

      {!isLoading && !errorMessage && exams.length > 0 && filteredExams.length === 0 ? (
        <div className="empty-state">No {activeFilter.toLowerCase()} exams found.</div>
      ) : null}

      {!isLoading && !errorMessage && filteredExams.length > 0 ? (
        <div className="teacher-exams-list">
          {filteredExams.map((exam) => (
            <article key={exam.id} className="teacher-exam-card">
              <div className="teacher-exam-thumbnail" aria-hidden="true">
                <span className="teacher-exam-thumbnail-mark" />
              </div>

              <div className="teacher-exam-body">
                <div className="teacher-exam-topline">
                  <span className={`pill ${getStatusClassName(exam.status)}`}>{exam.status}</span>
                  <span className="pill">{exam.duration} minutes</span>
                  <span className="pill">{exam.questionCount} questions</span>
                  <span className="pill">{formatScore(exam.totalScore)} points</span>
                </div>

                <h3>{exam.title}</h3>
                <p className="teacher-exam-description">
                  {exam.description || 'No description yet for this exam.'}
                </p>

                <div className="teacher-exam-footer">
                  <div className="teacher-exam-meta">
                    <span>Create By: {exam.createdByUsername || 'Unknown author'}</span>
                    <span>Updated: {formatDateTime(exam.updatedAt)}</span>
                  </div>

                  <div className="action-row">
                    <Link className="button-primary" to={`/teacher/exams/${exam.id}`}>
                      <FontAwesomeIcon icon={faEye} />
                    </Link>

                    {/* <Link className="button-secondary" to={`/teacher/exams/${exam.id}/edit`}>
                      Edit
                    </Link> */}
                    
                    <button
                      type="button"
                      className="button-danger"
                      onClick={() => handleDeleteExam(exam.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
