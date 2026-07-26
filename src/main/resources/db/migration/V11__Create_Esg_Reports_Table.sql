-- Flyway Migration V11: Create ESG Reports Table
-- Stores saved ESG reports and analytics historical records

CREATE TABLE IF NOT EXISTS esg_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL DEFAULT 'CarbonTrack Enterprise',
    report_title VARCHAR(255) NOT NULL DEFAULT 'Annual ESG Performance & Sustainability Audit',
    audit_date DATE NOT NULL,
    generated_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    overall_esg_score NUMERIC(5, 2) NOT NULL DEFAULT 88.50,
    total_carbon_emissions NUMERIC(10, 2) NOT NULL DEFAULT 0,
    weekly_emissions NUMERIC(10, 2) NOT NULL DEFAULT 0,
    monthly_emissions NUMERIC(10, 2) NOT NULL DEFAULT 0,
    category_emissions_json TEXT,
    social_employee_metrics_json TEXT,
    social_community_metrics_json TEXT,
    governance_metrics_json TEXT,
    audit_score NUMERIC(5, 2) NOT NULL DEFAULT 92.00,
    recommendations_json TEXT,
    charts_summary_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_esg_reports_user_id ON esg_reports(user_id);
CREATE INDEX idx_esg_reports_created_at ON esg_reports(created_at DESC);
