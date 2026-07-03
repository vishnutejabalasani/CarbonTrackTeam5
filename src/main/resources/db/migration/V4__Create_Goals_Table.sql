-- Flyway Migration V4: Create Goals Table
-- This table tracks user sustainability goals and progress

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_reduction_percentage NUMERIC(5, 2) NOT NULL CHECK (target_reduction_percentage > 0 AND target_reduction_percentage <= 100),
    category VARCHAR(50), -- Optional: specific category like 'transport', or NULL for all categories
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'abandoned', 'paused'
    progress_percentage NUMERIC(5, 2) DEFAULT 0, -- Current reduction % achieved
    on_track BOOLEAN DEFAULT true, -- Whether user is on pace to meet goal
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_goals_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_end_date ON goals(end_date);
