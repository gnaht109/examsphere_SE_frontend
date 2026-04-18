import { useNavigate, useParams } from 'react-router-dom';
import QuestionEditorForm from '../../components/forms/QuestionEditorForm.jsx';
import { addQuestionToPassageApi, addTeacherQuestionApi } from '../../api/teacherExamApi.js';
import { buildQuestionInitialForm } from '../../utils/questionForm.js';

export default function AddQuestionPage() {
  const { examId, passageId } = useParams();
  const navigate = useNavigate();
  const isPassageQuestion = Boolean(passageId);
  const backPath = `/teacher/exams/${examId}`;

  return (
    <QuestionEditorForm
      initialForm={buildQuestionInitialForm()}
      heading={isPassageQuestion ? 'Add Passage Question' : 'Add Standalone Question'}
      description="This reusable question form supports multiple choice and true / false, and it chooses the correct backend endpoint based on the current route."
      submitLabel="Add question"
      submittingLabel="Adding question..."
      cancelTo={backPath}
      onSubmit={async (payload) => {
        if (isPassageQuestion) {
          await addQuestionToPassageApi(passageId, payload);
        } else {
          await addTeacherQuestionApi(examId, payload);
        }

        navigate(backPath, { replace: true });
      }}
    />
  );
}
