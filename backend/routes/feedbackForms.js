import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all feedback forms for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const [forms] = await pool.execute(
      'SELECT * FROM feedback_forms WHERE course_id = ? ORDER BY created_at DESC',
      [req.params.courseId]
    );

    // Get questions for each form
    for (let form of forms) {
      const [questions] = await pool.execute(
        'SELECT * FROM feedback_form_questions WHERE form_id = ? ORDER BY question_order ASC',
        [form.id]
      );
      form.questions = questions;
    }

    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active feedback form for a course (for students)
router.get('/course/:courseId/active', authenticate, authorize('student'), async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Verify student is enrolled
    const [enrollments] = await pool.execute(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [req.user.id, courseId]
    );

    if (enrollments.length === 0) {
      return res.status(403).json({ message: 'You must be enrolled in this course to access feedback forms' });
    }

    const [forms] = await pool.execute(
      'SELECT * FROM feedback_forms WHERE course_id = ? AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [courseId]
    );

    if (forms.length === 0) {
      return res.status(404).json({ message: 'No active feedback form found for this course' });
    }

    const form = forms[0];
    const [questions] = await pool.execute(
      'SELECT * FROM feedback_form_questions WHERE form_id = ? ORDER BY question_order ASC',
      [form.id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Feedback form has no questions' });
    }

    form.questions = questions;

    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feedback form by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [forms] = await pool.execute('SELECT * FROM feedback_forms WHERE id = ?', [req.params.id]);

    if (forms.length === 0) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    const form = forms[0];
    const [questions] = await pool.execute(
      'SELECT * FROM feedback_form_questions WHERE form_id = ? ORDER BY question_order ASC',
      [form.id]
    );
    form.questions = questions;

    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create feedback form (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { course_id, title, description, questions } = req.body;

    if (!course_id || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Course ID, title, and at least one question are required' });
    }

    // Create form
    const [formResult] = await pool.execute(
      'INSERT INTO feedback_forms (course_id, title, description) VALUES (?, ?, ?)',
      [course_id, title, description || null]
    );

    const formId = formResult.insertId;

    // Create questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await pool.execute(
        'INSERT INTO feedback_form_questions (form_id, question_text, question_type, question_order, options) VALUES (?, ?, ?, ?, ?)',
        [formId, question.text, question.type || 'rating', i, question.options ? JSON.stringify(question.options) : null]
      );
    }

    // Fetch complete form
    const [forms] = await pool.execute('SELECT * FROM feedback_forms WHERE id = ?', [formId]);
    const [questionsData] = await pool.execute(
      'SELECT * FROM feedback_form_questions WHERE form_id = ? ORDER BY question_order ASC',
      [formId]
    );

    forms[0].questions = questionsData;

    res.status(201).json(forms[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update feedback form (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, is_active, questions } = req.body;

    const [forms] = await pool.execute('SELECT * FROM feedback_forms WHERE id = ?', [req.params.id]);

    if (forms.length === 0) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    await pool.execute(
      'UPDATE feedback_forms SET title = ?, description = ?, is_active = ? WHERE id = ?',
      [
        title || forms[0].title,
        description !== undefined ? description : forms[0].description,
        is_active !== undefined ? is_active : forms[0].is_active,
        req.params.id
      ]
    );

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await pool.execute('DELETE FROM feedback_form_questions WHERE form_id = ?', [req.params.id]);

      // Add new questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await pool.execute(
          'INSERT INTO feedback_form_questions (form_id, question_text, question_type, question_order, options) VALUES (?, ?, ?, ?, ?)',
          [req.params.id, question.text, question.type || 'rating', i, question.options ? JSON.stringify(question.options) : null]
        );
      }
    }

    const [updated] = await pool.execute('SELECT * FROM feedback_forms WHERE id = ?', [req.params.id]);
    const [questionsData] = await pool.execute(
      'SELECT * FROM feedback_form_questions WHERE form_id = ? ORDER BY question_order ASC',
      [req.params.id]
    );

    updated[0].questions = questionsData;

    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete feedback form (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM feedback_forms WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    res.json({ message: 'Feedback form deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;




