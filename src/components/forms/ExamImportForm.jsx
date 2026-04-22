import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildExamImportTemplate, parseExamImportFile } from '../../utils/examImport.js';

export default function ExamImportForm({ onImport, cancelTo }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const templateHref = useMemo(() => {
    const csv = buildExamImportTemplate();
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }, []);
  const excelTemplateHref = '/exam-import-template.xlsx';

  async function handlePreview() {
    if (!selectedFile) {
      setErrorMessage('Choose a spreadsheet file first.');
      return;
    }

    setErrorMessage('');
    setIsPreviewing(true);

    try {
      const parsed = await parseExamImportFile(selectedFile);
      setPreview(parsed);
    } catch (error) {
      setPreview(null);
      setErrorMessage(error.message);
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport() {
    if (!preview) {
      setErrorMessage('Preview the spreadsheet first so we can validate it.');
      return;
    }

    setErrorMessage('');
    setIsImporting(true);

    try {
      await onImport(preview);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <section>
      <div className="embedded-form-header">
        <div>
          <h3>Import From Spreadsheet</h3>
          <p>
            Upload an Excel or CSV file to create an exam, then automatically create standalone
            questions and grouped passage questions.
          </p>
        </div>
      </div>

      <div className="surface-card form-card import-form-card">
        <div className="stack-lg">
          <div className="form-field">
            <label htmlFor="examImportFile">Spreadsheet file</label>
            <input
              id="examImportFile"
              type="file"
              accept=".xlsx,.xls,.csv,.tsv"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] || null);
                setPreview(null);
                setErrorMessage('');
              }}
            />
            <div className="field-help">
              Supported: `.xlsx`, `.xls`, `.csv`, `.tsv`. Use the template below to match the
              import format.
            </div>
          </div>

          <div className="import-template-card">
            <div className="section-heading">
              <div>
                <h3>Template</h3>
                <p className="muted">
                  Download the Excel template and fill it in directly. It keeps the exact row and
                  column layout from your example, including `Title`, `Description`, `Duration`,
                  `TotalScore`, and the question table. A CSV version is still available if needed.
                </p>
              </div>
              <div className="action-row">
                <a
                  className="button-secondary"
                  href={excelTemplateHref}
                  download="exam-import-template.xlsx"
                >
                  Download Excel template
                </a>
                <a className="button-secondary" href={templateHref} download="exam-import-template.csv">
                  Download CSV template
                </a>
              </div>
            </div>

            <pre className="import-template-preview">{buildExamImportTemplate()}</pre>
          </div>

          {preview ? (
            <div className="import-preview-card">
              <div className="section-heading">
                <div>
                  <h3>{preview.exam.title || 'Untitled imported exam'}</h3>
                  <p className="muted">
                    {preview.questions.length} question{preview.questions.length === 1 ? '' : 's'} ready
                    for import
                  </p>
                </div>
              </div>

              <div className="detail-meta">
                <span className="pill">{preview.exam.duration} minutes</span>
                <span className="pill">{preview.exam.totalScore} points</span>
                <span className="pill">{preview.questions.filter((question) => !question.passage).length} standalone</span>
                <span className="pill">
                  {
                    new Set(
                      preview.questions
                        .map((question) => question.passage)
                        .filter(Boolean),
                    ).size
                  }{' '}
                  passages
                </span>
              </div>
            </div>
          ) : null}

          {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

          <div className="action-row">
            <button type="button" className="button-secondary" onClick={handlePreview} disabled={isPreviewing}>
              {isPreviewing ? 'Reading spreadsheet...' : 'Preview import'}
            </button>
            <button type="button" className="button-primary" onClick={handleImport} disabled={isImporting || !preview}>
              {isImporting ? 'Importing exam...' : 'Import exam'}
            </button>
            <Link className="button-secondary" to={cancelTo}>
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
