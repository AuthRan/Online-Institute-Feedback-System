import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, name, semester, department } = req.body;

    if (!username || !email || !password || !role || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Students must provide semester and department
    if (role === 'student' && (!semester || !department)) {
      return res.status(400).json({ message: 'Semester and department are required for students' });
    }

    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role, name, semester, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, name, role === 'student' ? semester : null, role === 'student' ? department : null]
    );

    const token = jwt.sign(
      {
        id: result.insertId,
        username,
        email,
        role,
        name,
        semester: role === 'student' ? semester : null,
        department: role === 'student' ? department : null
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        role,
        name,
        semester: role === 'student' ? semester : null,
        department: role === 'student' ? department : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        semester: user.semester,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name,
        semester: user.semester,
        department: user.department
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await pool.execute('SELECT id, username, email, role, name, semester, department FROM users WHERE id = ?', [decoded.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;


