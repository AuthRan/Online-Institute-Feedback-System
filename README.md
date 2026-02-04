# Online Institute Feedback System

A complete feedback management system for educational institutes with role-based access control for Admins, Teachers, and Students. Features a sophisticated course-subject hierarchy and dynamic feedback forms.

## 🎥 Demo Videos

See the system in action! Watch role-specific demonstrations:

### 👨‍💼 Admin Demo
[![Admin Demo](https://img.shields.io/badge/▶️_Watch-Admin_Demo-red?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/108ZLCxcYA0Ew7wjsDyOHnyWqeyqh8VZV/view?usp=sharing)

**Features demonstrated:**
- User management and role assignment
- Creating courses with subject collections
- Building dynamic feedback forms
- Viewing detailed feedback with student information

---

### 👨‍🏫 Teacher Demo
[![Teacher Demo](https://img.shields.io/badge/▶️_Watch-Teacher_Demo-blue?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1dp1dutHXxkBaAUFD9MSCXZW3NMuo8R6S/view?usp=sharing)

**Features demonstrated:**
- Creating and managing subjects
- Viewing anonymous student feedback
- Analyzing feedback statistics and trends

---

### 👨‍🎓 Student Demo
[![Student Demo](https://img.shields.io/badge/▶️_Watch-Student_Demo-green?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/1OFjR2PdYzTaM99T4KPztjDq6HKQu1sGP/view?usp=sharing)

**Features demonstrated:**
- Registration with semester and department
- Browsing and enrolling in courses
- Submitting feedback through dynamic forms
- Viewing submission history

---

## Features

### Three User Roles:

- **Admin**: 
  - Manage all users
  - View all subjects created by teachers
  - Create courses (collections of subjects) for specific semesters and departments
  - Create custom feedback forms with multiple questions
  - View all feedback with student names

- **Teacher**: 
  - Create and manage subjects (what they teach)
  - View anonymous feedback for their subjects
  - View feedback statistics

- **Student**: 
  - Register with semester and department selection
  - View courses available for their semester/department only
  - Enroll in courses
  - Submit feedback using dynamic forms (created by admin)
  - Feedback is anonymous to teachers but visible to admin

### Key Functionality:

- **Subject vs Course System**: 
  - Teachers create **Subjects** (individual teaching units)
  - Admins create **Courses** (collections of subjects) for specific semesters and departments
  
- **Dynamic Feedback Forms**: 
  - Admins create custom feedback forms with multiple questions
  - Questions can be rating-based (1-5 stars), text answers, or multiple choice
  - Students submit feedback per subject within a course
  
- **Semester & Department Filtering**: 
  - Students only see courses matching their semester and department
  - Automatic filtering based on registration data
  
- **Anonymous Feedback**: 
  - Teachers see feedback without student names
  - Admins see feedback with student names
  
- **Modern UI**: 
  - Beautiful gradient cards and animations
  - Responsive design
  - Interactive elements

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Database Structure

The system uses the following key tables:
- `users` - All users with semester/department for students
- `subjects` - Created by teachers
- `courses` - Created by admins, collections of subjects
- `course_subjects` - Junction table linking courses to subjects
- `enrollments` - Student course enrollments
- `feedback_forms` - Admin-created feedback forms
- `feedback_form_questions` - Questions in each form
- `feedback_responses` - Student responses to questions

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Create a MySQL database:
```bash
mysql -u root -p
CREATE DATABASE institute_feedback;
```

2. Import the database schema:
```bash
mysql -u root -p institute_feedback < backend/database/schema.sql
```

3. Update the database credentials in `backend/.env` (create from `.env.example`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=institute_feedback
JWT_SECRET=your_secret_jwt_key_here_change_in_production
PORT=5000
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials and JWT secret.

5. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage Workflow

### For Admins:
1. **Create Subjects** (or let teachers create them)
2. **Create Courses**: 
   - Select semester and department
   - Add multiple subjects to the course
3. **Create Feedback Forms**:
   - Select a course
   - Add multiple questions (rating, text, or choice)
   - Activate the form
4. **View Feedback**: See all student feedback with names

### For Teachers:
1. **Create Subjects**: Add subjects you teach
2. **View Feedback**: See anonymous feedback for your subjects with statistics

### For Students:
1. **Register**: 
   - Enter semester (1-8)
   - Select department
2. **Browse Courses**: Only see courses matching your semester/department
3. **Enroll**: Enroll in available courses
4. **Submit Feedback**: 
   - Select a subject from enrolled courses
   - Fill out the feedback form (created by admin)
   - Submit (can update later)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register (semester/department required for students)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Subjects (Teachers)
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (Teacher)
- `GET /api/subjects/teacher/:teacherId` - Get teacher's subjects

### Courses (Admins)
- `GET /api/courses` - Get courses (filtered by semester/department for students)
- `POST /api/courses` - Create course with subjects (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Feedback Forms (Admins)
- `POST /api/feedback-forms` - Create feedback form with questions
- `GET /api/feedback-forms/course/:courseId` - Get forms for a course
- `GET /api/feedback-forms/course/:courseId/active` - Get active form (Students)

### Feedback
- `POST /api/feedback` - Submit feedback responses (Student)
- `GET /api/feedback/subject/:subjectId` - Get feedback for subject (Teacher/Admin)
- `GET /api/feedback/all` - Get all feedback (Admin with names)
- `GET /api/feedback/my` - Get my feedback (Student)

### Enrollments
- `POST /api/enrollments/:courseId` - Enroll in course (Student)
- `DELETE /api/enrollments/:courseId` - Unenroll (Student)

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── subjects.js          # Subject management (Teachers)
│   │   ├── courses.js           # Course management (Admins)
│   │   ├── enrollments.js       # Enrollment routes
│   │   ├── feedback.js          # Feedback routes
│   │   ├── feedbackForms.js     # Feedback form management
│   │   └── users.js             # User management
│   ├── database/
│   │   └── schema.sql          # Database schema
│   ├── server.js                # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/             # React context (Auth)
│   │   ├── pages/               # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/            # API service
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Key Concepts

### Subject vs Course
- **Subject**: A single teaching unit created by a teacher (e.g., "Mathematics", "Physics")
- **Course**: A collection of subjects for a specific semester and department (e.g., "Semester 1 - Computer Science" containing Math, Physics, Programming)

### Feedback Flow
1. Admin creates a feedback form with questions for a course
2. Student enrolls in the course
3. Student selects a subject within the course
4. Student fills out the feedback form
5. Feedback is sent to:
   - Admin (with student name)
   - Teacher (anonymously, for their subject only)

## Production Deployment

1. Set secure environment variables
2. Use a strong JWT_SECRET
3. Configure CORS properly
4. Set up HTTPS
5. Use environment-specific database credentials
6. Build the frontend: `npm run build` in the frontend directory
7. Serve the built files using a web server (nginx, Apache, etc.)

## License

This project is open source and available for educational purposes.
