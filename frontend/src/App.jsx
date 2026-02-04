import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import Layout from './components/Layout'

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} />
  }

  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}/dashboard`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}/dashboard`} />} />
      
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/teacher/dashboard"
        element={
          <PrivateRoute allowedRoles={['teacher']}>
            <Layout>
              <TeacherDashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/student/dashboard"
        element={
          <PrivateRoute allowedRoles={['student']}>
            <Layout>
              <StudentDashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App


