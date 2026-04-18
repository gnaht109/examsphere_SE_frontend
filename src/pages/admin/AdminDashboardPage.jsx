import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>
            Your backend now separates admin responsibilities cleanly. Teacher account
            creation belongs here instead of the public signup page.
          </p>
        </div>
      </header>

      <div className="stats-grid">
        <article className="surface-card stat-card">
          <h3>Signed in as</h3>
          <p className="stat-value">{user?.username || 'Unknown'}</p>
          <p className="muted">Admin-authenticated area.</p>
        </article>

        <article className="surface-card stat-card">
          <h3>Role</h3>
          <p className="stat-value">{user?.role || 'Unknown'}</p>
          <p className="muted">This maps to the backend `ADMIN` role.</p>
        </article>

        <article className="surface-card stat-card">
          <h3>Next step</h3>
          <p className="stat-value">Create Teacher</p>
          <p className="muted">Provision teacher accounts from the protected admin endpoint.</p>
        </article>
      </div>

      <div className="surface-card detail-summary">
        <h3>Admin Actions</h3>
        <p className="muted">
          Public registration now creates students only. Teachers are created by admins
          through the dedicated backend controller.
        </p>
        <div className="action-row">
          <Link className="button-primary" to="/admin/teachers/new">
            Create teacher account
          </Link>
        </div>
      </div>
    </section>
  );
}
