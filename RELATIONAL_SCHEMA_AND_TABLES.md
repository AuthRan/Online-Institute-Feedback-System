# RELATIONAL SCHEMA AND TABLE STRUCTURES
## Online Institute Feedback System

---

## RELATIONAL SCHEMA

• **Users** (<u>user_id</u>, username, email, password, role, name, semester, department)

• **Subjects** (<u>subject_id</u>, title, description, code, teacher_id)
  - Foreign Key: teacher_id → Users(user_id)

• **Courses** (<u>course_id</u>, title, description, code, semester, department)

• **Course_Subjects** (<u>cs_id</u>, course_id, subject_id)
  - Foreign Key: course_id → Courses(course_id)
  - Foreign Key: subject_id → Subjects(subject_id)

• **Enrollments** (<u>enrollment_id</u>, student_id, course_id, enrolled_at)
  - Foreign Key: student_id → Users(user_id)
  - Foreign Key: course_id → Courses(course_id)

• **Feedback_Forms** (<u>form_id</u>, course_id, title, description, is_active)
  - Foreign Key: course_id → Courses(course_id)

• **Feedback_Form_Questions** (<u>question_id</u>, form_id, question_text, question_type, question_order)
  - Foreign Key: form_id → Feedback_Forms(form_id)

• **Feedback_Responses** (<u>response_id</u>, student_id, form_id, subject_id, question_id, response_value, rating)
  - Foreign Key: student_id → Users(user_id)
  - Foreign Key: form_id → Feedback_Forms(form_id)
  - Foreign Key: subject_id → Subjects(subject_id)
  - Foreign Key: question_id → Feedback_Form_Questions(question_id)

---

## TABLE STRUCTURES

### Table 4.1 (a): users

| Serial No. | Column Name | Data-type | Length/Values |
|------------|-------------|-----------|---------------|
| 1 | user_id (PK) | INT | 255 |
| 2 | username | VARCHAR | 50 |
| 3 | email | VARCHAR | 100 |
| 4 | password | VARCHAR | 255 |
| 5 | role | ENUM | admin, teacher, student |
| 6 | name | VARCHAR | 100 |
| 7 | semester | INT | 255 |
| 8 | department | VARCHAR | 100 |
| 9 | created_at | TIMESTAMP | - |
| 10 | updated_at | TIMESTAMP | - |

---

### Table 4.1 (b): subjects

| Serial No. | Column Name | Data-type | Length/Values |
|------------|-------------|-----------|---------------|
| 1 | subject_id (PK) | INT | 255 |
| 2 | title | VARCHAR | 200 |
| 3 | description | TEXT | - |
| 4 | code | VARCHAR | 50 |
| 5 | teacher_id (FK) | INT | 255 |
| 6 | created_at | TIMESTAMP | - |
| 7 | updated_at | TIMESTAMP | - |

---

### Table 4.1 (c): courses

| Serial No. | Column Name | Data-type | Length/Values |
|------------|-------------|-----------|---------------|
| 1 | course_id (PK) | INT | 255 |
| 2 | title | VARCHAR | 200 |
| 3 | description | TEXT | - |
| 4 | code | VARCHAR | 50 |
| 5 | semester | INT | 255 |
| 6 | department | VARCHAR | 100 |
| 7 | created_at | TIMESTAMP | - |
| 8 | updated_at | TIMESTAMP | - |

---

### Table 4.1 (d): course_subjects

| Serial No. | Column Name | Data-type | Length/Values |
|------------|-------------|-----------|---------------|
| 1 | cs_id (PK) | INT | 255 |
| 2 | course_id (FK) | INT | 255 |
| 3 | subject_id (FK) | INT | 255 |
| 4 | created_at | TIMESTAMP | - |

---

### Table 4.1 (e): enrollments

| Serial No. | Column Name | Data-type | Length/Values |
|------------|-------------|-----------|---------------|
| 1 | enrollment_id (PK) | INT | 255 |
| 2 | student_id (FK) | INT | 255 |
| 3 | course_id (FK) | INT | 255 |
| 4 | enrolled_at | TIMESTAMP | - |

---

### Table 4.1 (f): feedback_forms

| Serial No. | Column Name | Data-type | Length/Values |
|------------|-------------|-----------|---------------|
| 1 | form_id (PK) | INT | 255 |
| 2 | course_id (FK) | INT | 255 |
| 3 | title | VARCHAR | 200 |
| 4 | description | TEXT | - |
| 5 | is_active | BOOLEAN | true/false |
| 6 | created_at | TIMESTAMP | - |
| 7 | updated_at | TIMESTAMP | - |

---

### Table 4.1 (g): feedback_form_questions

