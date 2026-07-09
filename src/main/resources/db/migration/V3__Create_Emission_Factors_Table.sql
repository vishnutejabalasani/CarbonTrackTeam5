-- Flyway Migration V3: Create Emission Factors Table
-- This table stores configurable emission rules (kg CO₂e per unit)
-- Admins can update these values as IPCC/EPA datasets are revised

CREATE TABLE emission_factors (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'transport', 'electricity', 'food', 'shopping'
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'car_km', 'flight_hours', 'kwh_coal', 'meal_vegetarian'
    unit VARCHAR(50) NOT NULL, -- 'km', 'hours', 'kWh', 'servings', 'amount'
    emission_value_kg_co2e NUMERIC(10, 4) NOT NULL CHECK (emission_value_kg_co2e > 0),
    source VARCHAR(50), -- 'IPCC', 'EPA', 'Custom'
    description TEXT, -- e.g., "Average petrol car emissions per km in 2024"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for fast lookups during emission calculation
CREATE INDEX idx_emission_factors_activity_type ON emission_factors(activity_type);
CREATE INDEX idx_emission_factors_category ON emission_factors(category);
CREATE INDEX idx_emission_factors_active ON emission_factors(is_active);

-- Insert default IPCC/EPA-based emission factors (sample data)
-- Transport
INSERT INTO emission_factors (category, activity_type, unit, emission_value_kg_co2e, source, description, is_active)
VALUES
    ('transport', 'car_km_petrol', 'km', 0.21, 'IPCC', 'Average petrol car emissions per km', true),
    ('transport', 'car_km_diesel', 'km', 0.19, 'IPCC', 'Average diesel car emissions per km', true),
    ('transport', 'car_km_electric', 'km', 0.05, 'IPCC', 'Electric vehicle emissions per km (grid avg)', true),
    ('transport', 'flight_short_hours', 'hours', 90.5, 'EPA', 'Short-haul flight emissions per hour', true),
    ('transport', 'flight_long_hours', 'hours', 106.7, 'EPA', 'Long-haul flight emissions per hour', true),
    ('transport', 'public_transit_km', 'km', 0.05, 'EPA', 'Public transit emissions per km', true),

-- Electricity
    ('electricity', 'kwh_coal', 'kWh', 0.95, 'EPA', 'Electricity from coal power plant', true),
    ('electricity', 'kwh_natural_gas', 'kWh', 0.45, 'EPA', 'Electricity from natural gas', true),
    ('electricity', 'kwh_renewable', 'kWh', 0.05, 'EPA', 'Electricity from renewable sources', true),
    ('electricity', 'kwh_grid_avg', 'kWh', 0.38, 'EPA', 'Average grid electricity (mixed sources)', true),

-- Food
    ('food', 'meal_beef', 'servings', 6.61, 'IPCC', 'Beef meal emissions per serving', true),
    ('food', 'meal_chicken', 'servings', 1.26, 'IPCC', 'Chicken meal emissions per serving', true),
    ('food', 'meal_vegetarian', 'servings', 0.51, 'IPCC', 'Vegetarian meal emissions per serving', true),
    ('food', 'meal_vegan', 'servings', 0.29, 'IPCC', 'Vegan meal emissions per serving', true),

-- Shopping
    ('shopping', 'clothing_purchase', 'amount', 0.12, 'Custom', 'Clothing purchase emissions per GBP/USD', true),
    ('shopping', 'electronics_purchase', 'amount', 0.25, 'Custom', 'Electronics purchase emissions per GBP/USD', true),
    ('shopping', 'household_goods', 'amount', 0.08, 'Custom', 'Household goods emissions per GBP/USD', true);
