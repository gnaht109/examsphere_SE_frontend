import { Link, useNavigate } from 'react-router-dom';
import UserMenu from '../../components/navigation/UserMenu.jsx';
import { useAuth } from '../../hooks/useAuth.js';

function getRoleHome(user) {
  if (user?.role === 'ADMIN') {
    return '/admin';
  }

  return user?.role === 'STUDENT' ? '/student' : '/teacher';
}

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const primaryLink = isAuthenticated ? getRoleHome(user) : '/login';
  const primaryLabel = isAuthenticated ? 'Go to dashboard' : 'Get started';

  return (
    <div className="home-page">
      <header className="home-header">
        <Link className="home-brand" to="/">
          ExamSphere
        </Link>

        <nav className="home-nav">
          <a href="#home">Home</a>
          <a href="#features">Profile</a>
          <a href="#about">About</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="home-header-actions">
          {isAuthenticated ? (
            <UserMenu
              user={user}
              profileTo={getRoleHome(user)}
              onLogout={() => {
                logout();
                navigate('/login');
              }}
            />
          ) : (
            <>
              <Link className="home-ghost-link" to="/login">
                Login
              </Link>
              <Link className="home-solid-link" to="/register">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="hero-layout" id="home">
        <section className="hero-copy">
          <h1>
            Online
            <br />
            Exam
          </h1>
          <p>
            Build exams, publish passages, and let students take online assessments in a
            clean experience designed for both teachers and learners.
          </p>

          <div className="hero-actions">
            <Link className="hero-cta" to={primaryLink}>
              {primaryLabel}
            </Link>
            <a className="hero-link" href="#features">
              Read more
            </a>
          </div>
        </section>

        <section className="hero-visual" aria-label="Exam platform illustration" id="portfolio">
          <div className="hero-blob" />
          <div className="hero-monitor">
            <div className="hero-monitor-screen">
              <div className="hero-card">
                <div className="hero-card-header">
                  <span className="hero-card-dot active" />
                  <span className="hero-card-dot muted" />
                  <span className="hero-card-dot" />
                </div>

                <div className="hero-list">
                  <div className="hero-row checked">
                    <span className="hero-check" />
                    <span className="hero-line short" />
                  </div>
                  <div className="hero-row wrong">
                    <span className="hero-check" />
                    <span className="hero-line" />
                  </div>
                  <div className="hero-row checked">
                    <span className="hero-check" />
                    <span className="hero-line medium" />
                  </div>
                  <div className="hero-row">
                    <span className="hero-check empty" />
                    <span className="hero-line short" />
                  </div>
                  <div className="hero-row wrong">
                    <span className="hero-check" />
                    <span className="hero-line medium" />
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-monitor-base" />
          </div>

          <div className="hero-character hero-character-left">
            <div className="hero-head" />
            <div className="hero-body" />
            <div className="hero-laptop" />
          </div>

          <div className="hero-character hero-character-right">
            <div className="hero-head" />
            <div className="hero-body" />
            <div className="hero-pencil" />
          </div>

          <div className="hero-clock" />
          <div className="hero-bulb" />
          <div className="hero-badge badge-one" />
          <div className="hero-badge badge-two" />
          <div className="hero-badge badge-three" />
        </section>
      </main>

      <section className="home-features" id="features">
        <article className="surface-card feature-card">
          <h3>Teacher tools</h3>
          <p>Create exams, organize passage-based questions, and manage publishing cleanly.</p>
        </article>
        <article className="surface-card feature-card">
          <h3>Student flow</h3>
          <p>Students browse published exams and take them in a focused, readable interface.</p>
        </article>
        <article className="surface-card feature-card" id="about">
          <h3>Built to grow</h3>
          <p>The frontend is organized so you can keep improving it without rewriting everything.</p>
        </article>
      </section>
    </div>
  );
}
