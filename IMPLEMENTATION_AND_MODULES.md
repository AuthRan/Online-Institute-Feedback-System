# 4.7 IMPLEMENTATION

## Home Page (Login & Register)

The system starts with a clean authentication interface where users can either log in or create a new account. When registering, users need to provide their basic information like name, email, and password. Students have an additional step - they also select their semester and department during registration, which the system uses later to show them only relevant courses.

The login process is straightforward - users enter their email and password, and the system verifies their credentials. Once authenticated, the system checks their role and automatically redirects them to the appropriate dashboard. This means admins, teachers, and students each land on a different page designed specifically for their needs.

All passwords are encrypted before being stored in the database, so even if someone gains access to the database, they can't see actual passwords. The system uses JWT (JSON Web Tokens) for maintaining user sessions, which means users stay logged in as they navigate through different pages without having to re-enter credentials repeatedly.

---

## Admin Dashboard

After logging in, admins get access to a comprehensive control panel where they manage the entire system. The dashboard is organized into several sections, each handling a specific aspect of the feedback system.

**User Management Section:**
Admins can see a list of all registered users - students, teachers, and other admins. They can create new user accounts directly (useful for bulk registration), update user details if needed, and remove accounts that are no longer required. This gives them complete control over who has access to the system.

**Course Management:**
This is where admins build the academic structure. They can create courses by giving them a name, code, and description, then selecting which semester and department the course belongs to. The interesting part is how they add subjects to courses - they pick from subjects that teachers have already created, essentially bundling multiple subjects into one course package.

**Feedback Form Builder:**
Admins design custom feedback forms for each course. They can add different types of questions - rating questions (1 to 5 stars), text questions where students write their thoughts, or multiple-choice questions. Each question can be reordered, and the entire form can be activated or deactivated depending on when feedback collection should happen.

**Viewing Feedback:**
Unlike teachers who see anonymous feedback, admins can view all submitted feedback along with student names. This helps with accountability and allows them to investigate any concerning feedback or patterns. They can filter feedback by course, subject, or teacher to get specific insights.

**Reports Generation:**
The dashboard includes analytics and reporting features. Admins can generate PDF reports showing feedback statistics, rating distributions, and response rates. These reports are useful for institutional reviews and quality assurance processes.

---

## Teacher Dashboard

Teachers have a more focused dashboard since they only need to manage their subjects and view feedback related to their teaching.

**Subject Creation:**
When teachers first log in, they can create subjects they teach. Each subject needs a title (like "Data Structures"), a unique code (like "CS201"), and a description. Once created, these subjects become available for admins to include in courses.

**Managing Subjects:**
Teachers can update their subject details anytime - maybe they want to change the description or fix a typo in the title. They can also delete subjects if they're no longer teaching them, though the system won't allow deletion if students have already submitted feedback for that subject.

**Viewing Anonymous Feedback:**
This is where the conditional anonymity feature comes into play. Teachers can see all feedback submitted for their subjects, including ratings, text responses, and answers to all questions. However, student names are completely hidden from them. This encourages students to give honest feedback without worrying about potential consequences.

**Statistics and Analytics:**
The dashboard shows useful statistics like average ratings, total number of responses, and rating distributions (how many 5-stars, 4-stars, etc.). Teachers can see trends over time if they've received feedback across multiple semesters. Visual charts make it easy to spot areas where they're doing well and areas that might need improvement.

---

## Student Dashboard

Students get the simplest but most important interface - one focused entirely on browsing courses and submitting feedback.

**Course Browsing:**
When students log in, they immediately see courses that match their semester and department. This automatic filtering means a first-semester Computer Science student won't see courses meant for third-semester Mechanical Engineering students. It keeps things clean and relevant.

**Enrollment Process:**
Students can enroll in any course shown to them with a single click. Once enrolled, they can see all subjects within that course and who teaches each subject. If they realize they enrolled in the wrong course, they can unenroll just as easily.

**Feedback Submission:**
This is the core functionality for students. They select a subject from their enrolled courses, and the system loads the active feedback form for that course. They then answer each question - giving star ratings, typing text responses, or selecting from multiple choices depending on the question type.

