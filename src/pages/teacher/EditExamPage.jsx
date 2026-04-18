import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExamEditorForm from '../../components/forms/ExamEditorForm.jsx';
import { getTeacherExamDetailApi, updateTeacherExamApi } from '../../api/teacherExamApi.js';

export default function EditExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadExam() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getTeacherExamDetailApi(examId);
        if (!ignore) {
          setExam(data);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadExam();

    return () => {
      ignore = true;
    };
  }, [examId]);

  if (isLoading) {
    return <div className="empty-state">Loading exam editor...</div>;
  }

  if (errorMessage) {
    return <div className="error-banner">{errorMessage}</div>;
  }

  return (
    <ExamEditorForm
      initialForm={{
        title: exam?.title || '',
        description: exam?.description || '',
        duration: exam?.duration || 60,
      }}
      heading="Edit Exam"
      description="This reuses the same clean form component as create-exam, but submits to the update endpoint instead."
      submitLabel="Save changes"
      submittingLabel="Saving changes..."
      cancelTo={`/teacher/exams/${examId}`}
      onSubmit={async (payload) => {
        await updateTeacherExamApi(examId, payload);
        navigate(`/teacher/exams/${examId}`, { replace: true });
      }}
    />
  );
}
