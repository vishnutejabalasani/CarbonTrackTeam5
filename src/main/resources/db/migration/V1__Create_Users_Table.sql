-- Flyway Migration V1: Create Users Table
-- This is the foundational table for user authentication and profile management

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    preferred_unit VARCHAR(20) DEFAULT 'metric', -- 'metric' or 'imperial'
    goal_visibility VARCHAR(20) DEFAULT 'private', -- 'public', 'private', 'friends'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create index on email for faster login queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
