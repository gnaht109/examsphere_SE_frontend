import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupApi } from '../../api/authApi.js';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout.jsx';

function validateForm(form) {
  const errors = {};

  if (form.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  }

  if (form.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required.';
  }

  if (!form.email.includes('@')) {
    errors.email = 'Enter a valid email address.';
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: '',
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await signupApi({
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/login', { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Join ExamSphere"
      title="Create your account and start using the platform."
      description="Public registration now creates student accounts only. Teacher accounts are provisioned separately by admins."
      altPrompt="Already have an account?"
      altLabel="Sign in"
      altTo="/login"
    >
      <div className="auth-form-header">
        <h2>Register</h2>
        <p className="muted">Create a new student account.</p>
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
            placeholder="Choose a username"
            required
          />
          {fieldErrors.username ? <div className="field-error">{fieldErrors.username}</div> : null}
        </div>

        <div className="form-field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nguyen Van A"
            required
          />
          {fieldErrors.fullName ? <div className="field-error">{fieldErrors.fullName}</div> : null}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
          {fieldErrors.email ? <div className="field-error">{fieldErrors.email}</div> : null}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />
          {fieldErrors.password ? <div className="field-error">{fieldErrors.password}</div> : null}
        </div>

        {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

        <button type="submit" className="button-primary auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <div className="field-help">
          Teacher accounts are created from the protected admin area in the new backend design.
        </div>
      </form>
    </AuthSplitLayout>
  );
}
