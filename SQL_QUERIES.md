# SQL QUERIES - Online Institute Feedback System

This document contains all the important SQL queries used in the Online Institute Feedback System, organized by functionality.

---

## 1. AUTHENTICATION QUERIES

### 1.1 User Registration
```sql
-- Check if user already exists
SELECT * FROM users 
WHERE email = ? OR username = ?;

-- Insert new user
INSERT INTO users (username, email, password, role, name, semester, department) 
VALUES (?, ?, ?, ?, ?, ?, ?);
```

**Purpose**: Register new users with role-based information. Students must provide semester and department.

---

### 1.2 User Login
```sql
-- Verify user credentials
SELECT * FROM users 
WHERE email = ?;
```

**Purpose**: Fetch user details for authentication. Password verification happens in the application layer using bcrypt.

---

### 1.3 Get Current User
```sql
-- Fetch user profile
SELECT id, username, email, role, name, semester, department 
FROM users 
WHERE id = ?;
```

**Purpose**: Retrieve logged-in user's information based on JWT token.

---

## 2. SUBJECT MANAGEMENT QUERIES

### 2.1 Get All Subjects with Teacher Names
```sql
-- Fetch all subjects with teacher information
SELECT s.*, u.name as teacher_name 
FROM subjects s 
LEFT JOIN users u ON s.teacher_id = u.id
ORDER BY s.created_at DESC;
```

**Purpose**: Display all subjects along with the teacher who created them. Uses LEFT JOIN to handle cases where teacher might be deleted.

---

### 2.2 Get Subject by ID
```sql
-- Fetch specific subject details
SELECT s.*, u.name as teacher_name 
FROM subjects s 
LEFT JOIN users u ON s.teacher_id = u.id
WHERE s.id = ?;
```

**Purpose**: Retrieve detailed information about a specific subject.

---

### 2.3 Create Subject
```sql
-- Insert new subject
INSERT INTO subjects (title, description, code, teacher_id) 
VALUES (?, ?, ?, ?);
```

**Purpose**: Teachers create new subjects they teach. The teacher_id is automatically set from the logged-in user.

---

### 2.4 Update Subject
```sql
-- Check ownership
SELECT * FROM subjects WHERE id = ?;

-- Update subject details
UPDATE subjects 
SET title = ?, description = ?, code = ? 
WHERE id = ?;
```

**Purpose**: Teachers can update their own subjects. Ownership verification happens before update.

---

### 2.5 Delete Subject
```sql
-- Delete subject
DELETE FROM subjects WHERE id = ?;
```

**Purpose**: Remove subject from system. CASCADE delete ensures related course_subjects and feedback_responses are also deleted.

---

### 2.6 Get Subjects for a Teacher
```sql
-- Fetch teacher's subjects
SELECT s.*, u.name as teacher_name 
FROM subjects s 
LEFT JOIN users u ON s.teacher_id = u.id
WHERE s.teacher_id = ?
ORDER BY s.created_at DESC;
```

**Purpose**: Display all subjects created by a specific teacher.

---

## 3. COURSE MANAGEMENT QUERIES

### 3.1 Get All Courses (Filtered for Students)
```sql
-- For students: filter by semester and department
SELECT c.*, 
  GROUP_CONCAT(DISTINCT s.id) as subject_ids,
  GROUP_CONCAT(DISTINCT s.title) as subject_titles
FROM courses c
LEFT JOIN course_subjects cs ON c.id = cs.course_id
LEFT JOIN subjects s ON cs.subject_id = s.id
WHERE c.semester = ? AND c.department = ?
GROUP BY c.id 
ORDER BY c.created_at DESC;

-- For admins/teachers: no filter
SELECT c.*, 
  GROUP_CONCAT(DISTINCT s.id) as subject_ids,
  GROUP_CONCAT(DISTINCT s.title) as subject_titles
FROM courses c
LEFT JOIN course_subjects cs ON c.id = cs.course_id
LEFT JOIN subjects s ON cs.subject_id = s.id
GROUP BY c.id 
ORDER BY c.created_at DESC;
```

