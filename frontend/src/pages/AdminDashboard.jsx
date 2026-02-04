import { useState, useEffect } from 'react'
import api from '../services/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { generatePDF } from '../utils/generatePDF'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './Dashboard.css'

function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [courses, setCourses] = useState([])
  const [feedback, setFeedback] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [newCourse, setNewCourse] = useState({ title: '', description: '', code: '', semester: '', department: '', subject_ids: [] })
  const [selectedCourse, setSelectedCourse] = useState(null)

  const [newForm, setNewForm] = useState({
    course_id: '',
    title: '',
    description: '',
    questions: [
      { text: 'How would you rate the course content?', type: 'rating' },
      { text: 'How would you rate the teacher\'s explanation?', type: 'rating' },
      { text: 'Any other suggestions or comments?', type: 'text' }
    ]
  })
  const [feedbackForms, setFeedbackForms] = useState([])
  const [selectedSubjectForReport, setSelectedSubjectForReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'users') {
        const res = await api.get('/users')
        setUsers(res.data)
      } else if (activeTab === 'subjects') {
        const res = await api.get('/subjects')
        setSubjects(res.data)
      } else if (activeTab === 'courses') {
        const [coursesRes, subjectsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/subjects')
        ])
        setCourses(coursesRes.data)
        setSubjects(subjectsRes.data)
      } else if (activeTab === 'forms') {
        const coursesRes = await api.get('/courses')
        const forms = []
        // Fetch forms for each course
        for (const course of coursesRes.data) {
          try {
            const formRes = await api.get(`/feedback-forms/course/${course.id}`)
            if (formRes.data && formRes.data.length > 0) {
              forms.push(...formRes.data.map(f => ({ ...f, course_title: course.title })))
            }
          } catch (error) {
            // Course has no forms, skip
          }
        }
        setFeedbackForms(forms)
      } else if (activeTab === 'feedback') {
        const res = await api.get('/feedback/all')
        setFeedback(res.data)
      } else {
        const [usersRes, coursesRes, subjectsRes, feedbackRes] = await Promise.all([
          api.get('/users'),
          api.get('/courses'),
          api.get('/subjects'),
          api.get('/feedback/all')
        ])
        setUsers(usersRes.data)
        setCourses(coursesRes.data)
        setSubjects(subjectsRes.data)
        setFeedback(feedbackRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      await api.post('/courses', {
        ...newCourse,
        subject_ids: newCourse.subject_ids
      })
      setNewCourse({ title: '', description: '', code: '', semester: '', department: '', subject_ids: [] })
      fetchData()
      toast.success('Course created successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating course')
    }
  }

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return
    try {
      await api.delete(`/courses/${id}`)
      fetchData()
      toast.success('Course deleted successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting course')
    }
  }

  const handleCreateForm = async (e) => {
    e.preventDefault()
    if (newForm.questions.length === 0 || newForm.questions.some(q => !q.text.trim())) {
      toast.error('Please add at least one question')
      return
    }
    try {
      await api.post('/feedback-forms', newForm)

      setNewForm({
        course_id: '',
        title: '',
        description: '',
        questions: [
          { text: 'How would you rate the course content?', type: 'rating' },
          { text: 'How would you rate the teacher\'s explanation?', type: 'rating' },
          { text: 'Any other suggestions or comments?', type: 'text' }
        ]
      })
      fetchData()
      toast.success('Feedback form created successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating form')
    }
  }

  const addQuestion = () => {
    setNewForm({
      ...newForm,
      questions: [...newForm.questions, { text: '', type: 'rating' }]
    })
  }

  const removeQuestion = (index) => {
    setNewForm({
      ...newForm,
      questions: newForm.questions.filter((_, i) => i !== index)
    })
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...newForm.questions]
    updated[index][field] = value
    setNewForm({ ...newForm, questions: updated })
  }

  const stats = {
    totalUsers: users.length,
    totalTeachers: users.filter(u => u.role === 'teacher').length,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalSubjects: subjects.length,
    totalCourses: courses.length,
    totalFeedback: feedback.length
  }

  return (
    <div className="dashboard">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Manage your institute's feedback system</p>
      </div>

      <div className="tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={activeTab === 'subjects' ? 'active' : ''} onClick={() => setActiveTab('subjects')}>
          📚 Subjects
        </button>
        <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
          🎓 Courses
        </button>
        <button className={activeTab === 'forms' ? 'active' : ''} onClick={() => setActiveTab('forms')}>
          📝 Feedback Forms
        </button>
        <button className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>
          💬 All Feedback
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          👥 Users
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card stat-primary slide-in">
                  <div className="stat-icon">👥</div>
                  <div>
                    <h3>Total Users</h3>
                    <p className="stat-number">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="stat-card stat-info slide-in">
                  <div className="stat-icon">👨‍🏫</div>
                  <div>
                    <h3>Teachers</h3>
                    <p className="stat-number">{stats.totalTeachers}</p>
                  </div>
                </div>
                <div className="stat-card stat-success slide-in">
                  <div className="stat-icon">🎓</div>
                  <div>
                    <h3>Students</h3>
                    <p className="stat-number">{stats.totalStudents}</p>
                  </div>
                </div>
                <div className="stat-card stat-warning slide-in">
                  <div className="stat-icon">📚</div>
                  <div>
                    <h3>Subjects</h3>
                    <p className="stat-number">{stats.totalSubjects}</p>
                  </div>
                </div>
                <div className="stat-card stat-danger slide-in">
                  <div className="stat-icon">🎯</div>
                  <div>
                    <h3>Courses</h3>
                    <p className="stat-number">{stats.totalCourses}</p>
                  </div>
                </div>
                <div className="stat-card stat-purple slide-in">
                  <div className="stat-icon">💬</div>
                  <div>
                    <h3>Total Feedback</h3>
                    <p className="stat-number">{stats.totalFeedback}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="card">
                  <h3>User Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Students', value: stats.totalStudents },
                          { name: 'Teachers', value: stats.totalTeachers },
                          { name: 'Admins', value: users.filter(u => u.role === 'admin').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Students', value: stats.totalStudents },
                          { name: 'Teachers', value: stats.totalTeachers },
                          { name: 'Admins', value: users.filter(u => u.role === 'admin').length }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#ef4444'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3>System Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Users', value: stats.totalUsers },
                      { name: 'Subjects', value: stats.totalSubjects },
                      { name: 'Courses', value: stats.totalCourses },
                      { name: 'Feedback', value: stats.totalFeedback }
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

          {activeTab === 'subjects' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Teacher</th>
                    <th>Description</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(subject => (
                    <tr key={subject.id}>
                      <td><span className="code-badge">{subject.code}</span></td>
                      <td>{subject.title}</td>
                      <td>{subject.teacher_name}</td>
                      <td>{subject.description}</td>
                      <td>{new Date(subject.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <div className="card slide-in">
                <h3>Create New Course</h3>
                <p className="card-subtitle">A course is a collection of subjects for a specific semester and department</p>
                <form onSubmit={handleCreateCourse}>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Course Title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Course Code"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <select
                      value={newCourse.semester}
                      onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                      required
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                    <select
                      value={newCourse.department}
                      onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                      required
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
                  <textarea
                    placeholder="Course Description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    required
                  />
                  <div className="form-group">
                    <label>Select Subjects for this Course:</label>
                    <div className="checkbox-group">
                      {subjects.map(subject => (
                        <label key={subject.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={newCourse.subject_ids.includes(subject.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewCourse({
                                  ...newCourse,
                                  subject_ids: [...newCourse.subject_ids, subject.id]
                                })
                              } else {
                                setNewCourse({
                                  ...newCourse,
                                  subject_ids: newCourse.subject_ids.filter(id => id !== subject.id)
                                })
                              }
                            }}
                          />
                          <span>{subject.code} - {subject.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">Create Course</button>
                </form>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Semester</th>
                      <th>Department</th>
                      <th>Subjects</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id}>
                        <td><span className="code-badge">{course.code}</span></td>
                        <td>{course.title}</td>
                        <td>Sem {course.semester}</td>
                        <td>{course.department}</td>
                        <td>
                          {course.subjects && course.subjects.length > 0 ? (
                            <div className="subject-tags">
                              {course.subjects.map(s => (
                                <span key={s.id} className="subject-tag">{s.code}</span>
                              ))}
                            </div>
                          ) : 'No subjects'}
                        </td>
                        <td>
                          <button onClick={() => handleDeleteCourse(course.id)} className="btn-danger">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'forms' && (
            <div>
              <div className="card slide-in">
                <h3>Create Feedback Form</h3>
                <p className="card-subtitle">Create custom feedback forms with multiple questions for courses</p>
                <form onSubmit={handleCreateForm}>
                  <select
                    value={newForm.course_id}
                    onChange={(e) => setNewForm({ ...newForm, course_id: e.target.value })}
                    required
                    style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem' }}
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title} (Sem {course.semester}, {course.department})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Form Title"
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    required
                    style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem' }}
                  />
                  <textarea
                    placeholder="Form Description (optional)"
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', minHeight: '80px' }}
                  />
                  <div className="form-group">
                    <label>Questions:</label>
                    {newForm.questions.map((q, idx) => (
                      <div key={idx} className="question-item">
                        <input
                          type="text"
                          placeholder="Question text"
                          value={q.text}
                          onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                          required
                        />
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                        >
                          <option value="rating">Rating (1-5 stars)</option>
                          <option value="text">Text Answer</option>
                          <option value="choice">Multiple Choice</option>
                        </select>
                        {q.type === 'choice' && (
                          <input
                            type="text"
                            placeholder="Options (comma-separated, e.g: Excellent, Good, Average, Poor)"
                            value={q.options ? (Array.isArray(q.options) ? q.options.join(', ') : q.options) : ''}
                            onChange={(e) => {
                              const optionsArray = e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                              updateQuestion(idx, 'options', optionsArray)
                            }}
                            style={{ marginTop: '0.5rem', width: '100%' }}
                          />
                        )}
                        {newForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            className="btn-danger btn-small"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addQuestion} className="btn-secondary">
                      + Add Question
                    </button>
                  </div>
                  <button type="submit" className="btn-primary">Create Form</button>
                </form>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Course</th>
                      <th>Questions</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackForms.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>No feedback forms yet. Create one above!</td>
                      </tr>
                    ) : (
                      feedbackForms.map(form => (
                        <tr key={form.id}>
                          <td><strong>{form.title}</strong></td>
                          <td>{form.course_title || 'N/A'}</td>
                          <td><span className="code-badge">{form.questions?.length || 0} questions</span></td>
                          <td>
                            <span className={`status-badge ${form.is_active ? 'active' : 'inactive'}`}>
                              {form.is_active ? '✓ Active' : '✗ Inactive'}
                            </span>
                          </td>
                          <td>{new Date(form.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>📊 Feedback Submission Status</h3>
                <p className="card-subtitle">View which students have submitted feedback for each course</p>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title} (Sem {course.semester}, {course.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>📧 Send Report to Teacher</h3>
                <p className="card-subtitle">Generate and download PDF reports or send them to teachers</p>
                <select
                  value={selectedSubjectForReport || ''}
                  onChange={async (e) => {
                    const subjectId = e.target.value
                    if (subjectId) {
                      setSelectedSubjectForReport(subjectId)
                      try {
                        const res = await api.get(`/reports/subject/${subjectId}`)
                        setReportData(res.data)
                      } catch (error) {
                        alert('Error fetching report data')
                      }
                    } else {
                      setSelectedSubjectForReport(null)
                      setReportData(null)
                    }
                  }}
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.title} ({subject.teacher_name})
                    </option>
                  ))}
                </select>

                {reportData && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                    <h4>Report Preview for {reportData.subject.title}</h4>
                    <p><strong>Teacher:</strong> {reportData.subject.teacher_name}</p>
                    <p><strong>Total Responses:</strong> {reportData.statistics.total_responses}</p>
                    <p><strong>Average Rating:</strong> {reportData.statistics.average_rating || 'N/A'}</p>
                    <div style={{ marginTop: '1rem' }}>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[
                          { name: '5⭐', value: (reportData.statistics.rating_distribution && reportData.statistics.rating_distribution[5]) || 0 },
                          { name: '4⭐', value: (reportData.statistics.rating_distribution && reportData.statistics.rating_distribution[4]) || 0 },
                          { name: '3⭐', value: (reportData.statistics.rating_distribution && reportData.statistics.rating_distribution[3]) || 0 },
                          { name: '2⭐', value: (reportData.statistics.rating_distribution && reportData.statistics.rating_distribution[2]) || 0 },
                          { name: '1⭐', value: (reportData.statistics.rating_distribution && reportData.statistics.rating_distribution[1]) || 0 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#667eea" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button
                        onClick={() => generatePDF(reportData)}
                        className="btn-primary"
                        style={{ backgroundColor: '#48bb78', color: 'white' }}
                      >
                        📄 Download PDF Report
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Send feedback report to ${reportData.subject.teacher_name}?`)) {
                            try {
                              await api.post(`/reports/send-to-teacher/${selectedSubjectForReport}`, {
                                message: `Feedback report for ${reportData.subject.title}`
                              })
                              alert('Report sent to teacher successfully!')
                            } catch (error) {
                              alert('Error sending report')
                            }
                          }
                        }}
                        className="btn-secondary"
                      >
                        📧 Send Report to Teacher
                      </button>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                      💡 <strong>Tip:</strong> Click "Download PDF Report" to save a professional PDF with all feedback statistics and comments.
                    </p>
                  </div>
                )}
              </div>

              <div className="table-container">
                <h3 style={{ marginBottom: '1rem' }}>📝 All Submitted Feedback</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Subject</th>
                      <th>Form</th>
                      <th>Responses</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filteredFeedback = selectedCourseFilter
                        ? feedback.filter(fb => {
                          // Find the course by ID
                          const selectedCourse = courses.find(c => c.id === parseInt(selectedCourseFilter))
                          // Match by course title since that's what's in the feedback
                          return selectedCourse && fb.course_title === selectedCourse.title
                        })
                        : feedback

                      return filteredFeedback.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center' }}>
                            {selectedCourseFilter ? 'No feedback submitted for this course yet' : 'No feedback submitted yet'}
                          </td>
                        </tr>
                      ) : (
                        filteredFeedback.map((fb, idx) => (
                          <tr key={idx}>
                            <td>{fb.student_name}</td>
                            <td>{fb.course_title}</td>
                            <td>{fb.subject_title}</td>
                            <td>{fb.form_title}</td>
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
                      )
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Semester/Dept</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                      <td>
                        {user.role === 'student' && user.semester && user.department ? (
                          `Sem ${user.semester}, ${user.department}`
                        ) : '-'}
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminDashboard
