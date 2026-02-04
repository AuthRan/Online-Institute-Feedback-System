import express from 'express';
import pool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, role, name, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users by role (Admin only)
router.get('/role/:role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.params;
    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const [users] = await pool.execute(
      'SELECT id, username, email, role, name, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      [role]
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


