import { useState } from 'react';
import { Link } from 'react-router-dom';

function buildInitialForm(initialForm) {
  return {
    content: initialForm?.content || '',
    passageOrder: initialForm?.passageOrder ?? '',
  };
}

function validateForm(form) {
  const errors = {};

  if (!form.content.trim()) {
    errors.content = 'Passage content is required.';
  }

  if (form.passageOrder && Number(form.passageOrder) <= 0) {
    errors.passageOrder = 'Passage order must be a positive number.';
  }

  return errors;
}

function buildPayload(form) {
  return {
    content: form.content.trim(),
    passageOrder: form.passageOrder ? Number(form.passageOrder) : null,
    questions: [],
  };
}

export default function PassageEditorForm({
  initialForm,
  onSubmit,
  heading,
  description,
  submitLabel,
  submittingLabel,
  cancelTo,
  embedded = false,
  onCancel,
  cardClassName = '',
}) {
  const [form, setForm] = useState(() => buildInitialForm(initialForm));
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
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
      await onSubmit(buildPayload(form));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
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
            <label htmlFor="passageContent">Passage content</label>
            <textarea
              id="passageContent"
              value={form.content}
              onChange={(event) => updateField('content', event.target.value)}
              rows={12}
              placeholder="Paste or write the shared reading passage here"
              required
            />
            {fieldErrors.content ? <div className="field-error">{fieldErrors.content}</div> : null}
          </div>

          <div className="form-field">
            <label htmlFor="passageOrder">Passage order</label>
            <input
              id="passageOrder"
              name="passageOrder"
              type="number"
              min="1"
              step="1"
              value={form.passageOrder}
              onChange={(event) => updateField('passageOrder', event.target.value)}
              placeholder="Optional"
            />
            {fieldErrors.passageOrder ? (
              <div className="field-error">{fieldErrors.passageOrder}</div>
            ) : (
              <div className="field-help">
                Optional. Use this to place the whole passage between standalone questions.
              </div>
            )}
          </div>

          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          <div className="action-row">
            <button type="submit" className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
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
