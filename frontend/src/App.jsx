import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import CourseListPage from './pages/CourseListPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import QuizPage from './pages/QuizPage';
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CourseListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
      </Route>
    </Routes>
  )
}

export default App
