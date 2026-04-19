import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="student-page student-dashboard-page">
      <header className="student-page-hero surface-card">
        <div className="student-page-hero-copy">
          <span className="student-page-kicker">Student Workspace</span>
          <h2>Ready for your next exam session</h2>
          <p>
            Review published exams, continue through questions one at a time, and track your
            progress from a cleaner student-focused workspace.
          </p>
        </div>
        <div className="student-page-hero-actions">
          <Link className="button-primary" to="/student/exams">
            Browse exams
          </Link>
        </div>
      </header>

      <div className="student-stats-grid">
        <article className="surface-card student-stat-card">
          <span className="student-stat-label">Signed In</span>
          <strong>{user?.username || 'Unknown'}</strong>
          <p>This comes from the authenticated user context already stored on the frontend.</p>
        </article>

        <article className="surface-card student-stat-card">
          <span className="student-stat-label">Role</span>
          <strong>{user?.role || 'Unknown'}</strong>
          <p>The student route set keeps the browsing and exam-taking flow separate from teacher tools.</p>
        </article>

        <article className="surface-card student-stat-card">
          <span className="student-stat-label">Focus</span>
          <strong>Take Exams</strong>
          <p>Open a published exam, jump with question bubbles, and move question by question.</p>
        </article>
      </div>

      <article className="surface-card student-info-panel">
        <div className="section-heading">
          <div>
            <h3>Current Student Flow</h3>
            <p className="muted">
              Published exam listing and exam detail are connected. Submission is still a placeholder
              for now, so this area focuses on browsing, navigation, and answer progress.
            </p>
          </div>
          <Link className="button-secondary" to="/student/exams">
            Open catalog
          </Link>
        </div>
      </article>
    </section>
  );
}
