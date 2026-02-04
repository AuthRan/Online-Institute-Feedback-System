# System Diagrams - Online Institute Feedback System

## 1. USE CASE DIAGRAM

```mermaid
graph TB
    subgraph System["Online Institute Feedback System"]
        subgraph AuthModule["Authentication Module"]
            UC1[Register Account]
            UC2[Login to System]
            UC3[View Profile]
        end
        
        subgraph AdminModule["Admin Module"]
            UC4[Manage Users]
            UC5[Create Course]
            UC6[Update Course]
            UC7[Delete Course]
            UC8[View All Subjects]
            UC9[Create Feedback Form]
            UC10[Add Form Questions]
            UC11[Activate/Deactivate Form]
            UC12[View All Feedback with Names]
            UC13[Generate Reports]
        end
        
        subgraph TeacherModule["Teacher Module"]
            UC14[Create Subject]
            UC15[Update Subject]
            UC16[Delete Subject]
            UC17[View My Subjects]
            UC18[View Anonymous Feedback]
            UC19[View Subject Statistics]
            UC20[View Feedback Analytics]
        end
        
        subgraph StudentModule["Student Module"]
            UC21[Browse Available Courses]
            UC22[Enroll in Course]
            UC23[Unenroll from Course]
            UC24[View Enrolled Courses]
            UC25[Submit Feedback]
            UC26[Update Feedback]
            UC27[View My Feedback]
        end
    end
    
    Admin((Admin))
    Teacher((Teacher))
    Student((Student))
    
    %% Admin connections
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    
    %% Teacher connections
    Teacher --> UC1
    Teacher --> UC2
    Teacher --> UC3
    Teacher --> UC14
    Teacher --> UC15
    Teacher --> UC16
    Teacher --> UC17
    Teacher --> UC18
    Teacher --> UC19
    Teacher --> UC20
    
    %% Student connections
    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC21
    Student --> UC22
    Student --> UC23
    Student --> UC24
    Student --> UC25
    Student --> UC26
    Student --> UC27
    
    %% Relationships
    UC5 -.includes.-> UC8
    UC9 -.includes.-> UC10
    UC25 -.extends.-> UC26
    UC22 -.requires.-> UC21
    UC25 -.requires.-> UC24
    
    style Admin fill:#ff6b6b
    style Teacher fill:#4ecdc4
    style Student fill:#95e1d3
```

## 2. ENTITY RELATIONSHIP DIAGRAM (ERD)

```mermaid
erDiagram
    USERS ||--o{ SUBJECTS : "creates (teacher)"
    USERS ||--o{ ENROLLMENTS : "enrolls (student)"
    USERS ||--o{ FEEDBACK_RESPONSES : "submits (student)"
    
    SUBJECTS ||--o{ COURSE_SUBJECTS : "belongs to"
    SUBJECTS ||--o{ FEEDBACK_RESPONSES : "receives feedback"
    
    COURSES ||--o{ COURSE_SUBJECTS : "contains"
    COURSES ||--o{ ENROLLMENTS : "has enrollments"
    COURSES ||--o{ FEEDBACK_FORMS : "has forms"
    
    FEEDBACK_FORMS ||--o{ FEEDBACK_FORM_QUESTIONS : "contains"
    FEEDBACK_FORMS ||--o{ FEEDBACK_RESPONSES : "receives responses"
    
    FEEDBACK_FORM_QUESTIONS ||--o{ FEEDBACK_RESPONSES : "answered by"
    
    USERS {
        int id PK
        varchar username UK
        varchar email UK
        varchar password
        enum role "admin, teacher, student"
        varchar name
        int semester "for students"
        varchar department "for students"
        timestamp created_at
        timestamp updated_at
    }
    
    SUBJECTS {
        int id PK
        varchar title
        text description
        varchar code UK
        int teacher_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    COURSES {
        int id PK
        varchar title
        text description
        varchar code UK
        int semester
        varchar department
        timestamp created_at
        timestamp updated_at
    }
    
    COURSE_SUBJECTS {
        int id PK
        int course_id FK
        int subject_id FK
        timestamp created_at
    }
    
    ENROLLMENTS {
        int id PK
        int student_id FK
        int course_id FK
        timestamp enrolled_at
    }
    
    FEEDBACK_FORMS {
        int id PK
        int course_id FK
        varchar title
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    FEEDBACK_FORM_QUESTIONS {
        int id PK
        int form_id FK
        text question_text
        enum question_type "rating, text, choice"
        int question_order
        timestamp created_at
    }
    
    FEEDBACK_RESPONSES {
        int id PK
        int student_id FK
        int form_id FK
        int subject_id FK
        int question_id FK
        text response_value
        int rating "1-5 for rating questions"
        timestamp created_at
        timestamp updated_at
    }
```

