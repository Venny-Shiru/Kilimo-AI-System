-- Seed data for Kilimo(Agri)protect AI Dashboard
-- This script populates the database with sample data for testing

-- Insert sample environmental data for different regions
INSERT INTO public.environmental_data (region_id, region_name, latitude, longitude, ndvi_value, soil_health_score, erosion_risk_level, land_use_type, degradation_level, data_source) VALUES
('KE-001', 'Nairobi Region', -1.2921, 36.8219, 0.65, 72.5, 'moderate', 'agricultural', 'moderate', 'satellite'),
('KE-002', 'Mombasa Coastal', -4.0435, 39.6682, 0.45, 58.3, 'high', 'mixed', 'high', 'satellite'),
('KE-003', 'Rift Valley', -0.2827, 36.0800, 0.72, 78.2, 'low', 'agricultural', 'low', 'satellite'),
('KE-004', 'Western Highlands', 0.5143, 34.4514, 0.68, 75.8, 'moderate', 'forest', 'moderate', 'satellite'),
('KE-005', 'Eastern Arid', 1.5177, 38.5622, 0.32, 42.1, 'severe', 'rangeland', 'severe', 'satellite'),
('KE-006', 'Central Kenya', -0.4172, 36.9566, 0.58, 65.4, 'moderate', 'agricultural', 'moderate', 'satellite'),
('KE-007', 'Nyanza Region', -0.0917, 34.7680, 0.61, 68.9, 'moderate', 'agricultural', 'moderate', 'satellite'),
('KE-008', 'Coast Province', -3.2194, 40.1169, 0.48, 55.7, 'high', 'coastal', 'high', 'satellite');

-- Insert historical data for trend analysis
INSERT INTO public.environmental_data (region_id, region_name, latitude, longitude, ndvi_value, soil_health_score, erosion_risk_level, degradation_level, measurement_date, data_source) VALUES
('KE-001', 'Nairobi Region', -1.2921, 36.8219, 0.70, 75.0, 'low', 'low', NOW() - INTERVAL '6 months', 'satellite'),
('KE-001', 'Nairobi Region', -1.2921, 36.8219, 0.68, 73.5, 'moderate', 'moderate', NOW() - INTERVAL '3 months', 'satellite'),
('KE-002', 'Mombasa Coastal', -4.0435, 39.6682, 0.52, 62.0, 'moderate', 'moderate', NOW() - INTERVAL '6 months', 'satellite'),
('KE-002', 'Mombasa Coastal', -4.0435, 39.6682, 0.48, 60.1, 'high', 'high', NOW() - INTERVAL '3 months', 'satellite');

-- Insert sample sensor data
INSERT INTO public.sensor_data (sensor_id, region_id, latitude, longitude, sensor_type, reading_value, unit, timestamp) VALUES
('SENSOR-001', 'KE-001', -1.2921, 36.8219, 'soil_moisture', 35.5, 'percentage', NOW() - INTERVAL '1 hour'),
('SENSOR-002', 'KE-001', -1.2921, 36.8219, 'temperature', 24.3, 'celsius', NOW() - INTERVAL '1 hour'),
('SENSOR-003', 'KE-002', -4.0435, 39.6682, 'soil_moisture', 28.2, 'percentage', NOW() - INTERVAL '2 hours'),
('SENSOR-004', 'KE-003', -0.2827, 36.0800, 'rainfall', 12.5, 'mm', NOW() - INTERVAL '3 hours');

-- Note: Restoration projects, techniques, and notifications will be created by users through the application
-- Sample restoration project (commented out - will be created via API)
-- INSERT INTO public.restoration_projects (project_name, region_id, region_name, area_hectares, status, budget_allocated, success_rate_estimate) VALUES
-- ('Mombasa Coastal Restoration', 'KE-002', 'Mombasa Coastal', 150.5, 'planned', 250000.00, 75.0);
