import { useState } from 'react';
import { Link } from 'react-router-dom';

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
};

function createEmptyOption(index) {
  return {
    content: '',
    isCorrect: false,
    optionOrder: index + 1,
  };
}

function validateQuestionForm(form) {
  const errors = {};

  if (!form.content.trim()) {
    errors.content = 'Question content is required.';
  }

  if (form.points !== '' && (!Number.isFinite(Number(form.points)) || Number(form.points) <= 0)) {
    errors.points = 'Points must be a positive number.';
  }

  if (form.questionOrder && Number(form.questionOrder) <= 0) {
    errors.questionOrder = 'Question order must be a positive number.';
  }

  if (form.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
    const nonEmptyOptions = form.options.filter((option) => option.content.trim());
    const correctCount = form.options.filter((option) => option.isCorrect).length;

    if (nonEmptyOptions.length < 2) {
      errors.options = 'Multiple choice needs at least two filled options.';
    } else if (correctCount !== 1) {
      errors.options = 'Multiple choice needs exactly one correct option.';
    }
  }

  return errors;
}

function buildQuestionPayload(form) {
  const basePayload = {
    content: form.content.trim(),
    points: form.points === '' ? null : Number(form.points),
    type: form.type,
    explaination: form.explaination.trim() || null,
    questionOrder: form.questionOrder ? Number(form.questionOrder) : null,
  };

  if (form.type === QUESTION_TYPES.TRUE_FALSE) {
    return {
      ...basePayload,
      options: [
        { content: 'True', isCorrect: form.trueFalseCorrect === 'True', optionOrder: 1 },
        { content: 'False', isCorrect: form.trueFalseCorrect === 'False', optionOrder: 2 },
      ],
    };
  }

  return {
    ...basePayload,
    options: form.options
      .filter((option) => option.content.trim())
      .map((option, index) => ({
        content: option.content.trim(),
        isCorrect: option.isCorrect,
        optionOrder: index + 1,
      })),
  };
}

export default function QuestionEditorForm({
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
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: '', options: '' }));
  }

  function handleOptionChange(index, key, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => {
        if (optionIndex !== index) {
          return key === 'isCorrect' && value ? { ...option, isCorrect: false } : option;
        }

        return {
          ...option,
          [key]: value,
        };
      }),
    }));
    setFieldErrors((current) => ({ ...current, options: '' }));
  }

  function handleQuestionTypeChange(nextType) {
    setForm((current) => ({
      ...current,
      type: nextType,
      options:
        nextType === QUESTION_TYPES.MULTIPLE_CHOICE
          ? current.options.length
            ? current.options
            : [createEmptyOption(0), createEmptyOption(1)]
          : [],
    }));
    setFieldErrors({});
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [...current.options, createEmptyOption(current.options.length)],
    }));
  }

  function removeOption(indexToRemove) {
    setForm((current) => ({
      ...current,
      options: current.options
        .filter((_, index) => index !== indexToRemove)
        .map((option, index) => ({
          ...option,
          optionOrder: index + 1,
        })),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateQuestionForm(form);
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await onSubmit(buildQuestionPayload(form));
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
            <label htmlFor="content">Question content</label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={(event) => updateField('content', event.target.value)}
              rows={5}
              placeholder="Write the question prompt"
              required
            />
            {fieldErrors.content ? <div className="field-error">{fieldErrors.content}</div> : null}
          </div>

          <div className="inline-fields">
            <div className="form-field">
              <label htmlFor="type">Question type</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={(event) => handleQuestionTypeChange(event.target.value)}
              >
                <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple choice</option>
                <option value={QUESTION_TYPES.TRUE_FALSE}>True / False</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="points">Points</label>
              <input
                id="points"
                name="points"
                type="number"
                min="0.1"
                step="0.5"
                value={form.points}
                onChange={(event) => updateField('points', event.target.value)}
                placeholder="Optional"
              />
              {fieldErrors.points ? <div className="field-error">{fieldErrors.points}</div> : null}
              {!fieldErrors.points ? (
                <div className="field-help">
                  Optional. Leave blank to let the backend distribute points from the exam total.
                </div>
              ) : null}
            </div>

            <div className="form-field">
              <label htmlFor="questionOrder">Question order</label>
              <input
                id="questionOrder"
                name="questionOrder"
                type="number"
                min="1"
                step="1"
                value={form.questionOrder}
                onChange={(event) => updateField('questionOrder', event.target.value)}
                placeholder="Optional"
              />
              {fieldErrors.questionOrder ? (
                <div className="field-error">{fieldErrors.questionOrder}</div>
              ) : (
                <div className="field-help">Optional. Useful when you want strict ordering.</div>
              )}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="explaination">Explanation</label>
            <textarea
              id="explaination"
              name="explaination"
              value={form.explaination}
              onChange={(event) => updateField('explaination', event.target.value)}
              rows={3}
              placeholder="Optional explanation or grading note"
            />
          </div>

          {form.type === QUESTION_TYPES.MULTIPLE_CHOICE ? (
            <div className="stack-lg">
              <div className="section-heading">
                <div>
                  <h3>Options</h3>
                  <p className="muted">
                    Multiple choice questions need at least two options and exactly one
                    correct answer.
                  </p>
                </div>
                <button type="button" className="button-secondary" onClick={addOption}>
                  Add option
                </button>
              </div>

              {form.options.map((option, index) => (
                <div key={`option-${index}`} className="option-editor">
                  <div className="form-field option-field-grow">
                    <label htmlFor={`option-${index}`}>Option {index + 1}</label>
                    <input
                      id={`option-${index}`}
                      type="text"
                      value={option.content}
                      onChange={(event) => handleOptionChange(index, 'content', event.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>

                  <label className="checkbox-field">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={option.isCorrect}
                      onChange={() => handleOptionChange(index, 'isCorrect', true)}
                    />
                    Correct
                  </label>

                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => removeOption(index)}
                    disabled={form.options.length <= 2}
                  >
                    Remove
                  </button>
                </div>
              ))}

              {fieldErrors.options ? <div className="field-error">{fieldErrors.options}</div> : null}
            </div>
          ) : null}

          {form.type === QUESTION_TYPES.TRUE_FALSE ? (
            <>
              <div className="empty-state">
                True / False uses two fixed options. The frontend will send `True` and
                `False` automatically, and you choose which one is correct below.
              </div>

              <div className="form-field">
                <label htmlFor="trueFalseCorrect">Correct answer</label>
                <select
                  id="trueFalseCorrect"
                  name="trueFalseCorrect"
                  value={form.trueFalseCorrect}
                  onChange={(event) => updateField('trueFalseCorrect', event.target.value)}
                >
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            </>
          ) : null}

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
