import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateSchema() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'institute_feedback'
        });

        console.log('Connected to database.');

        // Check if column exists
        const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'feedback_form_questions' AND COLUMN_NAME = 'options'
    `, [process.env.DB_NAME || 'institute_feedback']);

        if (columns.length === 0) {
            console.log('Adding options column...');
            await connection.execute(`
        ALTER TABLE feedback_form_questions
        ADD COLUMN options TEXT
      `);
            console.log('Column added successfully.');
        } else {
            console.log('Column options already exists.');
        }

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
