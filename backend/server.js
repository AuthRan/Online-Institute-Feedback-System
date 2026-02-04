import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import subjectsRoutes from './routes/subjects.js';
import coursesRoutes from './routes/courses.js';
import enrollmentsRoutes from './routes/enrollments.js';
import feedbackRoutes from './routes/feedback.js';
import feedbackFormsRoutes from './routes/feedbackForms.js';
import reportsRoutes from './routes/reports.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/feedback-forms', feedbackFormsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