| Serial No. | Column Name | Data-type | Length/Values |
|------------|-------------|-----------|---------------|
| 1 | question_id (PK) | INT | 255 |
| 2 | form_id (FK) | INT | 255 |
| 3 | question_text | TEXT | - |
| 4 | question_type | ENUM | rating, text, choice |
| 5 | question_order | INT | 255 |
| 6 | created_at | TIMESTAMP | - |

---

### Table 4.1 (h): feedback_responses

| Serial No. | Column Name | Data-type | Length/Values |
|------------|-------------|-----------|---------------|
| 1 | response_id (PK) | INT | 255 |
| 2 | student_id (FK) | INT | 255 |
| 3 | form_id (FK) | INT | 255 |
| 4 | subject_id (FK) | INT | 255 |
| 5 | question_id (FK) | INT | 255 |
| 6 | response_value | TEXT | - |
| 7 | rating | INT | 1-5 |
| 8 | created_at | TIMESTAMP | - |
| 9 | updated_at | TIMESTAMP | - |

---

## KEY CONSTRAINTS

### Primary Keys
- users: user_id
- subjects: subject_id
- courses: course_id
- course_subjects: cs_id
- enrollments: enrollment_id
- feedback_forms: form_id
- feedback_form_questions: question_id
- feedback_responses: response_id

### Foreign Keys
- subjects.teacher_id → users.user_id
- course_subjects.course_id → courses.course_id
- course_subjects.subject_id → subjects.subject_id
- enrollments.student_id → users.user_id
- enrollments.course_id → courses.course_id
- feedback_forms.course_id → courses.course_id
- feedback_form_questions.form_id → feedback_forms.form_id
- feedback_responses.student_id → users.user_id
- feedback_responses.form_id → feedback_forms.form_id
- feedback_responses.subject_id → subjects.subject_id
- feedback_responses.question_id → feedback_form_questions.question_id

### Unique Constraints
- users.username (UNIQUE)
- users.email (UNIQUE)
- subjects.code (UNIQUE)
- courses.code (UNIQUE)
- course_subjects (course_id, subject_id) - Composite UNIQUE
- enrollments (student_id, course_id) - Composite UNIQUE
- feedback_responses (student_id, form_id, subject_id, question_id) - Composite UNIQUE

### Check Constraints
- users.role ∈ {admin, teacher, student}
- feedback_form_questions.question_type ∈ {rating, text, choice}
- feedback_responses.rating ∈ {1, 2, 3, 4, 5} OR NULL

---

## RELATIONSHIPS SUMMARY

| Parent Table | Child Table | Relationship Type | Cardinality |
|--------------|-------------|-------------------|-------------|
| users | subjects | One-to-Many | 1:N |
| users | enrollments | One-to-Many | 1:N |
| users | feedback_responses | One-to-Many | 1:N |
| courses | course_subjects | One-to-Many | 1:N |
| subjects | course_subjects | One-to-Many | 1:N |
| courses | enrollments | One-to-Many | 1:N |
| courses | feedback_forms | One-to-Many | 1:N |
| feedback_forms | feedback_form_questions | One-to-Many | 1:N |
| feedback_forms | feedback_responses | One-to-Many | 1:N |
| subjects | feedback_responses | One-to-Many | 1:N |
| feedback_form_questions | feedback_responses | One-to-Many | 1:N |

---

## NOTES

1. **PK** = Primary Key
2. **FK** = Foreign Key
3. **ENUM** = Enumerated type with fixed values
4. **TEXT** = Variable-length text field
5. **TIMESTAMP** = Date and time field with automatic updates
6. **BOOLEAN** = True/False value
7. All primary keys are auto-incrementing integers
8. Underlined attributes in relational schema indicate primary keys
9. Foreign key constraints ensure referential integrity
10. Composite unique constraints prevent duplicate entries

---

## HOW TO COPY TO MS WORD

### Method 1: Direct Copy-Paste
1. Open this file in any markdown viewer or VS Code
2. Select the table you want
3. Copy (Ctrl+C)
4. Paste into MS Word (Ctrl+V)
5. Word will automatically format it as a table

### Method 2: Convert to Word Table
1. Copy the markdown table
2. In Word, go to Insert → Table → Convert Text to Table
3. Choose "Tabs" or "Other" as separator
4. Click OK

### Method 3: Use Online Converter
1. Copy the markdown table
2. Go to: https://www.tablesgenerator.com/markdown_tables
3. Paste and convert to Word format
4. Copy the result to Word

### Formatting Tips for Word:
- Make header row bold
- Center-align the "Serial No." column
- Apply table borders (Design → Border Styles)
- Use "Grid Table" style for professional look
- Adjust column widths as needed