The system remembers if they've already submitted feedback for a particular subject. If they have, it loads their previous responses, allowing them to update their feedback if their opinion has changed or if they want to add more details.

**My Feedback Section:**
Students can view all the feedback they've submitted across different subjects. This serves as a personal record and also lets them go back and update responses if needed. They can see which subjects they've given feedback for and which ones are still pending.

---

# 4.8 DESCRIPTION OF MODULES

## Backend Modules

### routes/ (API Endpoints)

The routes folder contains all the API endpoint definitions that the frontend communicates with. Each file handles a specific feature area:

**auth.js**
This handles everything related to user authentication. It processes registration requests by validating the input data, hashing passwords, and storing user information in the database. For login, it verifies credentials and generates JWT tokens that the frontend stores and sends with subsequent requests. There's also an endpoint to get the current user's information based on their token.

**subjects.js**
Teachers use these endpoints to manage their subjects. The routes allow creating new subjects (with validation to ensure unique codes), retrieving all subjects or subjects for a specific teacher, updating subject details, and deleting subjects. The system checks that only the teacher who created a subject can modify or delete it.

**courses.js**
These are admin-only routes for course management. Admins can create courses and link multiple subjects to them in one go. The routes handle the complexity of the many-to-many relationship between courses and subjects through the junction table. Students get a filtered list of courses based on their semester and department, while admins see everything.

**enrollments.js**
Students interact with these routes to enroll in or unenroll from courses. The system prevents duplicate enrollments and ensures students can only enroll in courses that match their semester and department. There's also an endpoint to fetch all courses a student is currently enrolled in.

**feedbackForms.js**
Admins use these routes to create and manage feedback forms. Creating a form involves specifying the course it belongs to and adding multiple questions with their types and order. The routes handle the transaction of creating both the form and its questions atomically. There are endpoints to activate or deactivate forms, ensuring only one form per course is active at a time.

**feedback.js**
This is where the actual feedback submission happens. Students send their responses to all questions in a form, and the system stores them linked to the specific student, form, subject, and question. The routes handle both initial submissions and updates (by deleting old responses and inserting new ones).

For viewing feedback, the routes implement the conditional anonymity logic - if the requester is a teacher, student names are excluded from the query results; if it's an admin, names are included. There are also routes for fetching statistics like average ratings and response counts.

**reports.js**
These routes generate comprehensive reports and analytics. They aggregate feedback data, calculate statistics, and format everything for PDF generation. Admins can request reports for specific courses, subjects, or time periods.

**users.js**
Admin-only routes for user management. These allow creating, updating, and deleting user accounts. The routes include validation to prevent creating duplicate usernames or emails.

---

### config/database.js

This file sets up the connection to the MySQL database using the mysql2 library. It reads database credentials from environment variables (stored in the .env file) and creates a connection pool. A pool is better than a single connection because it can handle multiple simultaneous requests efficiently.

The file exports this pool, which all other modules import and use to execute database queries. It handles connection errors gracefully and includes retry logic in case the database is temporarily unavailable.

---

### middleware/auth.js

This middleware sits between the routes and their handlers, checking if requests are properly authenticated and authorized.

**authenticate function:**
This extracts the JWT token from the request headers, verifies it's valid and not expired, and decodes it to get user information. If the token is valid, it attaches the user data to the request object so route handlers can access it. If the token is missing or invalid, it immediately returns an error response.

**authorize function:**
This is used after authentication to check if the user has the right role to access a particular endpoint. For example, only admins should be able to create courses, so the course creation route uses `authorize('admin')`. Some routes allow multiple roles, like viewing subjects, which uses `authorize('admin', 'teacher', 'student')`.

---

### database/schema.sql

This SQL file contains all the CREATE TABLE statements that define the database structure. It includes:
- Table definitions with all columns and their data types
- Primary key constraints
- Foreign key relationships with CASCADE delete rules
- Unique constraints to prevent duplicate entries
- ENUM types for fields like role and question_type
- Default values and auto-increment settings
- Timestamp fields that automatically update

