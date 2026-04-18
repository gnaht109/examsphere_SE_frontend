import { Navigate, useParams } from 'react-router-dom';

export default function EditQuestionPage() {
  const { examId, questionId } = useParams();

  return <Navigate to={`/teacher/exams/${examId}#question-${questionId}`} replace />;
}