**Purpose**: Students see only courses matching their semester/department. Uses GROUP_CONCAT to aggregate subject IDs and titles.

---

### 3.2 Get Course Subjects with Teacher Names
```sql
-- Fetch subjects for a specific course
SELECT s.*, u.name as teacher_name
FROM course_subjects cs
JOIN subjects s ON cs.subject_id = s.id
LEFT JOIN users u ON s.teacher_id = u.id
WHERE cs.course_id = ?
ORDER BY s.created_at;
```

**Purpose**: Display all subjects within a course along with teacher information.

---

### 3.3 Create Course
```sql
-- Insert course
INSERT INTO courses (title, description, code, semester, department) 
VALUES (?, ?, ?, ?, ?);

-- Link subjects to course
INSERT INTO course_subjects (course_id, subject_id) 
VALUES (?, ?);
```

**Purpose**: Admins create courses and link multiple subjects to them. The second query runs in a loop for each subject.

---

### 3.4 Update Course
```sql
-- Update course details
UPDATE courses 
SET title = ?, description = ?, code = ?, semester = ?, department = ? 
WHERE id = ?;

-- Update course-subject associations
DELETE FROM course_subjects WHERE course_id = ?;
INSERT INTO course_subjects (course_id, subject_id) VALUES (?, ?);
```

**Purpose**: Update course information and re-associate subjects. Old associations are deleted and new ones inserted.

---

### 3.5 Delete Course
```sql
-- Delete course
DELETE FROM courses WHERE id = ?;
```

**Purpose**: Remove course. CASCADE delete removes related enrollments, course_subjects, and feedback_forms.

---

### 3.6 Get Student's Enrolled Courses
```sql
-- Fetch enrolled courses with enrollment date
SELECT c.*, e.enrolled_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE e.student_id = ? AND c.semester = ? AND c.department = ?
ORDER BY e.enrolled_at DESC;
```

**Purpose**: Show courses a student is currently enrolled in, with enrollment timestamp.

---

## 4. ENROLLMENT QUERIES

### 4.1 Check and Create Enrollment
```sql
-- Verify course exists and matches student's semester/department
SELECT * FROM courses WHERE id = ?;

-- Check if already enrolled
SELECT * FROM enrollments 
WHERE student_id = ? AND course_id = ?;

-- Create enrollment
INSERT INTO enrollments (student_id, course_id) 
VALUES (?, ?);
```

**Purpose**: Students enroll in courses. Validates course exists, matches student's semester/department, and prevents duplicate enrollments.

---

### 4.2 Unenroll from Course
```sql
-- Remove enrollment
DELETE FROM enrollments 
WHERE student_id = ? AND course_id = ?;
```

**Purpose**: Students can unenroll from courses they no longer want to take.

---

## 5. FEEDBACK FORM QUERIES

### 5.1 Get Feedback Forms for a Course
```sql
-- Fetch all forms for a course
SELECT * FROM feedback_forms 
WHERE course_id = ? 
ORDER BY created_at DESC;

-- Get questions for each form
SELECT * FROM feedback_form_questions 
WHERE form_id = ? 
ORDER BY question_order ASC;
```

**Purpose**: Display all feedback forms created for a course, along with their questions.

---

### 5.2 Get Active Feedback Form
```sql
-- Verify student enrollment
SELECT * FROM enrollments 
WHERE student_id = ? AND course_id = ?;

-- Fetch active form
SELECT * FROM feedback_forms 
WHERE course_id = ? AND is_active = TRUE 
ORDER BY created_at DESC 
LIMIT 1;

-- Get form questions
SELECT * FROM feedback_form_questions 
WHERE form_id = ? 
ORDER BY question_order ASC;
```

