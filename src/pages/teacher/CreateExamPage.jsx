import { useNavigate } from 'react-router-dom';
import ExamEditorForm from '../../components/forms/ExamEditorForm.jsx';
import ExamImportForm from '../../components/forms/ExamImportForm.jsx';
import {
  addQuestionToPassageApi,
  addTeacherQuestionApi,
  createPassageApi,
  createTeacherExamApi,
} from '../../api/teacherExamApi.js';

export default function CreateExamPage() {
  const navigate = useNavigate();

  async function createExamFromImport(parsed) {
    const createdExam = await createTeacherExamApi(parsed.exam);
    const passageMap = new Map();

    for (const question of parsed.questions) {
      if (question.passage) {
        if (!passageMap.has(question.passage)) {
          const passage = await createPassageApi(createdExam.id, {
            content: question.passage,
            passageOrder: question.passageOrder ? Number(question.passageOrder) : null,
            questions: [],
          });

          passageMap.set(question.passage, passage.id);
        }

        await addQuestionToPassageApi(passageMap.get(question.passage), {
          content: question.content,
          points: question.points,
          type: question.type,
          explaination: question.explaination || null,
          questionOrder: question.questionOrder ? Number(question.questionOrder) : null,
          options: question.options,
        });
      } else {
        await addTeacherQuestionApi(createdExam.id, {
          content: question.content,
          points: question.points,
          type: question.type,
          explaination: question.explaination || null,
          questionOrder: question.questionOrder ? Number(question.questionOrder) : null,
          options: question.options,
        });
      }
    }

    navigate(`/teacher/exams/${createdExam.id}`, { replace: true });
  }

  return (
    <section className="detail-layout create-exam-page">
      <header className="page-header">
        <div>
          <h2>Create Exam</h2>
          <p>Create the exam manually or import it from a spreadsheet in one clean teacher flow.</p>
        </div>
      </header>

      <div className="create-exam-grid">
        <ExamEditorForm
          initialForm={{
            title: '',
            description: '',
            duration: 60,
            totalScore: 100,
          }}
          heading="Manual Create"
          description="Create the exam metadata first, then manage content inside the exam workspace."
          submitLabel="Create exam"
          submittingLabel="Creating exam..."
          cancelTo="/teacher/exams"
          embedded
          cardClassName="embedded-form-card"
          onSubmit={async (payload) => {
            const createdExam = await createTeacherExamApi(payload);
            navigate(`/teacher/exams/${createdExam.id}`, { replace: true });
          }}
        />

        <ExamImportForm cancelTo="/teacher/exams" onImport={createExamFromImport} />
      </div>
    </section>
  );
}
