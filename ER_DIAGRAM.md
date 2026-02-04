# ER Diagram - Online Institute Feedback System

## Traditional ER Diagram (Chen Notation)

![ER Diagram](C:/Users/jrk25/.gemini/antigravity/brain/0ef7d3b9-4740-4a21-8eae-41865568f9d7/er_diagram_traditional_1764423951280.png)

---

## Entity Descriptions

### 1. USERS
**Description**: Stores all system users (Admin, Teacher, Student)

**Attributes**:
- **USER_ID** (Primary Key) - Unique identifier
- USERNAME - Unique username
- EMAIL - User email address
- PASSWORD - Encrypted password
- ROLE - User role (admin/teacher/student)
- NAME - Full name
- SEMESTER - Student's semester (1-8)
- DEPARTMENT - Student's department

**Participation**: Total participation in CREATES (for teachers), ENROLLS_IN (for students), SUBMITS (for students)

---

### 2. SUBJECTS
**Description**: Individual teaching units created by teachers

**Attributes**:
- **SUBJECT_ID** (Primary Key) - Unique identifier
- TITLE - Subject name
- DESCRIPTION - Subject details
- CODE - Unique subject code
- TEACHER_ID - Foreign key to USERS

**Participation**: Total participation in CREATES relationship with USERS

---

### 3. COURSES
**Description**: Collection of subjects for specific semester and department

**Attributes**:
- **COURSE_ID** (Primary Key) - Unique identifier
- TITLE - Course name
- DESCRIPTION - Course details
- CODE - Unique course code
- SEMESTER - Target semester (1-8)
- DEPARTMENT - Target department

**Participation**: Total participation in CONTAINS relationship

---

### 4. COURSE_SUBJECTS
**Description**: Junction entity linking courses to subjects (Many-to-Many relationship)

**Attributes**:
- **CS_ID** (Primary Key) - Unique identifier
- COURSE_ID - Foreign key to COURSES
- SUBJECT_ID - Foreign key to SUBJECTS

**Participation**: Total participation in both CONTAINS and BELONGS_TO

---

### 5. ENROLLMENTS
**Description**: Student course enrollments

**Attributes**:
- **ENROLLMENT_ID** (Primary Key) - Unique identifier
- STUDENT_ID - Foreign key to USERS
- COURSE_ID - Foreign key to COURSES
- ENROLLED_AT - Enrollment timestamp

**Participation**: Total participation in ENROLLS_IN and HAS_ENROLLMENT

---

### 6. FEEDBACK_FORMS
**Description**: Admin-created feedback forms for courses

**Attributes**:
- **FORM_ID** (Primary Key) - Unique identifier
- COURSE_ID - Foreign key to COURSES
- TITLE - Form title
- DESCRIPTION - Form description
- IS_ACTIVE - Active status (true/false)

**Participation**: Total participation in HAS_FORM relationship

---

### 7. FEEDBACK_FORM_QUESTIONS
**Description**: Questions within feedback forms

**Attributes**:
- **QUESTION_ID** (Primary Key) - Unique identifier
- FORM_ID - Foreign key to FEEDBACK_FORMS
- QUESTION_TEXT - Question content
- QUESTION_TYPE - Type (rating/text/choice)
- QUESTION_ORDER - Display order

**Participation**: Total participation in HAS_QUESTIONS relationship

---

### 8. FEEDBACK_RESPONSES
**Description**: Student responses to feedback questions

**Attributes**:
- **RESPONSE_ID** (Primary Key) - Unique identifier
- STUDENT_ID - Foreign key to USERS
- FORM_ID - Foreign key to FEEDBACK_FORMS
- SUBJECT_ID - Foreign key to SUBJECTS
- QUESTION_ID - Foreign key to FEEDBACK_FORM_QUESTIONS
- RESPONSE_VALUE - Text response
- RATING - Numeric rating (1-5)
- CREATED_AT - Submission timestamp

**Participation**: Total participation in SUBMITS, RECEIVES_RESPONSE, FOR_SUBJECT, ANSWERED_BY

---

## Relationship Descriptions

### 1. CREATES
- **Between**: USERS (Teacher) and SUBJECTS
- **Cardinality**: 1:N (One teacher creates many subjects)
- **Participation**: 
  - USERS (Teacher): Partial (not all users are teachers)
  - SUBJECTS: Total (every subject must be created by a teacher)

---

### 2. ENROLLS_IN
- **Between**: USERS (Student) and ENROLLMENTS
- **Cardinality**: 1:N (One student has many enrollments)
- **Participation**: 
  - USERS (Student): Partial (not all users are students)
  - ENROLLMENTS: Total (every enrollment belongs to a student)

