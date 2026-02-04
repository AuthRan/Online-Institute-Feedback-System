import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Layout.css'

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return '#dc3545'
      case 'teacher': return '#0d6efd'
      case 'student': return '#198754'
      default: return '#6c757d'
    }
  }

  return (
    <div className="layout">
      <nav className="navbar" style={{ backgroundColor: getRoleColor() }}>
        <div className="nav-container">
          <h1 className="nav-brand">Institute Feedback System</h1>
          <div className="nav-user">
            <span className="user-name">{user?.name} ({user?.role})</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout


