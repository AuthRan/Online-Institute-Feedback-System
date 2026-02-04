-- Sample Data for Online Institute Feedback System
-- This script populates the database with realistic test data

USE institute_feedback;

-- Clear existing data (optional - comment out if you want to keep existing data)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE feedback_responses;
-- TRUNCATE TABLE feedback_form_questions;
-- TRUNCATE TABLE feedback_forms;
-- TRUNCATE TABLE enrollments;
-- TRUNCATE TABLE course_subjects;
-- TRUNCATE TABLE courses;
-- TRUNCATE TABLE subjects;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- Insert Admin Users
INSERT INTO users (username, email, password, role, name, semester, department) VALUES
('admin1', 'admin1@gmail.com', '$2a$10$YourHashedPasswordHere1', 'admin', 'Dr. Rajesh Kumar', NULL, NULL),
('admin2', 'admin2@gmail.com', '$2a$10$YourHashedPasswordHere2', 'admin', 'Prof. Priya Sharma', NULL, NULL);

-- Insert Teacher Users
INSERT INTO users (username, email, password, role, name, semester, department) VALUES
('teacher1', 'teacher1@gmail.com', '$2a$10$YourHashedPasswordHere3', 'teacher', 'Dr. Amit Verma', NULL, NULL),
('teacher2', 'teacher2@gmail.com', '$2a$10$YourHashedPasswordHere4', 'teacher', 'Prof. Sneha Patel', NULL, NULL),
('teacher3', 'teacher3@gmail.com', '$2a$10$YourHashedPasswordHere5', 'teacher', 'Dr. Rahul Gupta', NULL, NULL),
('teacher4', 'teacher4@gmail.com', '$2a$10$YourHashedPasswordHere6', 'teacher', 'Prof. Kavita Singh', NULL, NULL),
('teacher5', 'teacher5@gmail.com', '$2a$10$YourHashedPasswordHere7', 'teacher', 'Dr. Vikram Mehta', NULL, NULL),
('teacher6', 'teacher6@gmail.com', '$2a$10$YourHashedPasswordHere8', 'teacher', 'Prof. Anjali Desai', NULL, NULL),
('teacher7', 'teacher7@gmail.com', '$2a$10$YourHashedPasswordHere9', 'teacher', 'Dr. Suresh Reddy', NULL, NULL);

-- Insert Student Users (Different Semesters and Departments)
INSERT INTO users (username, email, password, role, name, semester, department) VALUES
-- Semester 1 - Computer Science
('student1', 'student1@gmail.com', '$2a$10$YourHashedPasswordHere10', 'student', 'Arjun Sharma', 1, 'Computer Science'),
('student2', 'student2@gmail.com', '$2a$10$YourHashedPasswordHere11', 'student', 'Priya Nair', 1, 'Computer Science'),
('student3', 'student3@gmail.com', '$2a$10$YourHashedPasswordHere12', 'student', 'Rohan Kapoor', 1, 'Computer Science'),

-- Semester 2 - Computer Science
('student4', 'student4@gmail.com', '$2a$10$YourHashedPasswordHere13', 'student', 'Sneha Iyer', 2, 'Computer Science'),
('student5', 'student5@gmail.com', '$2a$10$YourHashedPasswordHere14', 'student', 'Karan Malhotra', 2, 'Computer Science'),
('student6', 'student6@gmail.com', '$2a$10$YourHashedPasswordHere15', 'student', 'Ananya Rao', 2, 'Computer Science'),

-- Semester 3 - Computer Science
('student7', 'student7@gmail.com', '$2a$10$YourHashedPasswordHere16', 'student', 'Aditya Joshi', 3, 'Computer Science'),
('student8', 'student8@gmail.com', '$2a$10$YourHashedPasswordHere17', 'student', 'Ishita Bansal', 3, 'Computer Science'),

-- Semester 1 - Electronics
('student9', 'student9@gmail.com', '$2a$10$YourHashedPasswordHere18', 'student', 'Varun Choudhary', 1, 'Electronics'),
('student10', 'student10@gmail.com', '$2a$10$YourHashedPasswordHere19', 'student', 'Divya Menon', 1, 'Electronics'),

-- Semester 2 - Electronics
('student11', 'student11@gmail.com', '$2a$10$YourHashedPasswordHere20', 'student', 'Nikhil Agarwal', 2, 'Electronics'),
('student12', 'student12@gmail.com', '$2a$10$YourHashedPasswordHere21', 'student', 'Riya Khanna', 2, 'Electronics'),