**Purpose**: Students get the currently active feedback form for a course. Verifies enrollment before allowing access.

---

### 5.3 Create Feedback Form
```sql
-- Create form
INSERT INTO feedback_forms (course_id, title, description) 
VALUES (?, ?, ?);

-- Add questions
INSERT INTO feedback_form_questions 
  (form_id, question_text, question_type, question_order, options) 
VALUES (?, ?, ?, ?, ?);
```

**Purpose**: Admins create custom feedback forms with multiple questions. Questions are inserted in a loop.

---

### 5.4 Update Feedback Form
```sql
-- Update form metadata
UPDATE feedback_forms 
SET title = ?, description = ?, is_active = ? 
WHERE id = ?;

-- Replace questions
DELETE FROM feedback_form_questions WHERE form_id = ?;
INSERT INTO feedback_form_questions 
  (form_id, question_text, question_type, question_order, options) 
VALUES (?, ?, ?, ?, ?);
```

**Purpose**: Modify form details and questions. Old questions are deleted and new ones inserted.

---

### 5.5 Delete Feedback Form
```sql
-- Delete form
DELETE FROM feedback_forms WHERE id = ?;
```

**Purpose**: Remove feedback form. CASCADE delete removes associated questions and responses.

---

## 6. FEEDBACK SUBMISSION QUERIES

### 6.1 Submit Feedback
```sql
-- Verify form is active
SELECT * FROM feedback_forms 
WHERE id = ? AND is_active = TRUE;

-- Verify student enrollment
SELECT * FROM enrollments 
WHERE student_id = ? AND course_id = ?;

-- Verify subject belongs to course
SELECT * FROM course_subjects 
WHERE course_id = ? AND subject_id = ?;

-- Delete existing responses (for updates)
DELETE FROM feedback_responses 
WHERE student_id = ? AND form_id = ? AND subject_id = ?;

-- Insert new responses
INSERT INTO feedback_responses 
  (student_id, form_id, subject_id, question_id, rating, response_value) 
VALUES (?, ?, ?, ?, ?, ?);
```

**Purpose**: Students submit feedback for subjects. Validates enrollment, active form, and subject-course relationship. Allows updates by deleting old responses.

---

## 7. FEEDBACK VIEWING QUERIES

### 7.1 Get Feedback for a Subject (Teacher - Anonymous)
```sql
-- Fetch anonymous feedback for teachers
SELECT 
  fr.form_id,
  fr.subject_id,
  fq.id as question_id,
  fq.question_text,
  fq.question_type,
  fr.rating,
  fr.response_value,
  fr.created_at,
  s.title as subject_title,
  ff.title as form_title
FROM feedback_responses fr
JOIN feedback_form_questions fq ON fr.question_id = fq.id
JOIN subjects s ON fr.subject_id = s.id
JOIN feedback_forms ff ON fr.form_id = ff.id
WHERE fr.subject_id = ?
ORDER BY fr.created_at DESC;
```

**Purpose**: Teachers view feedback for their subjects WITHOUT student names (conditional anonymity).

---

### 7.2 Get Feedback for a Subject (Admin - With Names)
```sql
-- Fetch feedback with student names for admins
SELECT 
  fr.form_id,
  fr.subject_id,
  u.name as student_name,
  u.id as student_id,
  fq.id as question_id,
  fq.question_text,
  fq.question_type,
  fr.rating,
  fr.response_value,
  fr.created_at,
  s.title as subject_title,
  ff.title as form_title
FROM feedback_responses fr
JOIN feedback_form_questions fq ON fr.question_id = fq.id
JOIN subjects s ON fr.subject_id = s.id
JOIN feedback_forms ff ON fr.form_id = ff.id
JOIN users u ON fr.student_id = u.id
WHERE fr.subject_id = ?
ORDER BY fr.created_at DESC;
```

**Purpose**: Admins view feedback WITH student names for accountability.

---

