// AI-assisted [AI-14]
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import CourseListPage from './pages/CourseListPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CourseDetailPage from './pages/CourseDetailPage'
import QuizPage from './pages/QuizPage'
import MyCoursesPage from './pages/MyCoursesPage'
import LearnPage from './pages/LearnPage'
import TeacherLessonsPage from './pages/TeacherLessonsPage'
import TeacherQuestionsPage from './pages/TeacherQuestionsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import NotFoundPage from './pages/NotFoundPage'
import CategoryCoursePage from './pages/admin/CategoryCoursePage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CourseListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
        <Route
          path="/courses/:id/learn"
          element={
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/learn/:lessonId"
          element={
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherQuestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:courseId/questions"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherQuestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CategoryCoursePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
