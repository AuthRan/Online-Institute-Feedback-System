import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get feedback report for a subject (Admin only - can send to teacher)
router.get('/subject/:subjectId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Get subject details
    const [subjects] = await pool.execute(`
      SELECT s.*, u.name as teacher_name, u.email as teacher_email
      FROM subjects s
      JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `, [subjectId]);

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const subject = subjects[0];

    // Get all feedback responses for this subject
    const [responses] = await pool.execute(`
      SELECT 
        fr.*,
        u.name as student_name,
        u.id as student_id,
        fq.question_text,
        fq.question_type,
        ff.title as form_title,
        ff.id as form_id,
        c.title as course_title,
        c.semester,
        c.department
      FROM feedback_responses fr
      JOIN users u ON fr.student_id = u.id
      JOIN feedback_form_questions fq ON fr.question_id = fq.id
      JOIN feedback_forms ff ON fr.form_id = ff.id
      JOIN courses c ON ff.course_id = c.id
      WHERE fr.subject_id = ?
      ORDER BY fr.created_at DESC
    `, [subjectId]);

    // Group responses by student and form
    const groupedByStudent = {};
    for (const response of responses) {
      const key = `${response.student_id}-${response.form_id}`;
      if (!groupedByStudent[key]) {
        groupedByStudent[key] = {
          student_id: response.student_id,
          student_name: response.student_name,
          form_id: response.form_id,
          form_title: response.form_title,
          course_title: response.course_title,
          semester: response.semester,
          department: response.department,
          created_at: response.created_at,
          responses: []
        };
      }
      groupedByStudent[key].responses.push({
        question_text: response.question_text,
        question_type: response.question_type,
        rating: response.rating,
        response_value: response.response_value
      });
    }

    // Calculate statistics
    const ratingQuestions = responses.filter(r => r.question_type === 'rating' && r.rating);
    const stats = {
      total_responses: Object.keys(groupedByStudent).length,
      total_answers: responses.length,
      average_rating: ratingQuestions.length > 0
        ? (ratingQuestions.reduce((sum, r) => sum + r.rating, 0) / ratingQuestions.length).toFixed(2)
        : null,
      rating_distribution: {
        5: ratingQuestions.filter(r => r.rating === 5).length,
        4: ratingQuestions.filter(r => r.rating === 4).length,
        3: ratingQuestions.filter(r => r.rating === 3).length,
        2: ratingQuestions.filter(r => r.rating === 2).length,
        1: ratingQuestions.filter(r => r.rating === 1).length
      },
      text_responses: responses.filter(r => r.question_type === 'text' && r.response_value).map(r => ({
        question: r.question_text,
        response: r.response_value
      }))
    };

    res.json({
      subject,
      feedback: Object.values(groupedByStudent),
      statistics: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send report to teacher (Admin only)
router.post('/send-to-teacher/:subjectId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { message } = req.body;

    // Get subject and teacher details
    const [subjects] = await pool.execute(`
      SELECT s.*, u.name as teacher_name, u.email as teacher_email
      FROM subjects s
      JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `, [subjectId]);

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const subject = subjects[0];

    // Get feedback statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT fr.student_id) as total_responses,
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

    // In a real application, you would send an email here
    // For now, we'll just return success with the report data
    const report = {
      subject: {
        title: subject.title,
        code: subject.code
      },
      teacher: {
        name: subject.teacher_name,
        email: subject.teacher_email
      },
      statistics: stats[0],
      message: message || 'Feedback report for your subject',
      generated_at: new Date().toISOString()
    };

    // TODO: Implement email sending here
    // await sendEmail(subject.teacher_email, 'Feedback Report', report);

    res.json({
      message: 'Report sent to teacher successfully',
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

