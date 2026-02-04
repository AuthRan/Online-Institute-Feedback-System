import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

import nitLogo from '../assets/nit_logo.png'

function Register() {
  // ... (state)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'student',
    semester: '',
    department: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await register(formData)

    if (result.success) {
      const userRole = result.user?.role || formData.role
      navigate(`/${userRole}/dashboard`)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src={nitLogo} alt="NIT Sikkim Logo" className="auth-logo" />
        </div>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formData.role === 'student' && (
            <>
              <div className="form-group">
                <label>Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required={formData.role === 'student'}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required={formData.role === 'student'}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>
            </>
          )}
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="auth-link">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register

