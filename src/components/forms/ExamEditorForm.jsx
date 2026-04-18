import { useState } from 'react';
import { Link } from 'react-router-dom';

function validateForm(form) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!Number.isFinite(Number(form.duration)) || Number(form.duration) < 1) {
    errors.duration = 'Duration must be at least 1 minute.';
  }

  return errors;
}

export default function ExamEditorForm({
  initialForm,
  onSubmit,
  heading,
  description,
  submitLabel,
  submittingLabel,
  cancelTo,
  secondaryAction,
  embedded = false,
  onCancel,
  cardClassName = '',
}) {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningSecondaryAction, setIsRunningSecondaryAction] = useState(false);

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
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        duration: Number(form.duration),
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSecondaryAction() {
    if (!secondaryAction) {
      return;
    }

    setErrorMessage('');
    setIsRunningSecondaryAction(true);

    try {
      await secondaryAction.onClick();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsRunningSecondaryAction(false);
    }
  }

  const content = (
    <>
      {embedded ? (
        <div className="embedded-form-header">
          <div>
            <h3>{heading}</h3>
            {description ? <p>{description}</p> : null}
          </div>
        </div>
      ) : (
        <header className="page-header">
          <div>
            <h2>{heading}</h2>
            <p>{description}</p>
          </div>
          <Link className="button-secondary" to={cancelTo}>
            Back
          </Link>
        </header>
      )}

      <div className={['surface-card', 'form-card', cardClassName].filter(Boolean).join(' ')}>
        <form className="stack-lg" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Midterm Literature Exam"
              maxLength={255}
              required
            />
            {fieldErrors.title ? <div className="field-error">{fieldErrors.title}</div> : null}
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short guidance for teachers or students"
              rows={5}
            />
            <div className="field-help">
              Optional. Keep it short and meaningful so the exam list stays readable.
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              step="1"
              value={form.duration}
              onChange={handleChange}
              required
            />
            {fieldErrors.duration ? (
              <div className="field-error">{fieldErrors.duration}</div>
            ) : (
              <div className="field-help">
                Your backend requires a number greater than or equal to 1.
              </div>
            )}
          </div>

          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          <div className="action-row">
            <button type="submit" className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
            {secondaryAction ? (
              <button
                type="button"
                className="button-secondary"
                onClick={handleSecondaryAction}
                disabled={isRunningSecondaryAction}
              >
                {isRunningSecondaryAction ? secondaryAction.loadingLabel : secondaryAction.label}
              </button>
            ) : null}
            {onCancel ? (
              <button type="button" className="button-secondary" onClick={onCancel}>
                Cancel
              </button>
            ) : cancelTo ? (
              <Link className="button-secondary" to={cancelTo}>
                Cancel
              </Link>
            ) : null}
          </div>
        </form>
      </div>
    </>
  );

  return embedded ? content : <section>{content}</section>;
}
