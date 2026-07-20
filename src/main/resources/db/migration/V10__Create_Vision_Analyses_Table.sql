-- Flyway Migration V10: Create Vision Analyses Table
-- Stores AI Carbon Vision Analyzer results for audit trail and history

CREATE TABLE vision_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_name VARCHAR(255),
    title VARCHAR(255),
    summary TEXT,
    detected_activities JSONB NOT NULL DEFAULT '[]',
    carbon_breakdown JSONB NOT NULL DEFAULT '{}',
    recommendations JSONB NOT NULL DEFAULT '[]',
    overall_confidence NUMERIC(4, 3),
    total_estimated_kg_co2e NUMERIC(10, 4),
    user_edits JSONB DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'completed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vision_analyses_user_id ON vision_analyses(user_id);
CREATE INDEX idx_vision_analyses_created_at ON vision_analyses(created_at DESC);
