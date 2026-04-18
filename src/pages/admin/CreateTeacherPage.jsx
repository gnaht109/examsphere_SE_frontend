import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createTeacherApi } from '../../api/adminUserApi.js';

function validateForm(form) {
  const errors = {};

  if (form.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters.';
  }

  if (form.fullName.trim().length < 6) {
    errors.fullName = 'Full name must be at least 6 characters.';
  }

  if (!form.email.includes('@')) {
    errors.email = 'Enter a valid email address.';
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
}

export default function CreateTeacherPage() {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const createdTeacher = await createTeacherApi({
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setSuccessMessage(`Teacher account created for ${createdTeacher.username}.`);
      setForm({
        username: '',
        fullName: '',
        email: '',
        password: '',
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Create Teacher</h2>
          <p>This form now targets the admin-only teacher creation endpoint in your backend.</p>
        </div>
        <Link className="button-secondary" to="/admin">
          Back to Admin
        </Link>
      </header>

      <div className="surface-card form-card">
        <form className="stack-lg" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" value={form.username} onChange={handleChange} required />
            {fieldErrors.username ? <div className="field-error">{fieldErrors.username}</div> : null}
          </div>

          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
            {fieldErrors.fullName ? <div className="field-error">{fieldErrors.fullName}</div> : null}
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            {fieldErrors.email ? <div className="field-error">{fieldErrors.email}</div> : null}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
            {fieldErrors.password ? <div className="field-error">{fieldErrors.password}</div> : null}
          </div>

          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
          {successMessage ? <div className="success-banner">{successMessage}</div> : null}

          <div className="action-row">
            <button type="submit" className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating teacher...' : 'Create teacher'}
            </button>
            <Link className="button-secondary" to="/admin">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