## 3. DETAILED USE CASE DESCRIPTIONS

### 3.1 Admin Use Cases

#### UC4: Manage Users
- **Actor**: Admin
- **Description**: Admin can create, read, update, and delete user accounts for all roles
- **Precondition**: Admin must be logged in
- **Postcondition**: User account is created/updated/deleted in the system

#### UC5: Create Course
- **Actor**: Admin
- **Description**: Admin creates a course by specifying title, description, code, semester, department, and selecting multiple subjects
- **Precondition**: Subjects must exist in the system
- **Postcondition**: Course is created and linked to selected subjects

#### UC9: Create Feedback Form
- **Actor**: Admin
- **Description**: Admin creates a custom feedback form for a specific course with multiple questions
- **Precondition**: Course must exist
- **Postcondition**: Feedback form is created and ready for student submissions

#### UC12: View All Feedback with Names
- **Actor**: Admin
- **Description**: Admin can view all feedback submissions with student names for accountability
- **Precondition**: Feedback responses exist
- **Postcondition**: Admin sees complete feedback data including student identity

---

### 3.2 Teacher Use Cases

#### UC14: Create Subject
- **Actor**: Teacher
- **Description**: Teacher creates a subject they teach with title, description, and unique code
- **Precondition**: Teacher must be logged in
- **Postcondition**: Subject is created and linked to the teacher

#### UC18: View Anonymous Feedback
- **Actor**: Teacher
- **Description**: Teacher views feedback for their subjects without seeing student names
- **Precondition**: Students have submitted feedback for teacher's subjects
- **Postcondition**: Teacher sees anonymous feedback responses

#### UC19: View Subject Statistics
- **Actor**: Teacher
- **Description**: Teacher views statistical analysis of feedback including average ratings, rating distribution, and response count
- **Precondition**: Feedback responses exist for the subject
- **Postcondition**: Teacher sees visual analytics and statistics

---

### 3.3 Student Use Cases

#### UC21: Browse Available Courses
- **Actor**: Student
- **Description**: Student views courses filtered automatically by their semester and department
- **Precondition**: Student must be logged in with semester and department information
- **Postcondition**: Student sees only relevant courses

#### UC22: Enroll in Course
- **Actor**: Student
- **Description**: Student enrolls in an available course to access its subjects and feedback forms
- **Precondition**: Course must match student's semester and department
- **Postcondition**: Enrollment record is created

#### UC25: Submit Feedback
- **Actor**: Student
- **Description**: Student submits feedback for a subject within an enrolled course using the active feedback form
- **Precondition**: Student must be enrolled in the course, and an active feedback form must exist
- **Postcondition**: Feedback responses are saved and visible to teacher (anonymously) and admin (with name)

#### UC26: Update Feedback
- **Actor**: Student
- **Description**: Student can update their previously submitted feedback
- **Precondition**: Student must have previously submitted feedback
- **Postcondition**: Previous responses are deleted and new responses are saved

---

## 4. SYSTEM WORKFLOW DIAGRAM

