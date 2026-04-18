import { useNavigate } from 'react-router-dom';
import ExamEditorForm from '../../components/forms/ExamEditorForm.jsx';
import { createTeacherExamApi } from '../../api/teacherExamApi.js';

export default function CreateExamPage() {
  const navigate = useNavigate();

  return (
    <ExamEditorForm
      initialForm={{
        title: '',
        description: '',
        duration: 60,
      }}
      heading="Create Exam"
      description="This form creates the exam metadata first. Questions and passages are managed after the exam exists."
      submitLabel="Create exam"
      submittingLabel="Creating exam..."
      cancelTo="/teacher/exams"
      onSubmit={async (payload) => {
        const createdExam = await createTeacherExamApi(payload);
        navigate(`/teacher/exams/${createdExam.id}`, { replace: true });
      }}
    />
  );
}
