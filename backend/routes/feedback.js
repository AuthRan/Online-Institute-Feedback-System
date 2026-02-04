import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Submit feedback responses (Student only, for enrolled courses)
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { form_id, subject_id, responses } = req.body;
    const studentId = req.user.id;

    if (!form_id || !subject_id || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: 'Form ID, subject ID, and responses are required' });
    }

    // Verify form exists and is active
    const [forms] = await pool.execute(
      'SELECT * FROM feedback_forms WHERE id = ? AND is_active = TRUE',
      [form_id]
    );

    if (forms.length === 0) {
      return res.status(404).json({ message: 'Active feedback form not found' });
    }

    // Verify student is enrolled in the course
    const [enrollments] = await pool.execute(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, forms[0].course_id]
    );

    if (enrollments.length === 0) {
      return res.status(403).json({ message: 'You must be enrolled in this course to submit feedback' });
    }

    // Verify subject belongs to the course
    const [courseSubjects] = await pool.execute(
      'SELECT * FROM course_subjects WHERE course_id = ? AND subject_id = ?',
      [forms[0].course_id, subject_id]
    );

    if (courseSubjects.length === 0) {
      return res.status(400).json({ message: 'Subject does not belong to this course' });
    }

    // Delete existing responses for this student, form, and subject
    await pool.execute(
      'DELETE FROM feedback_responses WHERE student_id = ? AND form_id = ? AND subject_id = ?',
      [studentId, form_id, subject_id]
    );

    // Insert new responses
    for (const response of responses) {
      const { question_id, rating, response_value } = response;

      await pool.execute(
        'INSERT INTO feedback_responses (student_id, form_id, subject_id, question_id, rating, response_value) VALUES (?, ?, ?, ?, ?, ?)',
        [studentId, form_id, subject_id, question_id, rating || null, response_value || null]
      );
    }

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feedback responses for a subject (Teacher - anonymous, Admin - with student names)
router.get('/subject/:subjectId', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { subjectId } = req.params;
    const isAdmin = req.user.role === 'admin';

    // If teacher, verify they teach this subject
    if (req.user.role === 'teacher') {
      const [subjects] = await pool.execute('SELECT * FROM subjects WHERE id = ? AND teacher_id = ?', [subjectId, req.user.id]);
      if (subjects.length === 0) {
        return res.status(403).json({ message: 'You can only view feedback for subjects you teach' });
      }
    }

    // Get all responses for this subject, grouped by form and student
    const query = `
      SELECT 
        fr.form_id,
        fr.subject_id,
        ${isAdmin ? 'u.name as student_name, u.id as student_id,' : ''}
        fq.id as question_id,
        fq.question_text,
        fq.question_type,
        fr.rating,
        fr.response_value,
        fr.created_at,
        s.title as subject_title,
        ff.title as form_title
      FROM feedback_responses fr
      JOIN feedback_form_questions fq ON fr.question_id = fq.id
      JOIN subjects s ON fr.subject_id = s.id
      JOIN feedback_forms ff ON fr.form_id = ff.id
      ${isAdmin ? 'JOIN users u ON fr.student_id = u.id' : ''}
      WHERE fr.subject_id = ?
      ORDER BY fr.created_at DESC
    `;

    const [responses] = await pool.execute(query, [subjectId]);

    // Group responses by student (or anonymous for teachers) and form
    const grouped = {};
    for (const response of responses) {
      const key = isAdmin
        ? `${response.form_id}-${response.student_id}`
        : `${response.form_id}-${response.created_at}`;

      if (!grouped[key]) {
        grouped[key] = {
          form_id: response.form_id,
          form_title: response.form_title,
          subject_id: response.subject_id,
          subject_title: response.subject_title,
          ...(isAdmin && { student_id: response.student_id, student_name: response.student_name }),
          created_at: response.created_at,
          responses: []
        };
      }

      grouped[key].responses.push({
        question_id: response.question_id,
        question_text: response.question_text,
        question_type: response.question_type,
        rating: response.rating,
        response_value: response.response_value
      });
    }

    res.json(Object.values(grouped));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedback (Admin only - with student names)
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [responses] = await pool.execute(`
      SELECT 
        fr.*,
        u.name as student_name,
        s.title as subject_title,
        s.teacher_id,
        t.name as teacher_name,
        ff.title as form_title,
        c.title as course_title,
        fq.question_text,
        fq.question_type
      FROM feedback_responses fr
      JOIN users u ON fr.student_id = u.id
      JOIN subjects s ON fr.subject_id = s.id
      JOIN users t ON s.teacher_id = t.id
      JOIN feedback_forms ff ON fr.form_id = ff.id
      JOIN courses c ON ff.course_id = c.id
      JOIN feedback_form_questions fq ON fr.question_id = fq.id
      ORDER BY fr.created_at DESC
    `);

    // Group by student, form, and subject
    const grouped = {};
    for (const response of responses) {
      const key = `${response.student_id}-${response.form_id}-${response.subject_id}`;

      if (!grouped[key]) {
        grouped[key] = {
          student_id: response.student_id,
          student_name: response.student_name,
          form_id: response.form_id,
          form_title: response.form_title,
          subject_id: response.subject_id,
          subject_title: response.subject_title,
          teacher_id: response.teacher_id,
          teacher_name: response.teacher_name,
          course_title: response.course_title,
          created_at: response.created_at,
          responses: []
        };
      }

      grouped[key].responses.push({
        question_id: response.question_id,
        question_text: response.question_text,
        question_type: response.question_type,
        rating: response.rating,
        response_value: response.response_value
      });
    }

    res.json(Object.values(grouped));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my submitted feedback (Student)
router.get('/my', authenticate, authorize('student'), async (req, res) => {
  try {
    const [responses] = await pool.execute(`
      SELECT 
        fr.*,
        s.title as subject_title,
        s.code as subject_code,
        t.name as teacher_name,
        ff.title as form_title,
        fq.question_text,
        fq.question_type,
        c.title as course_title,
        c.code as course_code
      FROM feedback_responses fr
      JOIN subjects s ON fr.subject_id = s.id
      JOIN users t ON s.teacher_id = t.id
      JOIN feedback_forms ff ON fr.form_id = ff.id
      JOIN courses c ON ff.course_id = c.id
      JOIN feedback_form_questions fq ON fr.question_id = fq.id
      WHERE fr.student_id = ?
      ORDER BY fr.created_at DESC
    `);

    // Group by form and subject
    const grouped = {};
    for (const response of responses) {
      const key = `${response.form_id}-${response.subject_id}`;

      if (!grouped[key]) {
        grouped[key] = {
          form_id: response.form_id,
          form_title: response.form_title,
          subject_id: response.subject_id,
          subject_title: response.subject_title,
          subject_code: response.subject_code,
          teacher_name: response.teacher_name,
          course_title: response.course_title,
          course_code: response.course_code,
          created_at: response.created_at,
          responses: []
        };
      }

      grouped[key].responses.push({
        question_id: response.question_id,
        question_text: response.question_text,
        question_type: response.question_type,
        rating: response.rating,
        response_value: response.response_value
      });
    }

    res.json(Object.values(grouped));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feedback statistics for a subject
router.get('/stats/subject/:subjectId', authenticate, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { subjectId } = req.params;

    // If teacher, verify they teach this subject
    if (req.user.role === 'teacher') {
      const [subjects] = await pool.execute('SELECT * FROM subjects WHERE id = ? AND teacher_id = ?', [subjectId, req.user.id]);
      if (subjects.length === 0) {
        return res.status(403).json({ message: 'You can only view stats for subjects you teach' });
      }
    }

    // Get statistics for rating questions
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT fr.student_id) as total_responses,
        COUNT(fr.id) as total_answers,
        AVG(CASE WHEN fr.rating IS NOT NULL THEN fr.rating END) as average_rating,
        SUM(CASE WHEN fr.rating = 5 THEN 1 ELSE 0 END) as rating_5,
        SUM(CASE WHEN fr.rating = 4 THEN 1 ELSE 0 END) as rating_4,
        SUM(CASE WHEN fr.rating = 3 THEN 1 ELSE 0 END) as rating_3,
        SUM(CASE WHEN fr.rating = 2 THEN 1 ELSE 0 END) as rating_2,
        SUM(CASE WHEN fr.rating = 1 THEN 1 ELSE 0 END) as rating_1
      FROM feedback_responses fr
      JOIN feedback_form_questions fq ON fr.question_id = fq.id
      WHERE fr.subject_id = ? AND fq.question_type = 'rating'
    `, [subjectId]);

    res.json(stats[0] || {
      total_responses: 0,
      total_answers: 0,
      average_rating: null,
      rating_5: 0,
      rating_4: 0,
      rating_3: 0,
      rating_2: 0,
      rating_1: 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