### 7.3 Get All Feedback (Admin Only)
```sql
-- Fetch all feedback across the system
SELECT 
  fr.*,
  u.name as student_name,
  s.title as subject_title,
  s.teacher_id,
  t.name as teacher_name,
  ff.title as form_title,
  c.title as course_title,
  fq.question_text,
  fq.question_type
FROM feedback_responses fr
JOIN users u ON fr.student_id = u.id
JOIN subjects s ON fr.subject_id = s.id
JOIN users t ON s.teacher_id = t.id
JOIN feedback_forms ff ON fr.form_id = ff.id
JOIN courses c ON ff.course_id = c.id
JOIN feedback_form_questions fq ON fr.question_id = fq.id
ORDER BY fr.created_at DESC;
```

**Purpose**: Admins get a comprehensive view of all feedback with complete context (student, teacher, course, subject).

---

### 7.4 Get Student's Own Feedback
```sql
-- Fetch student's submitted feedback
SELECT 
  fr.*,
  s.title as subject_title,
  s.code as subject_code,
  t.name as teacher_name,
  ff.title as form_title,
  fq.question_text,
  fq.question_type,
  c.title as course_title,
  c.code as course_code
FROM feedback_responses fr
JOIN subjects s ON fr.subject_id = s.id
JOIN users t ON s.teacher_id = t.id
JOIN feedback_forms ff ON fr.form_id = ff.id
JOIN courses c ON ff.course_id = c.id
JOIN feedback_form_questions fq ON fr.question_id = fq.id
WHERE fr.student_id = ?
ORDER BY fr.created_at DESC;
```

**Purpose**: Students view their own submitted feedback history.

---

## 8. ANALYTICS QUERIES

### 8.1 Get Subject Statistics
```sql
-- Calculate feedback statistics for a subject
SELECT 
  COUNT(DISTINCT fr.student_id) as total_responses,
  COUNT(fr.id) as total_answers,
  AVG(CASE WHEN fr.rating IS NOT NULL THEN fr.rating END) as average_rating,
  SUM(CASE WHEN fr.rating = 5 THEN 1 ELSE 0 END) as rating_5,
  SUM(CASE WHEN fr.rating = 4 THEN 1 ELSE 0 END) as rating_4,
  SUM(CASE WHEN fr.rating = 3 THEN 1 ELSE 0 END) as rating_3,
  SUM(CASE WHEN fr.rating = 2 THEN 1 ELSE 0 END) as rating_2,
  SUM(CASE WHEN fr.rating = 1 THEN 1 ELSE 0 END) as rating_1
FROM feedback_responses fr
JOIN feedback_form_questions fq ON fr.question_id = fq.id
WHERE fr.subject_id = ? AND fq.question_type = 'rating';
```

**Purpose**: Generate statistical analysis of feedback for a subject - average rating, distribution, and response count.

---

## 9. USER MANAGEMENT QUERIES (Admin)

### 9.1 Get All Users
```sql
-- Fetch all system users
SELECT id, username, email, role, name, semester, department, created_at 
FROM users 
ORDER BY created_at DESC;
```

**Purpose**: Admins view all registered users.

---

### 9.2 Create User (Admin)
```sql
-- Admin creates user account
INSERT INTO users (username, email, password, role, name, semester, department) 
VALUES (?, ?, ?, ?, ?, ?, ?);
```

**Purpose**: Admins can create user accounts directly (useful for bulk registration).

---

### 9.3 Update User
```sql
-- Update user details
UPDATE users 
SET username = ?, email = ?, role = ?, name = ?, semester = ?, department = ? 
WHERE id = ?;
```

**Purpose**: Admins modify user information.

---

### 9.4 Delete User
```sql
-- Delete user account
DELETE FROM users WHERE id = ?;
```

**Purpose**: Remove user from system. CASCADE delete removes related subjects, enrollments, and feedback.

---

## 10. ADVANCED QUERIES

