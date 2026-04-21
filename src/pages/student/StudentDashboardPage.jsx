import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Student Dashboard</h2>
        </div>
      </header>

      <div className="stats-grid">
        <article className="surface-card stat-card">
          <h3>Signed in as</h3>
          <p className="stat-value">{user?.username || 'Unknown'}</p>
        </article>

        <article className="surface-card stat-card">
          <h3>Current role</h3>
          <p className="stat-value">{user?.role || 'Unknown'}</p>
        </article>
      </div>

      <div className="action-row">
        <Link className="button-primary" to="/student/exams">
          Browse published exams
        </Link>
        <Link className="button-link" to="/student/exams/ongoing">
          Go to My Ongoing Attempts
        </Link>
      </div>
    </section>
  );
}
