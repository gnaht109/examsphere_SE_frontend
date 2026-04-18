import { Navigate, useParams } from 'react-router-dom';

export default function EditExamPage() {
  const { examId } = useParams();

  return <Navigate to={`/teacher/exams/${examId}#settings`} replace />;
}
