import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

async function populateDatabase() {
    try {
        console.log('🚀 Starting database population...\n');

        // Hash passwords
        const adminPass = await bcrypt.hash('admin@123', 10);
        const teacherPass = await bcrypt.hash('teacher@123', 10);
        const studentPass = await bcrypt.hash('student@123', 10);

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
        await pool.execute('TRUNCATE TABLE feedback_responses');
        await pool.execute('TRUNCATE TABLE feedback_form_questions');
        await pool.execute('TRUNCATE TABLE feedback_forms');
        await pool.execute('TRUNCATE TABLE enrollments');
        await pool.execute('TRUNCATE TABLE course_subjects');
        await pool.execute('TRUNCATE TABLE courses');
        await pool.execute('TRUNCATE TABLE subjects');
        await pool.execute('TRUNCATE TABLE users');
        await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Cleared existing data\n');

        // Insert Admin Users
        console.log('👤 Creating admin users...');
        await pool.execute(
            'INSERT INTO users (username, email, password, role, name, semester, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['admin1', 'admin1@gmail.com', adminPass, 'admin', 'Dr. Rajesh Kumar', null, null]
        );
        await pool.execute(
            'INSERT INTO users (username, email, password, role, name, semester, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['admin2', 'admin2@gmail.com', adminPass, 'admin', 'Prof. Priya Sharma', null, null]
        );
        console.log('✅ Created 2 admin users\n');

        // Insert Teacher Users
        console.log('👨‍🏫 Creating teacher users...');
        const teachers = [
            ['teacher1', 'teacher1@gmail.com', 'Dr. Amit Verma'],
            ['teacher2', 'teacher2@gmail.com', 'Prof. Sneha Patel'],
            ['teacher3', 'teacher3@gmail.com', 'Dr. Rahul Gupta'],
            ['teacher4', 'teacher4@gmail.com', 'Prof. Kavita Singh'],
            ['teacher5', 'teacher5@gmail.com', 'Dr. Vikram Mehta'],
            ['teacher6', 'teacher6@gmail.com', 'Prof. Anjali Desai'],
            ['teacher7', 'teacher7@gmail.com', 'Dr. Suresh Reddy']
        ];

        for (const [username, email, name] of teachers) {
            await pool.execute(
                'INSERT INTO users (username, email, password, role, name, semester, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [username, email, teacherPass, 'teacher', name, null, null]
            );
        }
        console.log('✅ Created 7 teacher users\n');

        // Insert Student Users
        console.log('👨‍🎓 Creating student users...');
        const students = [
            // Semester 1 - Computer Science
            ['student1', 'student1@gmail.com', 'Arjun Sharma', 1, 'Computer Science'],
            ['student2', 'student2@gmail.com', 'Priya Nair', 1, 'Computer Science'],
            ['student3', 'student3@gmail.com', 'Rohan Kapoor', 1, 'Computer Science'],
            // Semester 2 - Computer Science
            ['student4', 'student4@gmail.com', 'Sneha Iyer', 2, 'Computer Science'],
            ['student5', 'student5@gmail.com', 'Karan Malhotra', 2, 'Computer Science'],
            ['student6', 'student6@gmail.com', 'Ananya Rao', 2, 'Computer Science'],
            // Semester 3 - Computer Science
            ['student7', 'student7@gmail.com', 'Aditya Joshi', 3, 'Computer Science'],
            ['student8', 'student8@gmail.com', 'Ishita Bansal', 3, 'Computer Science'],
            // Semester 1 - Electronics
            ['student9', 'student9@gmail.com', 'Varun Choudhary', 1, 'Electronics'],
            ['student10', 'student10@gmail.com', 'Divya Menon', 1, 'Electronics'],
            // Semester 2 - Electronics
            ['student11', 'student11@gmail.com', 'Nikhil Agarwal', 2, 'Electronics'],
            ['student12', 'student12@gmail.com', 'Riya Khanna', 2, 'Electronics'],
            // Semester 1 - Mechanical
            ['student13', 'student13@gmail.com', 'Siddharth Pillai', 1, 'Mechanical'],
            ['student14', 'student14@gmail.com', 'Pooja Saxena', 1, 'Mechanical'],
            ['student15', 'student15@gmail.com', 'Harsh Tiwari', 1, 'Mechanical']
        ];

        for (const [username, email, name, semester, department] of students) {
            await pool.execute(
                'INSERT INTO users (username, email, password, role, name, semester, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [username, email, studentPass, 'student', name, semester, department]
            );
        }
        console.log('✅ Created 15 student users\n');

        // Insert Subjects
        console.log('📚 Creating subjects...');
        const subjects = [
            ['Data Structures', 'Fundamental data structures and algorithms', 'CS201', 3],
            ['Database Management Systems', 'Relational databases and SQL', 'CS301', 3],
            ['Web Development', 'HTML, CSS, JavaScript, and modern frameworks', 'CS202', 4],
            ['Computer Networks', 'Network protocols and architecture', 'CS302', 4],
            ['Operating Systems', 'OS concepts and system programming', 'CS203', 5],
            ['Software Engineering', 'Software development lifecycle and methodologies', 'CS303', 5],
            ['Digital Electronics', 'Logic gates and digital circuits', 'EC101', 6],
            ['Microprocessors', '8086 and ARM architecture', 'EC201', 6],
            ['Engineering Mechanics', 'Statics and dynamics', 'ME101', 7],
            ['Thermodynamics', 'Heat and energy transfer', 'ME201', 7],
            ['Python Programming', 'Introduction to Python', 'CS101', 8],
            ['Machine Learning', 'ML algorithms and applications', 'CS401', 8],
            ['Signals and Systems', 'Signal processing fundamentals', 'EC202', 9],
            ['Control Systems', 'Feedback control theory', 'ME301', 9]
        ];

        for (const [title, description, code, teacherId] of subjects) {
            await pool.execute(
                'INSERT INTO subjects (title, description, code, teacher_id) VALUES (?, ?, ?, ?)',
                [title, description, code, teacherId]
            );
        }
        console.log('✅ Created 14 subjects\n');

        // Insert Courses
        console.log('🎓 Creating courses...');
        const courses = [
            ['Semester 1 - Computer Science', 'First semester core subjects for CS', 'CS-SEM1', 1, 'Computer Science'],
            ['Semester 2 - Computer Science', 'Second semester core subjects for CS', 'CS-SEM2', 2, 'Computer Science'],
            ['Semester 3 - Computer Science', 'Third semester core subjects for CS', 'CS-SEM3', 3, 'Computer Science'],
            ['Semester 1 - Electronics', 'First semester core subjects for EC', 'EC-SEM1', 1, 'Electronics'],
            ['Semester 2 - Electronics', 'Second semester core subjects for EC', 'EC-SEM2', 2, 'Electronics'],
            ['Semester 1 - Mechanical', 'First semester core subjects for ME', 'ME-SEM1', 1, 'Mechanical'],
            ['Semester 2 - Mechanical', 'Second semester core subjects for ME', 'ME-SEM2', 2, 'Mechanical']
        ];

        for (const [title, description, code, semester, department] of courses) {
            await pool.execute(
                'INSERT INTO courses (title, description, code, semester, department) VALUES (?, ?, ?, ?, ?)',
                [title, description, code, semester, department]
            );
        }
        console.log('✅ Created 7 courses\n');

        // Link Subjects to Courses
        console.log('🔗 Linking subjects to courses...');
        const courseSubjects = [
            [1, 11], [1, 1],   // CS Sem 1
            [2, 3], [2, 5],    // CS Sem 2
            [3, 2], [3, 4], [3, 6],  // CS Sem 3
            [4, 7],            // EC Sem 1
            [5, 8], [5, 13],   // EC Sem 2
            [6, 9],            // ME Sem 1
            [7, 10]            // ME Sem 2
        ];

        for (const [courseId, subjectId] of courseSubjects) {
            await pool.execute(
                'INSERT INTO course_subjects (course_id, subject_id) VALUES (?, ?)',
                [courseId, subjectId]
            );
        }
        console.log('✅ Linked subjects to courses\n');

        // Insert Enrollments
        console.log('📝 Creating enrollments...');
        const enrollments = [
            [3, 1], [4, 1], [5, 1],  // CS Sem 1 students
            [6, 2], [7, 2], [8, 2],  // CS Sem 2 students
            [9, 3], [10, 3],         // CS Sem 3 students
            [11, 4], [12, 4],        // EC Sem 1 students
            [13, 5], [14, 5],        // EC Sem 2 students
            [15, 6], [16, 6], [17, 6] // ME Sem 1 students
        ];

        for (const [studentId, courseId] of enrollments) {
            await pool.execute(
                'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
                [studentId, courseId]
            );
        }
        console.log('✅ Created 15 enrollments\n');

        // Insert Feedback Forms
        console.log('📋 Creating feedback forms...');
        const forms = [
            [1, 'Mid-Semester Feedback - CS Sem 1', 'Feedback for first semester CS subjects', 1],
            [2, 'Mid-Semester Feedback - CS Sem 2', 'Feedback for second semester CS subjects', 1],
            [3, 'End-Semester Feedback - CS Sem 3', 'Final feedback for third semester CS subjects', 1],
            [4, 'Mid-Semester Feedback - EC Sem 1', 'Feedback for first semester EC subjects', 1],
            [5, 'Mid-Semester Feedback - EC Sem 2', 'Feedback for second semester EC subjects', 1]
        ];

        for (const [courseId, title, description, isActive] of forms) {
            await pool.execute(
                'INSERT INTO feedback_forms (course_id, title, description, is_active) VALUES (?, ?, ?, ?)',
                [courseId, title, description, isActive]
            );
        }
        console.log('✅ Created 5 feedback forms\n');

        // Insert Feedback Form Questions
        console.log('❓ Creating feedback questions...');
        const questions = [
            // Form 1 questions
            [1, 'How would you rate the teaching quality?', 'rating', 0],
            [1, 'How clear were the explanations?', 'rating', 1],
            [1, 'Were the course materials helpful?', 'rating', 2],
            [1, 'What did you like most about this subject?', 'text', 3],
            [1, 'Any suggestions for improvement?', 'text', 4],
            // Form 2 questions
            [2, 'Rate the overall teaching effectiveness', 'rating', 0],
            [2, 'How engaging were the lectures?', 'rating', 1],
            [2, 'Were practical sessions useful?', 'rating', 2],
            [2, 'Additional comments', 'text', 3],
            // Form 3 questions
            [3, 'Overall subject satisfaction', 'rating', 0],
            [3, 'Quality of assignments and projects', 'rating', 1],
            [3, 'Teacher availability for doubts', 'rating', 2],
            [3, 'Your feedback and suggestions', 'text', 3],
            // Form 4 questions
            [4, 'Teaching quality rating', 'rating', 0],
            [4, 'Lab sessions effectiveness', 'rating', 1],
            [4, 'Comments', 'text', 2],
            // Form 5 questions
            [5, 'Overall course rating', 'rating', 0],
            [5, 'Practical knowledge gained', 'rating', 1],
            [5, 'Suggestions', 'text', 2]
        ];

        for (const [formId, questionText, questionType, questionOrder] of questions) {
            await pool.execute(
                'INSERT INTO feedback_form_questions (form_id, question_text, question_type, question_order) VALUES (?, ?, ?, ?)',
                [formId, questionText, questionType, questionOrder]
            );
        }
        console.log('✅ Created 19 feedback questions\n');

        // Insert Sample Feedback Responses
        console.log('💬 Creating sample feedback responses...');
        const responses = [
            // Student 1 (id=3) feedback for Python Programming (subject_id=11)
            [3, 1, 11, 1, null, 5],
            [3, 1, 11, 2, null, 4],
            [3, 1, 11, 3, null, 5],
            [3, 1, 11, 4, 'The hands-on coding exercises were excellent!', null],
            [3, 1, 11, 5, 'More advanced topics would be great', null],
            // Student 1 feedback for Data Structures (subject_id=1)
            [3, 1, 1, 1, null, 4],
            [3, 1, 1, 2, null, 4],
            [3, 1, 1, 3, null, 3],
            [3, 1, 1, 4, 'Good coverage of fundamental concepts', null],
            [3, 1, 1, 5, 'Need more practice problems', null],
            // Student 2 (id=4) feedback for Python Programming
            [4, 1, 11, 1, null, 5],
            [4, 1, 11, 2, null, 5],
            [4, 1, 11, 3, null, 4],
            [4, 1, 11, 4, 'Very interactive and engaging classes', null],
            [4, 1, 11, 5, 'Everything was perfect!', null],
            // Student 4 (id=6) feedback for Web Development (subject_id=3)
            [6, 2, 3, 6, null, 5],
            [6, 2, 3, 7, null, 5],
            [6, 2, 3, 8, null, 4],
            [6, 2, 3, 9, 'Loved the project-based learning approach', null],
            // Student 5 (id=7) feedback for Operating Systems (subject_id=5)
            [7, 2, 5, 6, null, 4],
            [7, 2, 5, 7, null, 3],
            [7, 2, 5, 8, null, 4],
            [7, 2, 5, 9, 'Complex topics but well explained', null]
        ];

        for (const [studentId, formId, subjectId, questionId, responseValue, rating] of responses) {
            await pool.execute(
                'INSERT INTO feedback_responses (student_id, form_id, subject_id, question_id, response_value, rating) VALUES (?, ?, ?, ?, ?, ?)',
                [studentId, formId, subjectId, questionId, responseValue, rating]
            );
        }
        console.log('✅ Created 23 sample feedback responses\n');

        // Display summary
        console.log('📊 DATABASE POPULATION SUMMARY:\n');
        const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
        const [subjects_count] = await pool.execute('SELECT COUNT(*) as count FROM subjects');
        const [courses_count] = await pool.execute('SELECT COUNT(*) as count FROM courses');
        const [enrollments_count] = await pool.execute('SELECT COUNT(*) as count FROM enrollments');
        const [forms_count] = await pool.execute('SELECT COUNT(*) as count FROM feedback_forms');
        const [responses_count] = await pool.execute('SELECT COUNT(*) as count FROM feedback_responses');

        console.log(`✅ Users: ${users[0].count}`);
        console.log(`✅ Subjects: ${subjects_count[0].count}`);
        console.log(`✅ Courses: ${courses_count[0].count}`);
        console.log(`✅ Enrollments: ${enrollments_count[0].count}`);
        console.log(`✅ Feedback Forms: ${forms_count[0].count}`);
        console.log(`✅ Feedback Responses: ${responses_count[0].count}`);

        console.log('\n🎉 Database populated successfully!\n');
        console.log('📝 LOGIN CREDENTIALS:\n');
        console.log('Admins:');
        console.log('  - admin1@gmail.com / admin@123');
        console.log('  - admin2@gmail.com / admin@123\n');
        console.log('Teachers:');
        console.log('  - teacher1@gmail.com / teacher@123');
        console.log('  - teacher2@gmail.com / teacher@123');
        console.log('  - ... (up to teacher7)\n');
        console.log('Students:');
        console.log('  - student1@gmail.com / student@123');
        console.log('  - student2@gmail.com / student@123');
        console.log('  - ... (up to student15)\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error populating database:', error);
        process.exit(1);
    }
}

populateDatabase();
