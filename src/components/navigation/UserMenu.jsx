import { Link } from 'react-router-dom';

export default function UserMenu({ user, profileTo, onLogout }) {
  const profileInitial = user?.username?.charAt(0)?.toUpperCase() || user?.role?.charAt(0) || 'U';

  return (
    <details className="profile-menu">
      <summary className="profile-trigger">
        <span className="profile-avatar" aria-hidden="true">
          {profileInitial}
        </span>
        <span className="profile-text">
          <span className="profile-name">{user?.username || 'Account'}</span>
          <span className="profile-role">{user?.role || 'Member'}</span>
        </span>
      </summary>

      <div className="profile-dropdown surface-card" role="menu">
        <Link className="profile-dropdown-link" to={profileTo}>
          Account profile
        </Link>
        <button type="button" className="profile-dropdown-item danger" onClick={onLogout}>
          Logout
        </button>
      </div>
    </details>
  );
}
