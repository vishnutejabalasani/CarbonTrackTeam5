-- Flyway Migration V2: Create Activity Logs Table
-- This table stores every activity a user logs (transport, electricity, food, shopping)

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'transport', 'electricity', 'food', 'shopping'
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'car_km', 'flight_hours', 'kwh', 'meal_vegetarian'
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL, -- 'km', 'hours', 'kWh', 'servings', 'amount'
    log_date DATE NOT NULL,
    calculated_emissions_kg_co2e NUMERIC(10, 4), -- kg CO₂e calculated from quantity × emission_factor
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_activity_logs_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for efficient queries
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_log_date ON activity_logs(log_date);
CREATE INDEX idx_activity_logs_category ON activity_logs(category);
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, log_date); -- Composite for aggregation queries