```mermaid
sequenceDiagram
    participant S as Student
    participant T as Teacher
    participant A as Admin
    participant SYS as System
    participant DB as Database
    
    Note over A,DB: Phase 1: Setup
    T->>SYS: Create Subject
    SYS->>DB: Store Subject
    A->>SYS: Create Course (select subjects)
    SYS->>DB: Store Course + Link Subjects
    A->>SYS: Create Feedback Form
    SYS->>DB: Store Form + Questions
    
    Note over S,DB: Phase 2: Enrollment
    S->>SYS: Login (semester + department)
    SYS->>DB: Authenticate
    S->>SYS: Browse Courses
    SYS->>DB: Filter by semester/department
    DB-->>S: Show matching courses
    S->>SYS: Enroll in Course
    SYS->>DB: Create Enrollment
    
    Note over S,DB: Phase 3: Feedback Submission
    S->>SYS: Select Subject from Enrolled Course
    SYS->>DB: Get Active Feedback Form
    DB-->>S: Display Form Questions
    S->>SYS: Submit Feedback Responses
    SYS->>DB: Store Responses (with student_id)
    
    Note over T,DB: Phase 4: Feedback Review
    T->>SYS: View Subject Feedback
    SYS->>DB: Get Responses (hide student names)
    DB-->>T: Anonymous Feedback
    T->>SYS: View Statistics
    SYS->>DB: Calculate Analytics
    DB-->>T: Charts and Stats
    
    Note over A,DB: Phase 5: Admin Review
    A->>SYS: View All Feedback
    SYS->>DB: Get All Responses (with student names)
    DB-->>A: Complete Feedback Data
    A->>SYS: Generate Reports
    SYS-->>A: PDF Reports
```

## 5. CLASS DIAGRAM

```mermaid
classDiagram
    class User {
        +int id
        +string username
        +string email
        +string password
        +enum role
        +string name
        +int semester
        +string department
        +register()
        +login()
        +updateProfile()
    }
    
    class Admin {
        +createUser()
        +updateUser()
        +deleteUser()
        +createCourse()
        +createFeedbackForm()
        +viewAllFeedback()
        +generateReports()
    }
    
    class Teacher {
        +createSubject()
        +updateSubject()
        +deleteSubject()
        +viewAnonymousFeedback()
        +viewStatistics()
    }
    
    class Student {
        +browseCourses()
        +enrollInCourse()
        +unenrollFromCourse()
        +submitFeedback()
        +updateFeedback()
        +viewMyFeedback()
    }
    
    class Subject {
        +int id
        +string title
        +string description
        +string code
        +int teacher_id
        +getDetails()
        +getFeedback()
    }
    
    class Course {
        +int id
        +string title
        +string description
        +string code
        +int semester
        +string department
        +addSubject()
        +removeSubject()
        +getSubjects()
    }
    
    class FeedbackForm {
        +int id
        +int course_id
        +string title
        +string description
        +boolean is_active
        +addQuestion()
        +activate()
        +deactivate()
    }
    
    class FeedbackFormQuestion {
        +int id
        +int form_id
        +string question_text
        +enum question_type
        +int question_order
    }
    
    class FeedbackResponse {
        +int id
        +int student_id
        +int form_id
        +int subject_id
        +int question_id
        +string response_value
        +int rating
        +submit()
        +update()
    }
    
    class Enrollment {
        +int id
        +int student_id
        +int course_id
        +timestamp enrolled_at
        +enroll()
        +unenroll()
    }
    
    User <|-- Admin
    User <|-- Teacher
    User <|-- Student
    
    Teacher "1" --> "*" Subject : creates
    Admin "1" --> "*" Course : creates
    Admin "1" --> "*" FeedbackForm : creates
    
    Course "*" --> "*" Subject : contains
    Course "1" --> "*" Enrollment : has
    Course "1" --> "*" FeedbackForm : has
    
    Student "1" --> "*" Enrollment : makes
    Student "1" --> "*" FeedbackResponse : submits
    
    FeedbackForm "1" --> "*" FeedbackFormQuestion : contains
    FeedbackForm "1" --> "*" FeedbackResponse : receives
    
    Subject "1" --> "*" FeedbackResponse : receives
    FeedbackFormQuestion "1" --> "*" FeedbackResponse : answered_by
```

