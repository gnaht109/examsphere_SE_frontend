import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function TeacherDashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Teacher Dashboard</h2>
          <p>
            This page is intentionally small. It acts as a stable landing page while we
            grow the app feature by feature.
          </p>
        </div>
      </header>

      <div className="stats-grid">
        <article className="surface-card stat-card">
          <h3>Signed in as</h3>
          <p className="stat-value">{user?.username || 'Unknown'}</p>
          <p className="muted">Your role from the backend login response.</p>
        </article>

        <article className="surface-card stat-card">
          <h3>Current role</h3>
          <p className="stat-value">{user?.role || 'Unknown'}</p>
          <p className="muted">We can later use this to show different routes per role.</p>
        </article>

        <article className="surface-card stat-card">
          <h3>Next lesson</h3>
          <p className="stat-value">Create Exam</p>
          <p className="muted">
            Forms are the next skill: local state, validation, submit flow, and redirect.
          </p>
        </article>
      </div>

      <div className="surface-card detail-summary">
        <h3>Why this page exists</h3>
        <p className="muted">
          A dashboard gives authenticated users a safe default route. It keeps routing
          clean and becomes a natural place for future summary cards and shortcuts.
        </p>
        <div className="action-row">
          <Link className="button-primary" to="/teacher/exams/new">
            Create your first exam
          </Link>
          <Link className="button-link" to="/teacher/exams">
            Go to My Exams
          </Link>
        </div>
      </div>
    </section>
  );
}