---

### 3. SUBMITS
- **Between**: USERS (Student) and FEEDBACK_RESPONSES
- **Cardinality**: 1:N (One student submits many responses)
- **Participation**: 
  - USERS (Student): Partial (students may not submit feedback)
  - FEEDBACK_RESPONSES: Total (every response is from a student)

---

### 4. BELONGS_TO
- **Between**: SUBJECTS and COURSE_SUBJECTS
- **Cardinality**: N:M (Many subjects belong to many courses via junction)
- **Participation**: 
  - SUBJECTS: Partial (subjects may not be in any course yet)
  - COURSE_SUBJECTS: Total (junction entity must link to a subject)

---

### 5. CONTAINS
- **Between**: COURSES and COURSE_SUBJECTS
- **Cardinality**: 1:N (One course contains many subjects)
- **Participation**: 
  - COURSES: Total (every course must contain subjects)
  - COURSE_SUBJECTS: Total (junction entity must link to a course)

---

### 6. HAS_ENROLLMENT
- **Between**: COURSES and ENROLLMENTS
- **Cardinality**: 1:N (One course has many enrollments)
- **Participation**: 
  - COURSES: Partial (courses may have no enrollments)
  - ENROLLMENTS: Total (every enrollment is for a course)

---

### 7. HAS_FORM
- **Between**: COURSES and FEEDBACK_FORMS
- **Cardinality**: 1:N (One course has many forms)
- **Participation**: 
  - COURSES: Partial (courses may not have forms yet)
  - FEEDBACK_FORMS: Total (every form belongs to a course)

---

### 8. HAS_QUESTIONS
- **Between**: FEEDBACK_FORMS and FEEDBACK_FORM_QUESTIONS
- **Cardinality**: 1:N (One form has many questions)
- **Participation**: 
  - FEEDBACK_FORMS: Total (every form must have questions)
  - FEEDBACK_FORM_QUESTIONS: Total (every question belongs to a form)

---

### 9. RECEIVES_RESPONSE
- **Between**: FEEDBACK_FORMS and FEEDBACK_RESPONSES
- **Cardinality**: 1:N (One form receives many responses)
- **Participation**: 
  - FEEDBACK_FORMS: Partial (forms may not have responses)
  - FEEDBACK_RESPONSES: Total (every response is for a form)

---

### 10. FOR_SUBJECT
- **Between**: SUBJECTS and FEEDBACK_RESPONSES
- **Cardinality**: 1:N (One subject receives many responses)
- **Participation**: 
  - SUBJECTS: Partial (subjects may not have feedback)
  - FEEDBACK_RESPONSES: Total (every response is for a subject)

---

### 11. ANSWERED_BY
- **Between**: FEEDBACK_FORM_QUESTIONS and FEEDBACK_RESPONSES
- **Cardinality**: 1:N (One question has many responses)
- **Participation**: 
  - FEEDBACK_FORM_QUESTIONS: Partial (questions may not be answered)
  - FEEDBACK_RESPONSES: Total (every response answers a question)

---

## Cardinality Summary Table

| Relationship | Entity 1 | Cardinality | Entity 2 | Type |
|--------------|----------|-------------|----------|------|
| CREATES | USERS (Teacher) | 1:N | SUBJECTS | One-to-Many |
| ENROLLS_IN | USERS (Student) | 1:N | ENROLLMENTS | One-to-Many |
| SUBMITS | USERS (Student) | 1:N | FEEDBACK_RESPONSES | One-to-Many |
| BELONGS_TO + CONTAINS | SUBJECTS | N:M | COURSES | Many-to-Many |
| HAS_ENROLLMENT | COURSES | 1:N | ENROLLMENTS | One-to-Many |
| HAS_FORM | COURSES | 1:N | FEEDBACK_FORMS | One-to-Many |
| HAS_QUESTIONS | FEEDBACK_FORMS | 1:N | FEEDBACK_FORM_QUESTIONS | One-to-Many |
| RECEIVES_RESPONSE | FEEDBACK_FORMS | 1:N | FEEDBACK_RESPONSES | One-to-Many |
| FOR_SUBJECT | SUBJECTS | 1:N | FEEDBACK_RESPONSES | One-to-Many |
| ANSWERED_BY | FEEDBACK_FORM_QUESTIONS | 1:N | FEEDBACK_RESPONSES | One-to-Many |

---

## Key Constraints

### Primary Keys
- All entities have unique primary keys (underlined in diagram)
- Primary keys are auto-incrementing integers

