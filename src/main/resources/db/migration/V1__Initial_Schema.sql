-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create emission_factors table
CREATE TABLE emission_factors (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    activity_type VARCHAR(100) UNIQUE NOT NULL,
    co2e_per_unit NUMERIC(10, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    activity_type VARCHAR(100) NOT NULL REFERENCES emission_factors(activity_type) ON UPDATE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    log_date DATE NOT NULL,
    calculated_emissions NUMERIC(12, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create goals table
CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_emissions NUMERIC(12, 2) NOT NULL,
    current_emissions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create badges table
CREATE TABLE badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_badges table
CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- Insert default emission factors
INSERT INTO emission_factors (category, activity_type, co2e_per_unit, unit) VALUES
('TRANSPORTATION', 'driving_petrol_car', 0.1700, 'km'),
('TRANSPORTATION', 'driving_electric_car', 0.0500, 'km'),
('TRANSPORTATION', 'public_bus', 0.0400, 'km'),
('ENERGY', 'electricity_kwh', 0.4500, 'kWh'),
('ENERGY', 'natural_gas_kwh', 0.1800, 'kWh'),
('FOOD', 'beef_serving', 6.0000, 'serving'),
('FOOD', 'chicken_serving', 1.2000, 'serving'),
('FOOD', 'vegetarian_serving', 0.5000, 'serving');

-- Insert default badges
INSERT INTO badges (name, description, icon_url) VALUES
('Eco Starter', 'Logged your first activity!', '/images/badges/eco_starter.png'),
('Carbon Clipper', 'Reduced weekly emissions by 10% compared to target.', '/images/badges/carbon_clipper.png'),
('Green Commuter', 'Logged 5 public transit or electric vehicle trips.', '/images/badges/green_commuter.png'),
('Plant-Powered', 'Logged 3 consecutive days of vegetarian meals.', '/images/badges/plant_powered.png');
