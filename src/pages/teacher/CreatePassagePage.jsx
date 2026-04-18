import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPassageApi } from '../../api/teacherExamApi.js';

export default function CreatePassagePage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) {
      setFieldError('Passage content is required.');
      return;
    }

    setFieldError('');
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await createPassageApi(examId, {
        content: content.trim(),
        questions: [],
      });
      navigate(`/teacher/exams/${examId}`, { replace: true });
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
          <h2>Create Passage</h2>
          <p>
            A passage is a reading block that can contain many linked questions. This is
            the clean frontend entry point for grouped reading-comprehension content.
          </p>
        </div>
        <Link className="button-secondary" to={`/teacher/exams/${examId}`}>
          Back to Exam Detail
        </Link>
      </header>

      <div className="surface-card form-card">
        <form className="stack-lg" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="passageContent">Passage content</label>
            <textarea
              id="passageContent"
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                setFieldError('');
              }}
              rows={12}
              placeholder="Paste or write the shared reading passage here"
              required
            />
            {fieldError ? <div className="field-error">{fieldError}</div> : null}
          </div>

          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          <div className="action-row">
            <button type="submit" className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating passage...' : 'Create passage'}
            </button>
            <Link className="button-secondary" to={`/teacher/exams/${examId}`}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
