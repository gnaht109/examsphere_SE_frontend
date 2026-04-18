import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginApi } from '../../api/authApi.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function LoginPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fallbackPath = isAuthenticated ? undefined : '/teacher';
  const nextPath = location.state?.from?.pathname || fallbackPath;

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const authData = await loginApi(form);
      login(authData);
      const roleHome = authData.role === 'STUDENT' ? '/student' : '/teacher';
      navigate(location.state?.from?.pathname || roleHome, { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="surface-card login-card">
        <h1>Welcome to ExamSphere</h1>
        <p className="muted">
          Start with teacher sign-in. We will expand this foundation into create exam,
          upload exam, and exam-taking flows next.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              placeholder="ITCSIU23034"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
