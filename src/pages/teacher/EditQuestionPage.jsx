import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionEditorForm from '../../components/forms/QuestionEditorForm.jsx';
import { getTeacherExamDetailApi, updateTeacherQuestionApi } from '../../api/teacherExamApi.js';
import { buildQuestionInitialForm } from '../../utils/questionForm.js';

function findQuestion(exam, questionId) {
  const normalizedId = String(questionId);
  const standaloneQuestion = exam?.questions?.find((question) => String(question.id) === normalizedId);

  if (standaloneQuestion) {
    return standaloneQuestion;
  }

  for (const passage of exam?.passages || []) {
    const passageQuestion = passage.questions?.find((question) => String(question.id) === normalizedId);
    if (passageQuestion) {
      return passageQuestion;
    }
  }

  return null;
}

export default function EditQuestionPage() {
  const { examId, questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadQuestion() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const exam = await getTeacherExamDetailApi(examId);
        const matchedQuestion = findQuestion(exam, questionId);

        if (!ignore) {
          if (!matchedQuestion) {
            setErrorMessage('Question not found in this exam.');
          } else {
            setQuestion(matchedQuestion);
          }
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

    loadQuestion();

    return () => {
      ignore = true;
    };
  }, [examId, questionId]);

  if (isLoading) {
    return <div className="empty-state">Loading question editor...</div>;
  }

  if (errorMessage) {
    return <div className="error-banner">{errorMessage}</div>;
  }

  return (
    <QuestionEditorForm
      initialForm={buildQuestionInitialForm(question)}
      heading="Edit Question"
      description="This page reuses the same question form as the add flow, but starts from the current backend values and submits to the update endpoint."
      submitLabel="Save changes"
      submittingLabel="Saving changes..."
      cancelTo={`/teacher/exams/${examId}`}
      onSubmit={async (payload) => {
        await updateTeacherQuestionApi(examId, questionId, payload);
        navigate(`/teacher/exams/${examId}`, { replace: true });
      }}
    />
  );
}