-- Semester 1 - Mechanical
('student13', 'student13@gmail.com', '$2a$10$YourHashedPasswordHere22', 'student', 'Siddharth Pillai', 1, 'Mechanical'),
('student14', 'student14@gmail.com', '$2a$10$YourHashedPasswordHere23', 'student', 'Pooja Saxena', 1, 'Mechanical'),
('student15', 'student15@gmail.com', '$2a$10$YourHashedPasswordHere24', 'student', 'Harsh Tiwari', 1, 'Mechanical');

-- Insert Subjects (Created by Teachers)
INSERT INTO subjects (title, description, code, teacher_id) VALUES
-- Teacher 1 subjects
('Data Structures', 'Fundamental data structures and algorithms', 'CS201', 3),
('Database Management Systems', 'Relational databases and SQL', 'CS301', 3),

-- Teacher 2 subjects
('Web Development', 'HTML, CSS, JavaScript, and modern frameworks', 'CS202', 4),
('Computer Networks', 'Network protocols and architecture', 'CS302', 4),

-- Teacher 3 subjects
('Operating Systems', 'OS concepts and system programming', 'CS203', 5),
('Software Engineering', 'Software development lifecycle and methodologies', 'CS303', 5),

-- Teacher 4 subjects
('Digital Electronics', 'Logic gates and digital circuits', 'EC101', 6),
('Microprocessors', '8086 and ARM architecture', 'EC201', 6),

-- Teacher 5 subjects
('Engineering Mechanics', 'Statics and dynamics', 'ME101', 7),
('Thermodynamics', 'Heat and energy transfer', 'ME201', 7),

-- Teacher 6 subjects
('Python Programming', 'Introduction to Python', 'CS101', 8),
('Machine Learning', 'ML algorithms and applications', 'CS401', 8),

-- Teacher 7 subjects
('Signals and Systems', 'Signal processing fundamentals', 'EC202', 9),
('Control Systems', 'Feedback control theory', 'ME301', 9);

-- Insert Courses (Created by Admins)
INSERT INTO courses (title, description, code, semester, department) VALUES
-- Computer Science Courses
('Semester 1 - Computer Science', 'First semester core subjects for CS', 'CS-SEM1', 1, 'Computer Science'),
('Semester 2 - Computer Science', 'Second semester core subjects for CS', 'CS-SEM2', 2, 'Computer Science'),
('Semester 3 - Computer Science', 'Third semester core subjects for CS', 'CS-SEM3', 3, 'Computer Science'),

-- Electronics Courses
('Semester 1 - Electronics', 'First semester core subjects for EC', 'EC-SEM1', 1, 'Electronics'),
('Semester 2 - Electronics', 'Second semester core subjects for EC', 'EC-SEM2', 2, 'Electronics'),

-- Mechanical Courses
('Semester 1 - Mechanical', 'First semester core subjects for ME', 'ME-SEM1', 1, 'Mechanical'),
('Semester 2 - Mechanical', 'Second semester core subjects for ME', 'ME-SEM2', 2, 'Mechanical');

-- Link Subjects to Courses
INSERT INTO course_subjects (course_id, subject_id) VALUES
-- CS Semester 1
(1, 11), -- Python Programming
(1, 1),  -- Data Structures

-- CS Semester 2
(2, 3),  -- Web Development
(2, 5),  -- Operating Systems

-- CS Semester 3
(3, 2),  -- Database Management Systems
(3, 4),  -- Computer Networks
(3, 6),  -- Software Engineering

-- EC Semester 1
(4, 7),  -- Digital Electronics

-- EC Semester 2
(5, 8),  -- Microprocessors
(5, 13), -- Signals and Systems

-- ME Semester 1
(6, 9),  -- Engineering Mechanics

-- ME Semester 2
(7, 10); -- Thermodynamics

-- Insert Enrollments
INSERT INTO enrollments (student_id, course_id) VALUES
-- CS Semester 1 students
(3, 1), (4, 1), (5, 1),  -- student1, student2, student3

-- CS Semester 2 students
(6, 2), (7, 2), (8, 2),  -- student4, student5, student6

-- CS Semester 3 students
(9, 3), (10, 3),  -- student7, student8

-- EC Semester 1 students
(11, 4), (12, 4),  -- student9, student10

-- EC Semester 2 students
(13, 5), (14, 5),  -- student11, student12

-- ME Semester 1 students
(15, 6), (16, 6), (17, 6);  -- student13, student14, student15

