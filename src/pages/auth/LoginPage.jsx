import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginApi } from '../../api/authApi.js';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout.jsx';
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

  const fallbackPath = '/';
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
      const roleHome =
        authData.role === 'ADMIN' ? '/admin' : authData.role === 'STUDENT' ? '/student' : '/teacher';
      navigate(location.state?.from?.pathname || roleHome, { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Welcome back"
      title="Sign in and continue your exam workflow."
      description="Teachers can manage exams and passages, while students can browse published exams and start taking them."
      altPrompt="Don't have an account?"
      altLabel="Create one"
      altTo="/register"
    >
      <div className="auth-form-header">
        <h2>Login</h2>
        <p className="muted">Use your username and password to enter ExamSphere.</p>
      </div>

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

        <button type="submit" className="button-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthSplitLayout>
  );
}
