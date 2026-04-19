import { useNavigate, useParams } from 'react-router-dom';
import { createPassageApi } from '../../api/teacherExamApi.js';
import PassageEditorForm from '../../components/forms/PassageEditorForm.jsx';

export default function CreatePassagePage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  return (
    <section>
      <PassageEditorForm
        initialForm={{
          content: '',
          passageOrder: '',
        }}
        heading="Create Passage"
        description="Create a reading block and optionally place it between standalone questions."
        submitLabel="Create passage"
        submittingLabel="Creating passage..."
        cancelTo={`/teacher/exams/${examId}`}
        onSubmit={async (payload) => {
          await createPassageApi(examId, payload);
          navigate(`/teacher/exams/${examId}`, { replace: true });
        }}
      />
    </section>
  );
}