### Foreign Keys
- SUBJECTS.TEACHER_ID → USERS.USER_ID
- COURSE_SUBJECTS.COURSE_ID → COURSES.COURSE_ID
- COURSE_SUBJECTS.SUBJECT_ID → SUBJECTS.SUBJECT_ID
- ENROLLMENTS.STUDENT_ID → USERS.USER_ID
- ENROLLMENTS.COURSE_ID → COURSES.COURSE_ID
- FEEDBACK_FORMS.COURSE_ID → COURSES.COURSE_ID
- FEEDBACK_FORM_QUESTIONS.FORM_ID → FEEDBACK_FORMS.FORM_ID
- FEEDBACK_RESPONSES.STUDENT_ID → USERS.USER_ID
- FEEDBACK_RESPONSES.FORM_ID → FEEDBACK_FORMS.FORM_ID
- FEEDBACK_RESPONSES.SUBJECT_ID → SUBJECTS.SUBJECT_ID
- FEEDBACK_RESPONSES.QUESTION_ID → FEEDBACK_FORM_QUESTIONS.QUESTION_ID

### Unique Constraints
- USERS.USERNAME (unique)
- USERS.EMAIL (unique)
- SUBJECTS.CODE (unique)
- COURSES.CODE (unique)
- ENROLLMENTS (STUDENT_ID, COURSE_ID) - composite unique
- COURSE_SUBJECTS (COURSE_ID, SUBJECT_ID) - composite unique
- FEEDBACK_RESPONSES (STUDENT_ID, FORM_ID, SUBJECT_ID, QUESTION_ID) - composite unique

### Check Constraints
- USERS.ROLE ∈ {admin, teacher, student}
- FEEDBACK_FORM_QUESTIONS.QUESTION_TYPE ∈ {rating, text, choice}
- FEEDBACK_RESPONSES.RATING ∈ {1, 2, 3, 4, 5} or NULL

---

## Database Normalization

This ER diagram follows **Third Normal Form (3NF)**:

### 1NF (First Normal Form)
✅ All attributes contain atomic values
✅ No repeating groups

### 2NF (Second Normal Form)
✅ All non-key attributes are fully functionally dependent on primary key
✅ No partial dependencies

### 3NF (Third Normal Form)
✅ No transitive dependencies
✅ All non-key attributes depend only on primary key

---

## Special Design Considerations

### 1. Role-Based User Table
- Single USERS table for all roles (Admin, Teacher, Student)
- SEMESTER and DEPARTMENT are nullable (only for students)
- Simplifies authentication and user management

### 2. Many-to-Many Resolution
- COURSE_SUBJECTS junction table resolves M:N relationship between COURSES and SUBJECTS
- Allows subjects to be reused across multiple courses
- Enables flexible course composition

### 3. Conditional Anonymity
- FEEDBACK_RESPONSES stores STUDENT_ID
- Application layer controls visibility:
  - Teachers: Cannot see STUDENT_ID
  - Admins: Can see STUDENT_ID
- Maintains data integrity while providing privacy

### 4. Composite Unique Constraints
- Prevents duplicate enrollments
- Prevents duplicate feedback submissions
- Ensures data consistency

---

## SQL Schema Mapping

The ER diagram directly maps to the MySQL schema:

```sql
-- Entities become tables
CREATE TABLE users (...);
CREATE TABLE subjects (...);
CREATE TABLE courses (...);
CREATE TABLE course_subjects (...);
CREATE TABLE enrollments (...);
CREATE TABLE feedback_forms (...);
CREATE TABLE feedback_form_questions (...);
CREATE TABLE feedback_responses (...);

-- Relationships become foreign keys
ALTER TABLE subjects 
  ADD FOREIGN KEY (teacher_id) REFERENCES users(id);

ALTER TABLE feedback_responses 
  ADD FOREIGN KEY (student_id) REFERENCES users(id),
  ADD FOREIGN KEY (form_id) REFERENCES feedback_forms(id),
  ADD FOREIGN KEY (subject_id) REFERENCES subjects(id),
  ADD FOREIGN KEY (question_id) REFERENCES feedback_form_questions(id);
```

---

## Advantages of This Design

1. **Scalability**: Can handle unlimited users, courses, and feedback
2. **Flexibility**: Dynamic feedback forms with custom questions
3. **Data Integrity**: Foreign key constraints ensure referential integrity
4. **Normalization**: Eliminates redundancy and update anomalies
5. **Reusability**: Subjects can be reused across multiple courses
6. **Traceability**: Complete audit trail with timestamps
7. **Privacy**: Supports conditional anonymity through application logic

