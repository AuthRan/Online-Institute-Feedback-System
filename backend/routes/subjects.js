import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all subjects (all users can view)
router.get('/', authenticate, async (req, res) => {
  try {
    const [subjects] = await pool.execute(`
      SELECT s.*, u.name as teacher_name 
      FROM subjects s 
      LEFT JOIN users u ON s.teacher_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subject by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [subjects] = await pool.execute(`
      SELECT s.*, u.name as teacher_name 
      FROM subjects s 
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subjects[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create subject (Teacher only)
router.post('/', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { title, description, code } = req.body;

    if (!title || !description || !code) {
      return res.status(400).json({ message: 'Title, description, and code are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO subjects (title, description, code, teacher_id) VALUES (?, ?, ?, ?)',
      [title, description, code, req.user.id]
    );

    const [subject] = await pool.execute(`
      SELECT s.*, u.name as teacher_name 
      FROM subjects s 
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `, [result.insertId]);

    res.status(201).json(subject[0]);
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subject code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subject (Teacher who owns it)
router.put('/:id', authenticate, authorize('teacher'), async (req, res) => {
  try {
    const { title, description, code } = req.body;
    
    const [subjects] = await pool.execute('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
    
    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const subject = subjects[0];
    if (subject.teacher_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own subjects' });
    }

    await pool.execute(
      'UPDATE subjects SET title = ?, description = ?, code = ? WHERE id = ?',
      [title || subject.title, description || subject.description, code || subject.code, req.params.id]
    );

    const [updated] = await pool.execute(`
      SELECT s.*, u.name as teacher_name 
      FROM subjects s 
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `, [req.params.id]);

    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete subject (Teacher who owns it or Admin)
router.delete('/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const [subjects] = await pool.execute('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
      if (subjects.length === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      if (subjects[0].teacher_id !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete your own subjects' });
      }
    }

    const [result] = await pool.execute('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subjects for a teacher
router.get('/teacher/:teacherId', authenticate, async (req, res) => {
  try {
    const [subjects] = await pool.execute(`
      SELECT s.*, u.name as teacher_name 
      FROM subjects s 
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.teacher_id = ?
      ORDER BY s.created_at DESC
    `, [req.params.teacherId]);
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;




