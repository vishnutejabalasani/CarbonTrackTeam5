-- Flyway Migration V5: Create Badges Table
-- This table defines achievement badges for gamification and leaderboard

CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    criteria VARCHAR(255), -- The condition to earn this badge (e.g., "reduce_co2_by_25_percent")
    icon_url VARCHAR(500), -- URL or path to badge image/icon
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast badge lookups
CREATE INDEX idx_badges_name ON badges(name);

-- Insert default badges (sample data)
INSERT INTO badges (name, description, criteria, created_at)
VALUES
    ('Carbon Conscious', 'Logged activities for 7 consecutive days', 'logged_7_days_consecutive', CURRENT_TIMESTAMP),
    ('Green Champion', 'Achieved 25% reduction in carbon footprint', 'reduce_co2_by_25_percent', CURRENT_TIMESTAMP),
    ('Eco Warrior', 'Achieved 50% reduction in carbon footprint', 'reduce_co2_by_50_percent', CURRENT_TIMESTAMP),
    ('Transport Hero', 'Used public transit for all journeys in a week', 'public_transit_week', CURRENT_TIMESTAMP),
    ('Meat-Free Month', 'Logged only vegetarian/vegan meals for a full month', 'vegan_month', CURRENT_TIMESTAMP),
    ('Clean Energy Advocate', 'Switched to 100% renewable electricity', 'renewable_electricity_100', CURRENT_TIMESTAMP),
    ('Goal Getter', 'Completed 3 sustainability goals', 'completed_3_goals', CURRENT_TIMESTAMP),
    ('Community Leader', 'Ranked in top 10% of all users', 'top_10_percent', CURRENT_TIMESTAMP),
    ('First Step', 'Logged your first activity', 'first_activity', CURRENT_TIMESTAMP),
    ('Weekly Warrior', 'Logged activities every day for a week', 'daily_logging_week', CURRENT_TIMESTAMP);
