-- Create database
CREATE DATABASE IF NOT EXISTS institute_feedback;
USE institute_feedback;

-- Users table (updated with semester and department for students)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL,
  name VARCHAR(100) NOT NULL,
  semester INT,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table (what teachers create - renamed from courses)
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE NOT NULL,
  teacher_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Courses table (what admins create - collection of subjects)
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE NOT NULL,
  semester INT NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Course Subjects junction table (links subjects to courses)
CREATE TABLE IF NOT EXISTS course_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  subject_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_course_subject (course_id, subject_id)
);

-- Enrollments table (students enroll in courses)
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, course_id)
);

-- Feedback Forms table (admin-created forms)
CREATE TABLE IF NOT EXISTS feedback_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Feedback Form Questions table
CREATE TABLE IF NOT EXISTS feedback_form_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('rating', 'text', 'choice') NOT NULL DEFAULT 'rating',
  question_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES feedback_forms(id) ON DELETE CASCADE
);

-- Feedback Responses table (student responses to questions)
CREATE TABLE IF NOT EXISTS feedback_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  form_id INT NOT NULL,
  subject_id INT NOT NULL,
  question_id INT NOT NULL,
  response_value TEXT,
  rating INT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (form_id) REFERENCES feedback_forms(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES feedback_form_questions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_response (student_id, form_id, subject_id, question_id)
);

-- Note: To create an admin user, register through the API endpoint
-- The password will be properly hashed using bcrypt