### 10.1 Get Courses with Subject Count
```sql
-- Count subjects in each course
SELECT 
  c.*,
  COUNT(cs.subject_id) as subject_count
FROM courses c
LEFT JOIN course_subjects cs ON c.id = cs.course_id
GROUP BY c.id
ORDER BY c.created_at DESC;
```

**Purpose**: Display courses with the number of subjects they contain.

---

### 10.2 Get Teacher's Subjects with Feedback Count
```sql
-- Count feedback responses for each subject
SELECT 
  s.*,
  COUNT(DISTINCT fr.student_id) as feedback_count
FROM subjects s
LEFT JOIN feedback_responses fr ON s.id = fr.subject_id
WHERE s.teacher_id = ?
GROUP BY s.id
ORDER BY s.created_at DESC;
```

**Purpose**: Show teacher's subjects with how many students have submitted feedback.

---

### 10.3 Get Popular Courses (Most Enrollments)
```sql
-- Rank courses by enrollment count
SELECT 
  c.*,
  COUNT(e.id) as enrollment_count
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id
ORDER BY enrollment_count DESC
LIMIT 10;
```

**Purpose**: Identify most popular courses based on enrollment numbers.

---

### 10.4 Get Response Rate by Course
```sql
-- Calculate feedback response rate
SELECT 
  c.title as course_title,
  COUNT(DISTINCT e.student_id) as enrolled_students,
  COUNT(DISTINCT fr.student_id) as responded_students,
  (COUNT(DISTINCT fr.student_id) * 100.0 / COUNT(DISTINCT e.student_id)) as response_rate
FROM courses c
JOIN enrollments e ON c.id = e.course_id
LEFT JOIN feedback_forms ff ON c.id = ff.course_id
LEFT JOIN feedback_responses fr ON ff.id = fr.form_id
GROUP BY c.id
ORDER BY response_rate DESC;
```

**Purpose**: Measure student engagement by calculating what percentage of enrolled students submitted feedback.

---

## QUERY OPTIMIZATION TECHNIQUES USED

1. **Indexes**: Primary keys and foreign keys are automatically indexed
2. **JOIN Optimization**: Uses appropriate JOIN types (INNER, LEFT) based on requirements
3. **GROUP_CONCAT**: Aggregates related data to reduce multiple queries
4. **LIMIT Clauses**: Restricts result sets where appropriate
5. **Prepared Statements**: All queries use parameterized queries (?) to prevent SQL injection
6. **Conditional Queries**: Dynamic WHERE clauses based on user role
7. **CASCADE Deletes**: Foreign key constraints handle related data deletion automatically

---

## SECURITY MEASURES

1. **Parameterized Queries**: All user inputs are passed as parameters, not concatenated
2. **Password Hashing**: Passwords are hashed using bcrypt before storage
3. **Role-Based Filtering**: Queries include role checks to ensure data access control
4. **Unique Constraints**: Prevent duplicate usernames, emails, and codes
5. **Foreign Key Constraints**: Maintain referential integrity
6. **Composite Unique Keys**: Prevent duplicate enrollments and feedback submissions

---

## TRANSACTION EXAMPLES

### Creating Course with Subjects (Atomic Operation)
```sql
START TRANSACTION;

INSERT INTO courses (title, description, code, semester, department) 
VALUES (?, ?, ?, ?, ?);

SET @course_id = LAST_INSERT_ID();

INSERT INTO course_subjects (course_id, subject_id) VALUES (@course_id, ?);
INSERT INTO course_subjects (course_id, subject_id) VALUES (@course_id, ?);
INSERT INTO course_subjects (course_id, subject_id) VALUES (@course_id, ?);

COMMIT;
```

**Purpose**: Ensures course and its subject associations are created together or not at all.

---

This comprehensive collection of SQL queries demonstrates the database operations powering the Online Institute Feedback System, showcasing proper use of JOINs, aggregations, conditional logic, and security best practices.
