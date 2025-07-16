-- Video KYC Employee Performance Database Schema
-- This script creates tables and seeds data for Apache Superset integration

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    team_id INTEGER,
    hire_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    call_id VARCHAR(100) UNIQUE NOT NULL,
    employee_id VARCHAR(50) REFERENCES employees(employee_id),
    customer_id VARCHAR(100),
    call_start_time TIMESTAMP NOT NULL,
    call_end_time TIMESTAMP,
    duration_minutes DECIMAL(5,2),
    status VARCHAR(20) NOT NULL, -- 'completed', 'failed', 'abandoned'
    success_rate DECIMAL(5,2),
    verification_type VARCHAR(50), -- 'document', 'biometric', 'identity', 'compliance'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create errors table
CREATE TABLE IF NOT EXISTS call_errors (
    id SERIAL PRIMARY KEY,
    call_id VARCHAR(100) REFERENCES calls(call_id),
    error_type VARCHAR(100) NOT NULL,
    error_code VARCHAR(20),
    error_description TEXT,
    resolution_time_minutes DECIMAL(5,2),
    resolved BOOLEAN DEFAULT FALSE,
    resolution_method VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(employee_id),
    metric_date DATE NOT NULL,
    total_calls INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    avg_call_duration DECIMAL(5,2),
    success_rate DECIMAL(5,2),
    error_rate DECIMAL(5,2),
    proficiency_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, metric_date)
);

-- Insert sample employees
INSERT INTO employees (employee_id, name, email, role, team_id, hire_date) VALUES
('EMP001', 'Sarah Wilson', 'sarah.wilson@company.com', 'Senior KYC Specialist', 1, '2022-01-15'),
('EMP002', 'Mike Johnson', 'mike.johnson@company.com', 'KYC Specialist', 1, '2022-03-20'),
('EMP003', 'Emily Chen', 'emily.chen@company.com', 'KYC Specialist', 1, '2022-06-10'),
('EMP004', 'David Brown', 'david.brown@company.com', 'Junior KYC Specialist', 2, '2023-01-05'),
('EMP005', 'Lisa Anderson', 'lisa.anderson@company.com', 'KYC Specialist', 2, '2022-09-12');

-- Insert sample calls data for the last 30 days
INSERT INTO calls (call_id, employee_id, customer_id, call_start_time, call_end_time, duration_minutes, status, success_rate, verification_type)
SELECT 
    'CALL_' || generate_series || '_' || employee_id,
    employee_id,
    'CUST_' || (random() * 10000)::int,
    CURRENT_DATE - (random() * 30)::int + (random() * 24)::int * INTERVAL '1 hour',
    CURRENT_DATE - (random() * 30)::int + (random() * 24)::int * INTERVAL '1 hour' + (5 + random() * 10) * INTERVAL '1 minute',
    5 + random() * 10,
    CASE WHEN random() > 0.1 THEN 'completed' ELSE 'failed' END,
    85 + random() * 15,
    (ARRAY['document', 'biometric', 'identity', 'compliance'])[floor(random() * 4 + 1)]
FROM generate_series(1, 50) 
CROSS JOIN (SELECT employee_id FROM employees) e;

-- Insert sample error data
INSERT INTO call_errors (call_id, error_type, error_code, error_description, resolution_time_minutes, resolved, resolution_method)
SELECT 
    call_id,
    (ARRAY['Document Quality Issues', 'Network Connectivity', 'Identity Verification Failed', 'System Timeout', 'Audio/Video Issues'])[floor(random() * 5 + 1)],
    'ERR_' || (100 + random() * 900)::int,
    'Sample error description for testing purposes',
    random() * 10,
    random() > 0.2,
    CASE WHEN random() > 0.2 THEN 'Manual Resolution' ELSE NULL END
FROM calls 
WHERE status = 'failed'
LIMIT 100;

-- Insert daily performance metrics
INSERT INTO performance_metrics (employee_id, metric_date, total_calls, successful_calls, failed_calls, avg_call_duration, success_rate, error_rate, proficiency_score)
SELECT 
    e.employee_id,
    d.metric_date,
    (10 + random() * 40)::int as total_calls,
    (8 + random() * 35)::int as successful_calls,
    (0 + random() * 5)::int as failed_calls,
    6 + random() * 4 as avg_call_duration,
    85 + random() * 15 as success_rate,
    random() * 15 as error_rate,
    80 + random() * 20 as proficiency_score
FROM employees e
CROSS JOIN (
    SELECT CURRENT_DATE - generate_series(0, 29) as metric_date
) d;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calls_employee_id ON calls(employee_id);
CREATE INDEX IF NOT EXISTS idx_calls_start_time ON calls(call_start_time);
CREATE INDEX IF NOT EXISTS idx_errors_call_id ON call_errors(call_id);
CREATE INDEX IF NOT EXISTS idx_performance_employee_date ON performance_metrics(employee_id, metric_date);

-- Create views for Superset dashboards
CREATE OR REPLACE VIEW employee_daily_summary AS
SELECT 
    e.name as employee_name,
    e.role,
    pm.metric_date,
    pm.total_calls,
    pm.successful_calls,
    pm.failed_calls,
    pm.success_rate,
    pm.error_rate,
    pm.proficiency_score,
    pm.avg_call_duration
FROM performance_metrics pm
JOIN employees e ON pm.employee_id = e.employee_id
WHERE e.status = 'active';

CREATE OR REPLACE VIEW error_analysis_summary AS
SELECT 
    ce.error_type,
    COUNT(*) as error_count,
    AVG(ce.resolution_time_minutes) as avg_resolution_time,
    COUNT(CASE WHEN ce.resolved THEN 1 END) as resolved_count,
    ROUND(COUNT(CASE WHEN ce.resolved THEN 1 END) * 100.0 / COUNT(*), 2) as resolution_rate
FROM call_errors ce
JOIN calls c ON ce.call_id = c.call_id
WHERE c.call_start_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ce.error_type
ORDER BY error_count DESC;

CREATE OR REPLACE VIEW hourly_call_distribution AS
SELECT 
    EXTRACT(HOUR FROM call_start_time) as call_hour,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_calls,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_calls,
    AVG(duration_minutes) as avg_duration
FROM calls
WHERE call_start_time >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM call_start_time)
ORDER BY call_hour;
