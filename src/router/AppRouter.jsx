import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import ProtectedRoute from '../components/routes/ProtectedRoute.jsx';
import RoleRoute from '../components/routes/RoleRoute.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import CreateTeacherPage from '../pages/admin/CreateTeacherPage.jsx';
import HomePage from '../pages/public/HomePage.jsx';
import TeacherDashboardPage from '../pages/teacher/TeacherDashboardPage.jsx';
import MyExamsPage from '../pages/teacher/MyExamsPage.jsx';
import ExamDetailPage from '../pages/teacher/ExamDetailPage.jsx';
import CreateExamPage from '../pages/teacher/CreateExamPage.jsx';
import AddQuestionPage from '../pages/teacher/AddQuestionPage.jsx';
import CreatePassagePage from '../pages/teacher/CreatePassagePage.jsx';
import EditExamPage from '../pages/teacher/EditExamPage.jsx';
import EditQuestionPage from '../pages/teacher/EditQuestionPage.jsx';
import StudentDashboardPage from '../pages/student/StudentDashboardPage.jsx';
import StudentExamsPage from '../pages/student/StudentExamsPage.jsx';
import StudentTakeExamPage from '../pages/student/StudentTakeExamPage.jsx';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRole="ADMIN">
                <AdminDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/teachers/new"
            element={
              <RoleRoute allowedRole="ADMIN">
                <CreateTeacherPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <RoleRoute allowedRole="TEACHER">
                <TeacherDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams"
            element={
              <RoleRoute allowedRole="TEACHER">
                <MyExamsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/new"
            element={
              <RoleRoute allowedRole="TEACHER">
                <CreateExamPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:examId/edit"
            element={
              <RoleRoute allowedRole="TEACHER">
                <EditExamPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:examId/passages/new"
            element={
              <RoleRoute allowedRole="TEACHER">
                <CreatePassagePage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:examId/questions/new"
            element={
              <RoleRoute allowedRole="TEACHER">
                <AddQuestionPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:examId/passages/:passageId/questions/new"
            element={
              <RoleRoute allowedRole="TEACHER">
                <AddQuestionPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:examId/questions/:questionId/edit"
            element={
              <RoleRoute allowedRole="TEACHER">
                <EditQuestionPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:examId"
            element={
              <RoleRoute allowedRole="TEACHER">
                <ExamDetailPage />
              </RoleRoute>
            }
          />

          <Route
            path="/student"
            element={
              <RoleRoute allowedRole="STUDENT">
                <StudentDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/student/exams"
            element={
              <RoleRoute allowedRole="STUDENT">
                <StudentExamsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/student/exams/:examId"
            element={
              <RoleRoute allowedRole="STUDENT">
                <StudentTakeExamPage />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
