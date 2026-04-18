import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

function linkClassName({ isActive }) {
  return isActive ? 'nav-link active' : 'nav-link';
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.role === 'TEACHER';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h1>ExamSphere</h1>
          <p>
            {isTeacher
              ? 'Build exams, publish them, and review the details cleanly.'
              : 'Browse published exams and take them in a clean student flow.'}
          </p>
        </div>

        <nav className="nav-list">
          {isTeacher ? (
            <>
              <NavLink to="/teacher" end className={linkClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/teacher/exams" className={linkClassName}>
                My Exams
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/student" end className={linkClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/student/exams" className={linkClassName}>
                Published Exams
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div>{user?.username || 'Unknown user'}</div>
            <div className="sidebar-role">{user?.role || 'No role'}</div>
          </div>

          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="page-area">
        <Outlet />
      </main>
    </div>
  );
}
