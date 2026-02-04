import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all courses (filtered by semester/department for students)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT c.*, 
        GROUP_CONCAT(DISTINCT s.id) as subject_ids,
        GROUP_CONCAT(DISTINCT s.title) as subject_titles
      FROM courses c
      LEFT JOIN course_subjects cs ON c.id = cs.course_id
      LEFT JOIN subjects s ON cs.subject_id = s.id
    `;
    let params = [];

    // Students only see courses matching their semester and department
    if (req.user.role === 'student' && req.user.semester && req.user.department) {
      query += ' WHERE c.semester = ? AND c.department = ?';
      params = [req.user.semester, req.user.department];
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const [courses] = await pool.execute(query, params);

    // Fetch subjects for each course
    for (let course of courses) {
      if (course.subject_ids) {
        const [subjects] = await pool.execute(`
          SELECT s.*, u.name as teacher_name
          FROM subjects s
          LEFT JOIN users u ON s.teacher_id = u.id
          WHERE s.id IN (${course.subject_ids.split(',').map(() => '?').join(',')})
        `, course.subject_ids.split(','));
        course.subjects = subjects;
      } else {
        course.subjects = [];
      }
    }

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [courses] = await pool.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);

    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = courses[0];

    // Check if student can access this course
    if (req.user.role === 'student') {
      if (course.semester !== req.user.semester || course.department !== req.user.department) {
        return res.status(403).json({ message: 'You cannot access this course' });
      }
    }

    // Get subjects for this course
    const [subjects] = await pool.execute(`
      SELECT s.*, u.name as teacher_name
      FROM course_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE cs.course_id = ?
      ORDER BY s.created_at
    `, [req.params.id]);

    course.subjects = subjects;

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, code, semester, department, subject_ids } = req.body;

    if (!title || !description || !code || !semester || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO courses (title, description, code, semester, department) VALUES (?, ?, ?, ?, ?)',
      [title, description, code, semester, department]
    );

    const courseId = result.insertId;

    // Add subjects to course
    if (subject_ids && Array.isArray(subject_ids) && subject_ids.length > 0) {
      for (const subjectId of subject_ids) {
        await pool.execute(
          'INSERT INTO course_subjects (course_id, subject_id) VALUES (?, ?)',
          [courseId, subjectId]
        );
      }
    }

    // Fetch complete course data
    const [course] = await pool.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
    const [subjects] = await pool.execute(`
      SELECT s.*, u.name as teacher_name
      FROM course_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE cs.course_id = ?
    `, [courseId]);

    course[0].subjects = subjects;

    res.status(201).json(course[0]);
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, description, code, semester, department, subject_ids } = req.body;
    
    const [courses] = await pool.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    
    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await pool.execute(
      'UPDATE courses SET title = ?, description = ?, code = ?, semester = ?, department = ? WHERE id = ?',
      [
        title || courses[0].title,
        description || courses[0].description,
        code || courses[0].code,
        semester || courses[0].semester,
        department || courses[0].department,
        req.params.id
      ]
    );

    // Update course subjects if provided
    if (subject_ids && Array.isArray(subject_ids)) {
      // Delete existing associations
      await pool.execute('DELETE FROM course_subjects WHERE course_id = ?', [req.params.id]);
      
      // Add new associations
      for (const subjectId of subject_ids) {
        await pool.execute(
          'INSERT INTO course_subjects (course_id, subject_id) VALUES (?, ?)',
          [req.params.id, subjectId]
        );
      }
    }

    const [updated] = await pool.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    const [subjects] = await pool.execute(`
      SELECT s.*, u.name as teacher_name
      FROM course_subjects cs
      JOIN subjects s ON cs.subject_id = s.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE cs.course_id = ?
    `, [req.params.id]);

    updated[0].subjects = subjects;

    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get enrolled courses for a student
router.get('/student/enrolled', authenticate, authorize('student'), async (req, res) => {
  try {
    const [courses] = await pool.execute(`
      SELECT c.*, e.enrolled_at
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ? AND c.semester = ? AND c.department = ?
      ORDER BY e.enrolled_at DESC
    `, [req.user.id, req.user.semester, req.user.department]);

    // Get subjects for each course
    for (let course of courses) {
      const [subjects] = await pool.execute(`
        SELECT s.*, u.name as teacher_name
        FROM course_subjects cs
        JOIN subjects s ON cs.subject_id = s.id
        LEFT JOIN users u ON s.teacher_id = u.id
        WHERE cs.course_id = ?
      `, [course.id]);
      course.subjects = subjects;
    }

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