## 6. DATA FLOW DIAGRAM (Level 0 - Context Diagram)

```mermaid
graph LR
    A[Admin] -->|User Management| SYS[Online Institute<br/>Feedback System]
    A -->|Course Management| SYS
    A -->|Form Creation| SYS
    SYS -->|Reports| A
    
    T[Teacher] -->|Subject Creation| SYS
    SYS -->|Anonymous Feedback| T
    SYS -->|Statistics| T
    
    S[Student] -->|Enrollment| SYS
    S -->|Feedback Submission| SYS
    SYS -->|Course Information| S
    
    SYS -->|Store/Retrieve Data| DB[(Database)]
    
    style SYS fill:#4ecdc4
    style DB fill:#ffe66d
```

## 7. ACTIVITY DIAGRAM - Student Feedback Submission

```mermaid
graph TD
    Start([Student Logs In]) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| Login[Enter Credentials]
    Login --> CheckAuth
    CheckAuth -->|Yes| ViewCourses[View Available Courses<br/>Filtered by Semester/Dept]
    
    ViewCourses --> CheckEnroll{Already<br/>Enrolled?}
    CheckEnroll -->|No| Enroll[Enroll in Course]
    Enroll --> ViewEnrolled[View Enrolled Courses]
    CheckEnroll -->|Yes| ViewEnrolled
    
    ViewEnrolled --> SelectCourse[Select Course]
    SelectCourse --> ViewSubjects[View Course Subjects]
    ViewSubjects --> SelectSubject[Select Subject]
    
    SelectSubject --> CheckForm{Active Form<br/>Exists?}
    CheckForm -->|No| NoForm[Display: No Active Form]
    NoForm --> End([End])
    
    CheckForm -->|Yes| CheckPrevious{Previously<br/>Submitted?}
    CheckPrevious -->|Yes| LoadPrevious[Load Previous Responses]
    CheckPrevious -->|No| LoadForm[Load Empty Form]
    
    LoadPrevious --> FillForm[Fill/Update Form]
    LoadForm --> FillForm
    
    FillForm --> Validate{All Required<br/>Fields Filled?}
    Validate -->|No| ShowError[Show Validation Error]
    ShowError --> FillForm
    
    Validate -->|Yes| Submit[Submit Feedback]
    Submit --> DeleteOld[Delete Old Responses<br/>if updating]
    DeleteOld --> SaveNew[Save New Responses]
    SaveNew --> Success[Show Success Message]
    Success --> End
    
    style Start fill:#95e1d3
    style End fill:#ff6b6b
    style Submit fill:#4ecdc4
```

## 8. STATE DIAGRAM - Feedback Form Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: Admin creates form
    Created --> Active: Admin activates form
    Active --> Inactive: Admin deactivates form
    Inactive --> Active: Admin reactivates form
    Active --> Receiving: Students submit feedback
    Receiving --> Active: More submissions
    Active --> Deleted: Admin deletes form
    Inactive --> Deleted: Admin deletes form
    Deleted --> [*]
    
    note right of Created
        Form exists but not
        available to students
    end note
    
    note right of Active
        Students can submit
        feedback responses
    end note
    
    note right of Receiving
        Collecting student
        responses
    end note
```

---

## Summary

These diagrams provide a comprehensive view of the **Online Institute Feedback System**:

1. **Use Case Diagram**: Shows all functionalities available to each user role
2. **ER Diagram**: Illustrates database structure and relationships
3. **Use Case Descriptions**: Detailed explanation of key use cases
4. **Sequence Diagram**: Shows the complete workflow from setup to feedback review
5. **Class Diagram**: Object-oriented representation of system entities
6. **Data Flow Diagram**: High-level view of data movement
7. **Activity Diagram**: Step-by-step process of feedback submission
8. **State Diagram**: Lifecycle of feedback forms

The system implements a sophisticated three-tier architecture with role-based access control, ensuring that:
- **Admins** have complete system control
- **Teachers** can manage subjects and view anonymous feedback
- **Students** can enroll in courses and submit feedback with conditional anonymity
