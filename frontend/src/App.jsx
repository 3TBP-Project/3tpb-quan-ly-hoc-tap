import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import CourseListPage from './pages/CourseListPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import QuizPage from './pages/QuizPage'
import CourseDetailPage from './pages/CourseDetailPage'
import MyCoursesPage from './pages/MyCoursesPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LearnPage from './pages/LearnPage'
import NotFoundPage from './pages/NotFoundPage'
import TeacherQuestionsPage from './pages/TeacherQuestionsPage'


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
        <Route path="/courses/:id/learn" element={
          <ProtectedRoute>
            <LearnPage />
          </ProtectedRoute>
        } />
        <Route path="/courses/:id/learn/:lessonId" element={
          <ProtectedRoute>
            <LearnPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
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
    </Routes>
  )
}

export default App