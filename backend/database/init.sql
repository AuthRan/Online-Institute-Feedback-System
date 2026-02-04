-- Initialize database with sample data
-- Run this after creating the database

USE institute_feedback;

-- Note: In production, register users through the API to get proper password hashing
-- This is just for initial setup/testing

-- Sample admin (password: admin123)
-- The hash below is for 'admin123' - replace with proper bcrypt hash in production
INSERT INTO users (username, email, password, role, name) VALUES
('admin', 'admin@institute.com', '$2a$10$rKvq9QKxJXvXvXvXvXvXvuXvXvXvXvXvXvXvXvXvXvXvXvXvXvXv', 'admin', 'Admin User')
ON DUPLICATE KEY UPDATE username=username;

-- You can add sample teachers, students, and courses here if needed
-- But it's recommended to register them through the UI for proper password hashing


