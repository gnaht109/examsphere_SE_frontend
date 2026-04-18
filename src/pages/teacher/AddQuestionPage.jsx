import { Navigate, useParams } from 'react-router-dom';

export default function AddQuestionPage() {
  const { examId, passageId } = useParams();
  const hash = passageId ? '#passages' : '#questions';

  return <Navigate to={`/teacher/exams/${examId}${hash}`} replace />;
}
