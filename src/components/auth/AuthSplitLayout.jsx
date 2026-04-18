import { Link } from 'react-router-dom';

export default function AuthSplitLayout({
  eyebrow,
  title,
  description,
  children,
  altPrompt,
  altLabel,
  altTo,
}) {
  return (
    <div className="auth-shell">
      <section className="auth-brand-panel">
        <Link className="home-brand" to="/">
          ExamSphere
        </Link>

        <div className="auth-brand-copy">
          <span className="hero-kicker">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <div className="auth-illustration">
          <div className="auth-blob" />
          <div className="auth-card-stack stack-back" />
          <div className="auth-card-stack stack-mid" />
          <div className="auth-card-stack stack-front">
            <div className="auth-line short" />
            <div className="auth-line" />
            <div className="auth-line medium" />
            <div className="auth-line short" />
          </div>
          <div className="auth-orbit orbit-one" />
          <div className="auth-orbit orbit-two" />
          <div className="auth-orbit orbit-three" />
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="surface-card auth-form-card">
          {children}
          <div className="auth-alt">
            <span>{altPrompt}</span>
            <Link to={altTo}>{altLabel}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
