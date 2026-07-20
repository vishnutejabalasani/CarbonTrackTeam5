-- Flyway Migration V9: Insert Milestone 2 Badges
INSERT INTO badges (name, description, criteria, created_at)
VALUES
    ('First Goal Achieved', 'Completed your first carbon reduction goal', 'first_goal_completed', CURRENT_TIMESTAMP),
    ('Carbon Saver 10kg', 'Reduced absolute carbon emissions by 10 kg CO2e', 'reduce_co2_10kg', CURRENT_TIMESTAMP),
    ('Carbon Saver 25kg', 'Reduced absolute carbon emissions by 25 kg CO2e', 'reduce_co2_25kg', CURRENT_TIMESTAMP),
    ('Carbon Saver 50kg', 'Reduced absolute carbon emissions by 50 kg CO2e', 'reduce_co2_50kg', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;