Running this file sets up the entire database from scratch. It's also useful documentation for understanding the data model.

---

### server.js

This is the entry point of the entire backend application. When you run `npm start`, this file executes.

It does several important things:
1. Loads environment variables from the .env file
2. Creates the Express application instance
3. Configures CORS to allow the frontend (running on a different port) to make requests
4. Sets up JSON parsing middleware so the server can read request bodies
5. Registers all the route modules under their respective paths (like /api/auth, /api/courses, etc.)
6. Adds a health check endpoint that the frontend can ping to verify the server is running
7. Starts the server listening on the specified port

Everything flows through this file - it's the orchestrator that brings all modules together.

---

## Frontend Modules

### pages/

**Login.jsx**
A simple form with email and password fields. When submitted, it calls the authentication API, stores the returned JWT token in localStorage, and redirects users to their role-specific dashboard. Includes error handling for wrong credentials.

**Register.jsx**
A more complex form that changes based on the selected role. Students see additional fields for semester and department. The form validates input on the frontend before sending it to the API. After successful registration, users are automatically logged in and redirected.

**AdminDashboard.jsx**
The most feature-rich page in the application. It's organized into tabs or sections for different admin functions - user management, course creation, form building, and feedback viewing. Each section makes API calls to fetch data and display it in tables or forms. The feedback form builder is particularly complex, allowing dynamic addition and removal of questions.

**TeacherDashboard.jsx**
Displays the teacher's subjects in a list or card format. Teachers can add new subjects through a modal or form. Clicking on a subject shows all feedback for it, with charts visualizing rating distributions. The page ensures student names are never displayed.

**StudentDashboard.jsx**
Shows available courses filtered by the student's semester and department. Students can enroll with a button click, then see their enrolled courses. For each enrolled course, they can select a subject and submit feedback. The page loads previous responses if they exist, allowing updates.

---

### components/

**Layout.jsx**
A wrapper component that provides consistent navigation and styling across all pages. It shows a header with the user's name and role, a logout button, and a sidebar or navigation menu. Different menu items appear based on the user's role.

**LoadingSkeleton.jsx**
A reusable component that displays animated placeholder content while data is being fetched from the API. This improves perceived performance and user experience by showing something instead of a blank screen.

---

### context/AuthContext.jsx

This provides authentication state management across the entire application using React Context. It stores the current user's information and token, provides login and logout functions, and checks if the user is authenticated. All pages that need to know who's logged in can access this context instead of passing props through multiple levels.

---

### services/api.js

A centralized module for all API calls. Instead of having fetch or axios calls scattered throughout components, this file defines functions like `login()`, `getCourses()`, `submitFeedback()`, etc. Each function handles the HTTP request, includes the authentication token in headers, and processes the response. This makes the code cleaner and easier to maintain.

---

### App.jsx

The root component that sets up routing using React Router. It defines which component should render for each URL path (like /login, /admin, /teacher, /student). It also wraps everything in the AuthContext provider and includes protected route logic - if someone tries to access /admin without being logged in as an admin, they're redirected to the login page.

---

### main.jsx

The absolute entry point of the React application. It renders the App component into the HTML DOM and sets up any global configurations. This is what gets executed when the frontend starts.

---

## How Everything Works Together

When a student wants to submit feedback, here's what happens:

1. They log in through Login.jsx, which calls the API through services/api.js
2. The backend's auth.js route verifies credentials and returns a token
3. The frontend stores this token and redirects to StudentDashboard.jsx
4. The dashboard fetches enrolled courses by calling the API again
5. The API request goes through middleware/auth.js which verifies the token
6. The enrollments.js route queries the database using config/database.js
7. Results are sent back and displayed in the dashboard
8. Student selects a subject and the feedback form loads
9. After filling it out, they submit, which calls the feedback.js route
10. The route stores responses in the database
11. Teachers can later view this feedback (anonymously) through their dashboard
12. Admins can view it with student names for accountability

This flow demonstrates how the frontend components, API routes, middleware, and database all work together to deliver the complete functionality.