-- Insert Feedback Forms
INSERT INTO feedback_forms (course_id, title, description, is_active) VALUES
(1, 'Mid-Semester Feedback - CS Sem 1', 'Feedback for first semester CS subjects', TRUE),
(2, 'Mid-Semester Feedback - CS Sem 2', 'Feedback for second semester CS subjects', TRUE),
(3, 'End-Semester Feedback - CS Sem 3', 'Final feedback for third semester CS subjects', TRUE),
(4, 'Mid-Semester Feedback - EC Sem 1', 'Feedback for first semester EC subjects', TRUE),
(5, 'Mid-Semester Feedback - EC Sem 2', 'Feedback for second semester EC subjects', TRUE);

-- Insert Feedback Form Questions
INSERT INTO feedback_form_questions (form_id, question_text, question_type, question_order) VALUES
-- Form 1 questions
(1, 'How would you rate the teaching quality?', 'rating', 0),
(1, 'How clear were the explanations?', 'rating', 1),
(1, 'Were the course materials helpful?', 'rating', 2),
(1, 'What did you like most about this subject?', 'text', 3),
(1, 'Any suggestions for improvement?', 'text', 4),

-- Form 2 questions
(2, 'Rate the overall teaching effectiveness', 'rating', 0),
(2, 'How engaging were the lectures?', 'rating', 1),
(2, 'Were practical sessions useful?', 'rating', 2),
(2, 'Additional comments', 'text', 3),

-- Form 3 questions
(3, 'Overall subject satisfaction', 'rating', 0),
(3, 'Quality of assignments and projects', 'rating', 1),
(3, 'Teacher availability for doubts', 'rating', 2),
(3, 'Your feedback and suggestions', 'text', 3),

-- Form 4 questions
(4, 'Teaching quality rating', 'rating', 0),
(4, 'Lab sessions effectiveness', 'rating', 1),
(4, 'Comments', 'text', 2),

-- Form 5 questions
(5, 'Overall course rating', 'rating', 0),
(5, 'Practical knowledge gained', 'rating', 1),
(5, 'Suggestions', 'text', 2);

-- Insert Sample Feedback Responses
INSERT INTO feedback_responses (student_id, form_id, subject_id, question_id, rating, response_value) VALUES
-- Student 1 feedback for Python Programming
(3, 1, 11, 1, 5, NULL),
(3, 1, 11, 2, 4, NULL),
(3, 1, 11, 3, 5, NULL),
(3, 1, 11, 4, NULL, 'The hands-on coding exercises were excellent!'),
(3, 1, 11, 5, NULL, 'More advanced topics would be great'),

-- Student 1 feedback for Data Structures
(3, 1, 1, 1, 4, NULL),
(3, 1, 1, 2, 4, NULL),
(3, 1, 1, 3, 3, NULL),
(3, 1, 1, 4, NULL, 'Good coverage of fundamental concepts'),
(3, 1, 1, 5, NULL, 'Need more practice problems'),

-- Student 2 feedback for Python Programming
(4, 1, 11, 1, 5, NULL),
(4, 1, 11, 2, 5, NULL),
(4, 1, 11, 3, 4, NULL),
(4, 1, 11, 4, NULL, 'Very interactive and engaging classes'),
(4, 1, 11, 5, NULL, 'Everything was perfect!'),

-- Student 4 feedback for Web Development
(6, 2, 3, 6, 5, NULL),
(6, 2, 3, 7, 5, NULL),
(6, 2, 3, 8, 4, NULL),
(6, 2, 3, 9, NULL, 'Loved the project-based learning approach'),

-- Student 5 feedback for Operating Systems
(7, 2, 5, 6, 4, NULL),
(7, 2, 5, 7, 3, NULL),
(7, 2, 5, 8, 4, NULL),
(7, 2, 5, 9, NULL, 'Complex topics but well explained'),

-- Student 7 feedback for DBMS
(9, 3, 2, 10, 5, NULL),
(9, 3, 2, 11, 5, NULL),
(9, 3, 2, 12, 5, NULL),
(9, 3, 2, 13, NULL, 'Excellent practical sessions with real databases'),

-- Student 9 feedback for Digital Electronics
(11, 4, 7, 14, 4, NULL),
(11, 4, 7, 15, 4, NULL),
(11, 4, 7, 16, NULL, 'Good lab equipment and experiments');

-- Display summary
SELECT 'Sample data inserted successfully!' as Status;
SELECT COUNT(*) as Total_Users FROM users;
SELECT COUNT(*) as Total_Subjects FROM subjects;
SELECT COUNT(*) as Total_Courses FROM courses;
SELECT COUNT(*) as Total_Enrollments FROM enrollments;
SELECT COUNT(*) as Total_Feedback_Forms FROM feedback_forms;
SELECT COUNT(*) as Total_Feedback_Responses FROM feedback_responses;
