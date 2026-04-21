import { Outlet, useNavigate } from 'react-router-dom';
import SideRail from '../navigation/SideRail.jsx';
import UserMenu from '../navigation/UserMenu.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';
  const roleLabel = isAdmin ? 'Admin Workspace' : isTeacher ? 'Teacher Workspace' : 'Student Workspace';
  // const roleDescription = isAdmin
  //   ? 'Manage protected teacher account creation from the admin area.'
  //   : isTeacher
  //   ? 'Build exams, publish them, and review the details cleanly.'
  //   : 'Browse published exams and take them in a calm, focused student flow.';
  const railItems = isAdmin
    ? [
        { label: 'Dashboard', to: '/admin', end: true },
        { label: 'Create Teacher', to: '/admin/teachers/new' },
      ]
    : isTeacher
    ? [
        { label: 'Dashboard', to: '/teacher', end: true },
        { label: 'My Exams', to: '/teacher/exams' },
      ]
    : [
        { label: 'Dashboard', to: '/student', end: true },
        { label: 'Published Exams', to: '/student/exams' },
        { label: 'My Attempts', to: '/student/exams/attempts' },
        { label: 'My Ongoing Attempts', to: '/student/exams/ongoing' },
      ];
  const profileRoute = railItems[0]?.to || '/';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      

      <div className="app-frame dashboard-shell">
        <SideRail items={railItems} footerLabel={roleLabel} />

        <main className="page-panel">
          <header className="page-toolbar">
            <div className="page-toolbar-actions">
              <span className="header-icon-chip" aria-hidden="true" />
              <span className="header-icon-chip outlined" aria-hidden="true" />
              <UserMenu user={user} profileTo={profileRoute} onLogout={handleLogout} />
            </div>
          </header>

          <div className="page-area">
          <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
