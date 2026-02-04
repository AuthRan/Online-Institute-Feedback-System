import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

function StudentDashboard() {
  const { user } = useAuth()
  const [allCourses, setAllCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [myFeedback, setMyFeedback] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState(null)
  const [formResponses, setFormResponses] = useState({})
  const [activeTab, setActiveTab] = useState('courses')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  // useEffect(() => {
  //   if (selectedSubject && selectedCourse) {
  //     fetchFeedbackForm(selectedCourse.id)
  //   }
  // }, [selectedSubject, selectedCourse])

  useEffect(() => {
    if (selectedSubject && selectedCourse && feedbackForm) {
      // Initialize responses when form is loaded
      const responses = {}
      feedbackForm.questions.forEach(q => {
        responses[q.id] = q.question_type === 'rating' ? 5 : ''
      })
      setFormResponses(responses)
      // Then fetch existing feedback to override
      fetchExistingFeedback()
    } else if (selectedSubject && selectedCourse && feedbackForm === null) {
      // If no form found, reset responses
      setFormResponses({})
    }
  }, [feedbackForm, selectedSubject])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'courses') {
        const [allRes, enrolledRes] = await Promise.all([
          api.get('/courses'),
          api.get('/courses/student/enrolled')
        ])
        setAllCourses(allRes.data)
        setEnrolledCourses(enrolledRes.data.map(c => c.id))
      } else if (activeTab === 'feedback') {
        const [coursesRes, feedbackRes] = await Promise.all([
          api.get('/courses'),
          api.get('/feedback/my')
        ])
        setAllCourses(coursesRes.data)
        setMyFeedback(feedbackRes.data)
      } else {
        const [allRes, enrolledRes, feedbackRes] = await Promise.all([
          api.get('/courses'),
          api.get('/courses/student/enrolled'),
          api.get('/feedback/my')
        ])
        setAllCourses(allRes.data)
        setEnrolledCourses(enrolledRes.data.map(c => c.id))
        setMyFeedback(feedbackRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeedbackForm = async (courseId) => {
    try {
      const res = await api.get(`/feedback-forms/course/${courseId}/active`)
      if (res.data && res.data.questions && res.data.questions.length > 0) {
        setFeedbackForm(res.data)
      } else {
        setFeedbackForm(null)
      }
    } catch (error) {
      console.error('Error fetching feedback form:', error)
      setFeedbackForm(null)
      if (error.response?.status === 404) {
        // Show a message that no form is available
        alert('No active feedback form found for this course. Please contact admin.')
      }
    }
  }

  const fetchExistingFeedback = async () => {
    if (!selectedSubject || !feedbackForm) return
    try {
      const res = await api.get(`/feedback/my`)
      const existing = res.data.find(fb =>
        fb.form_id === feedbackForm.id && fb.subject_id === selectedSubject.id
      )
      if (existing) {
        const responses = {}
        existing.responses.forEach(r => {
          responses[r.question_id] = r.question_type === 'rating' ? r.rating : r.response_value
        })
        setFormResponses(responses)
      } else {
        // Reset to default values
        const responses = {}
        feedbackForm.questions.forEach(q => {
          responses[q.id] = q.question_type === 'rating' ? 5 : ''
        })
        setFormResponses(responses)
      }
    } catch (error) {
      console.error('Error fetching existing feedback:', error)
      // Reset to default values
      const responses = {}
      feedbackForm.questions.forEach(q => {
        responses[q.id] = q.question_type === 'rating' ? 5 : ''
      })
      setFormResponses(responses)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/enrollments/${courseId}`)
      fetchData()
      alert('Enrolled successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error enrolling')
    }
  }

  const handleOpenFeedback = async (course, subject) => {
    try {
      const res = await api.get(`/feedback-forms/course/${course.id}/active`)
      if (res.data && res.data.questions && res.data.questions.length > 0) {
        setFeedbackForm(res.data)
        setSelectedCourse(course)
        setSelectedSubject(subject)
      } else {
        alert('No active feedback form available for this course.')
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert('No active feedback form available for this course. Please contact admin.')
      } else if (error.response?.status === 403) {
        alert('You must be enrolled to submit feedback.')
      } else {
        console.error('Error fetching form:', error)
        alert('Error checking for feedback form')
      }
    }
  }

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll?')) return
    try {
      await api.delete(`/enrollments/${courseId}`)
      fetchData()
      alert('Unenrolled successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error unenrolling')
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    if (!feedbackForm || !selectedSubject) return

    try {
      const responses = Object.entries(formResponses).map(([questionId, value]) => {
        const question = feedbackForm.questions.find(q => q.id === parseInt(questionId))
        return {
          question_id: parseInt(questionId),
          rating: question.question_type === 'rating' ? parseInt(value) : null,
          response_value: question.question_type !== 'rating' ? value : null
        }
      })

      await api.post('/feedback', {
        form_id: feedbackForm.id,
        subject_id: selectedSubject.id,
        responses
      })
      setSelectedSubject(null)
      setFormResponses({})
      fetchData()
      alert('Feedback submitted successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting feedback')
    }
  }

  const openFeedbackModal = async (course, subject) => {
    setSelectedCourse(course)
    setSelectedSubject(subject)
    // Fetch form will be handled by useEffect
  }

  if (loading && allCourses.length === 0) {
    return <div className="dashboard"><div className="loading">Loading...</div></div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p className="subtitle">
          Semester {user.semester}, {user.department}
        </p>
      </div>

      <div className="tabs">
        <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>
          📚 Available Courses
        </button>
        <button className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>
          💬 My Feedback
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="courses-grid">
          {allCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <p>No courses available for your semester and department.</p>
            </div>
          ) : (
            allCourses.map(course => {
              const isEnrolled = enrolledCourses.includes(course.id)
              return (
                <div key={course.id} className="course-card slide-in">
                  <div className="course-header">
                    <h3>{course.title}</h3>
                    <span className="course-badge">{course.code}</span>
                  </div>
                  <p className="course-meta">Semester {course.semester} • {course.department}</p>
                  <p className="course-description">{course.description}</p>

                  {course.subjects && course.subjects.length > 0 && (
                    <div className="subjects-list">
                      <strong>Subjects:</strong>
                      <ul>
                        {course.subjects.map(subject => (
                          <li key={subject.id}>
                            {subject.code} - {subject.title} ({subject.teacher_name})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="course-actions">
                    {isEnrolled ? (
                      <>


                        {course.subjects && course.subjects.length > 0 ? (
                          <>
                            {course.subjects.length === 1 ? (
                              <button
                                onClick={() => handleOpenFeedback(course, course.subjects[0])}
                                className="btn-primary"
                              >
                                Submit Feedback
                              </button>
                            ) : (
                              <select
                                onChange={(e) => {
                                  const subject = course.subjects.find(s => s.id === parseInt(e.target.value))
                                  if (subject) {
                                    handleOpenFeedback(course, subject)
                                    e.target.value = "" // Reset select
                                  }
                                }}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e2e8f0', marginBottom: '0.5rem' }}
                                defaultValue=""
                              >
                                <option value="">Select Subject to Submit Feedback</option>
                                {course.subjects.map(subject => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.title} - {subject.teacher_name}
                                  </option>
                                ))}
                              </select>
                            )}
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#718096' }}>
                              {course.subjects.length} subject{course.subjects.length > 1 ? 's' : ''} available
                            </div>
                          </>
                        ) : (
                          <p style={{ color: '#718096', fontSize: '0.9rem', margin: 0 }}>No subjects in this course yet</p>
                        )}
                        <button onClick={() => handleUnenroll(course.id)} className="btn-danger">
                          Unenroll
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleEnroll(course.id)} className="btn-primary">
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Form</th>
                <th>Responses</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myFeedback.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No feedback submitted yet</td>
                </tr>
              ) : (
                myFeedback.map((fb, idx) => (
                  <tr key={idx}>
                    <td>{fb.course_title || 'N/A'}</td>
                    <td>{fb.subject_title}</td>
                    <td>{fb.teacher_name}</td>
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
                    <td>
                      <button
                        onClick={() => {
                          // Find the course and subject to allow editing
                          const course = allCourses.find(c => c.title === fb.course_title)
                          const subject = course?.subjects?.find(s => s.id === fb.subject_id)
                          if (subject && course) {
                            openFeedbackModal(course, subject)
                          }
                        }}
                        className="btn-primary btn-small"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedCourse && selectedSubject && (
        <div className="modal-overlay" onClick={() => {
          setSelectedCourse(null)
          setSelectedSubject(null)
          setFormResponses({})
        }}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Feedback</h2>
              <p className="modal-subtitle">
                {selectedCourse.title} • {selectedSubject.title} ({selectedSubject.teacher_name})
              </p>
            </div>

            {feedbackForm && feedbackForm.questions && feedbackForm.questions.length > 0 ? (
              <form onSubmit={handleSubmitFeedback}>
                <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <strong>📝 Feedback Form:</strong> {feedbackForm.title}
                  {feedbackForm.description && <p style={{ margin: '0.5rem 0 0 0', color: '#64748b' }}>{feedbackForm.description}</p>}
                </div>
                {feedbackForm.questions.map((question, idx) => (
                  <div key={question.id} className="form-group question-group">
                    <label>
                      <strong>Q{idx + 1}:</strong> {question.question_text}
                      {question.question_type === 'rating' && ' (1-5 stars)'}
                    </label>
                    {question.question_type === 'rating' ? (
                      <div className="rating-selector">
                        {[5, 4, 3, 2, 1].map(rating => (
                          <button
                            key={rating}
                            type="button"
                            className={`rating-btn ${formResponses[question.id] == rating ? 'active' : ''}`}
                            onClick={() => setFormResponses({ ...formResponses, [question.id]: rating })}
                          >
                            {'⭐'.repeat(rating)}
                          </button>
                        ))}
                      </div>
                    ) : question.question_type === 'text' ? (
                      <textarea
                        value={formResponses[question.id] || ''}
                        onChange={(e) => setFormResponses({ ...formResponses, [question.id]: e.target.value })}
                        rows="4"
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        value={formResponses[question.id] || ''}
                        onChange={(e) => setFormResponses({ ...formResponses, [question.id]: e.target.value })}
                        required
                      />
                    )}
                  </div>
                ))}
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Submit Feedback</button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(null)
                      setSelectedSubject(null)
                      setFormResponses({})
                      setFeedbackForm(null)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p><strong>No active feedback form found for this course.</strong></p>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Please contact the administrator to create a feedback form for this course.</p>
                <button
                  onClick={() => {
                    setSelectedCourse(null)
                    setSelectedSubject(null)
                    setFeedbackForm(null)
                  }}
                  className="btn-secondary"
                  style={{ marginTop: '1rem' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
