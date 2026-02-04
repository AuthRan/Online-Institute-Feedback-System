import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

function TeacherDashboard() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [newSubject, setNewSubject] = useState({ title: '', description: '', code: '' })

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchFeedback(selectedSubject.id)
      fetchStats(selectedSubject.id)
    }
  }, [selectedSubject])

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/subjects/teacher/${user.id}`)
      setSubjects(res.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeedback = async (subjectId) => {
    try {
      const res = await api.get(`/feedback/subject/${subjectId}`)
      setFeedback(res.data)
    } catch (error) {
      console.error('Error fetching feedback:', error)
    }
  }

  const fetchStats = async (subjectId) => {
    try {
      const res = await api.get(`/feedback/stats/subject/${subjectId}`)
      setStats(res.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    try {
      await api.post('/subjects', newSubject)
      setNewSubject({ title: '', description: '', code: '' })
      fetchSubjects()
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating subject')
    }
  }

  if (loading && subjects.length === 0) {
    return <div className="dashboard"><div className="loading">Loading...</div></div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Subjects</h1>
        <p className="subtitle">Create and manage your teaching subjects</p>
      </div>
      
      <div className="card slide-in">
        <h3>Create New Subject</h3>
        <form onSubmit={handleCreateSubject}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Subject Title"
              value={newSubject.title}
              onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Subject Code"
              value={newSubject.code}
              onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
              required
            />
          </div>
          <textarea
            placeholder="Description"
            value={newSubject.description}
            onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary">Create Subject</button>
        </form>
      </div>

      <div className="subjects-grid">
        {subjects.map(subject => (
          <div
            key={subject.id}
            className={`subject-card ${selectedSubject?.id === subject.id ? 'selected' : ''}`}
            onClick={() => setSelectedSubject(subject)}
          >
            <div className="card-icon">📚</div>
            <h3>{subject.title}</h3>
            <p className="subject-code">{subject.code}</p>
            <p className="subject-description">{subject.description}</p>
            <div className="card-badge">Your Subject</div>
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>No subjects yet. Create your first subject above!</p>
          </div>
        )}
      </div>

      {selectedSubject && (
        <div className="feedback-section slide-in">
          <div className="section-header">
            <h2>Feedback for {selectedSubject.title}</h2>
            <button 
              className="btn-secondary btn-small"
              onClick={() => setSelectedSubject(null)}
            >
              Close
            </button>
          </div>
          
          {stats && (
            <>
              <div className="stats-grid">
                <div className="stat-card stat-primary">
                  <div className="stat-icon">📊</div>
                  <div>
                    <h4>Total Responses</h4>
                    <p className="stat-number">{stats.total_responses || 0}</p>
                  </div>
                </div>
                <div className="stat-card stat-success">
                  <div className="stat-icon">⭐</div>
                  <div>
                    <h4>Average Rating</h4>
                    <p className="stat-number">
                      {stats.average_rating ? parseFloat(stats.average_rating).toFixed(1) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="stat-card stat-info">
                  <div className="stat-icon">👍</div>
                  <div>
                    <h4>5 Stars</h4>
                    <p className="stat-number">{stats.rating_5 || 0}</p>
                  </div>
                </div>
                <div className="stat-card stat-warning">
                  <div className="stat-icon">📈</div>
                  <div>
                    <h4>4 Stars</h4>
                    <p className="stat-number">{stats.rating_4 || 0}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="card">
                  <h3>Rating Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '5 Stars', value: stats.rating_5 || 0 },
                          { name: '4 Stars', value: stats.rating_4 || 0 },
                          { name: '3 Stars', value: stats.rating_3 || 0 },
                          { name: '2 Stars', value: stats.rating_2 || 0 },
                          { name: '1 Star', value: stats.rating_1 || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: '5 Stars', value: stats.rating_5 || 0 },
                          { name: '4 Stars', value: stats.rating_4 || 0 },
                          { name: '3 Stars', value: stats.rating_3 || 0 },
                          { name: '2 Stars', value: stats.rating_2 || 0 },
                          { name: '1 Star', value: stats.rating_1 || 0 }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#dc2626'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3>Rating Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: '5⭐', value: stats.rating_5 || 0 },
                      { name: '4⭐', value: stats.rating_4 || 0 },
                      { name: '3⭐', value: stats.rating_3 || 0 },
                      { name: '2⭐', value: stats.rating_2 || 0 },
                      { name: '1⭐', value: stats.rating_1 || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Feedback Form</th>
                  <th>Responses</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>No feedback yet</td>
                  </tr>
                ) : (
                  feedback.map((fb, idx) => (
                    <tr key={idx}>
                      <td><strong>{fb.form_title}</strong></td>
                      <td>
                        <div className="feedback-preview">
                          {fb.responses.map((r, i) => (
                            <div key={i} className="feedback-item">
                              <strong>{r.question_text}:</strong>{' '}
                              {r.question_type === 'rating' ? (
                                <span className="rating">{'⭐'.repeat(r.rating || 0)}</span>
                              ) : (
                                <span>{r.response_value || 'N/A'}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>{new Date(fb.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="note-box">
            <strong>ℹ️ Note:</strong> Student names are hidden for privacy. Feedback is anonymous.
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
