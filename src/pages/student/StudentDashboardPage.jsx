import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Student Dashboard</h2>
          <p>
            This is the student landing page. From here, students can browse published exams
            and open an exam-taking screen.
          </p>
        </div>
      </header>

      <div className="stats-grid">
        <article className="surface-card stat-card">
          <h3>Signed in as</h3>
          <p className="stat-value">{user?.username || 'Unknown'}</p>
          <p className="muted">This comes from the login response stored in auth context.</p>
        </article>

        <article className="surface-card stat-card">
          <h3>Role</h3>
          <p className="stat-value">{user?.role || 'Unknown'}</p>
          <p className="muted">Frontend routing now branches cleanly by user role.</p>
        </article>

        <article className="surface-card stat-card">
          <h3>Next step</h3>
          <p className="stat-value">Take Exam</p>
          <p className="muted">Browse published exams and open one in the student exam view.</p>
        </article>
      </div>

      <div className="surface-card detail-summary">
        <h3>Student Flow</h3>
        <p className="muted">
          Right now your backend supports published exam listing and published exam detail with
          hidden answers. Submission and grading endpoints are not wired yet, so this slice focuses
          on browsing and taking structure cleanly.
        </p>
        <div className="action-row">
          <Link className="button-primary" to="/student/exams">
            Browse published exams
          </Link>
        </div>
      </div>
    </section>
  );
}
