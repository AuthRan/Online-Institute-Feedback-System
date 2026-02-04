import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enroll in a course (Student only)
router.post('/:courseId', authenticate, authorize('student'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Check if course exists and matches student's semester/department
    const [courses] = await pool.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = courses[0];
    if (course.semester !== req.user.semester || course.department !== req.user.department) {
      return res.status(403).json({ message: 'You can only enroll in courses matching your semester and department' });
    }

    // Check if already enrolled
    const [existing] = await pool.execute(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    await pool.execute(
      'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
      [studentId, courseId]
    );

    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unenroll from a course (Student only)
router.delete('/:courseId', authenticate, authorize('student'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


