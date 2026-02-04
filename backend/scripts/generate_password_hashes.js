import bcrypt from 'bcryptjs';

// Generate hashed passwords for sample users
const passwords = {
    'admin1@123': '',
    'admin2@123': '',
    'teacher1@123': '',
    'teacher2@123': '',
    'teacher3@123': '',
    'teacher4@123': '',
    'teacher5@123': '',
    'teacher6@123': '',
    'teacher7@123': '',
    'student1@123': '',
    'student2@123': '',
    'student3@123': '',
    'student4@123': '',
    'student5@123': '',
    'student6@123': '',
    'student7@123': '',
    'student8@123': '',
    'student9@123': '',
    'student10@123': '',
    'student11@123': '',
    'student12@123': '',
    'student13@123': '',
    'student14@123': '',
    'student15@123': '',
};

async function generateHashes() {
    console.log('-- Generated Hashed Passwords for Sample Data\n');
    console.log('-- Copy these into your sample_data.sql file\n');

    for (const [password, _] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`-- Password: ${password}`);
        console.log(`'${hash}',\n`);
    }
}

generateHashes();
