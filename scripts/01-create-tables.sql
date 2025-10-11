-- Kilimo(Agri)protect AI Database Schema
-- This script creates all necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'analyst', 'viewer')),
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Environmental monitoring data
CREATE TABLE IF NOT EXISTS public.environmental_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  region_id TEXT NOT NULL,
  region_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  ndvi_value DECIMAL(4, 3), -- Normalized Difference Vegetation Index (-1 to 1)
  soil_health_score DECIMAL(5, 2), -- 0-100 score
  erosion_risk_level TEXT CHECK (erosion_risk_level IN ('low', 'moderate', 'high', 'severe')),
  land_use_type TEXT,
  degradation_level TEXT CHECK (degradation_level IN ('none', 'low', 'moderate', 'high', 'severe')),
  measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source TEXT, -- 'satellite', 'sensor', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restoration projects
CREATE TABLE IF NOT EXISTS public.restoration_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_name TEXT NOT NULL,
  region_id TEXT NOT NULL,
  region_name TEXT NOT NULL,
  area_hectares DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold')),
  start_date DATE,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  budget_allocated DECIMAL(12, 2),
  budget_spent DECIMAL(12, 2) DEFAULT 0,
  success_rate_estimate DECIMAL(5, 2), -- 0-100 percentage
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restoration techniques for projects
CREATE TABLE IF NOT EXISTS public.restoration_techniques (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.restoration_projects(id) ON DELETE CASCADE,
  technique_type TEXT NOT NULL, -- 'planting', 'soil_conservation', 'water_management'
  technique_name TEXT NOT NULL,
  description TEXT,
  estimated_cost DECIMAL(10, 2),
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plant species recommendations
CREATE TABLE IF NOT EXISTS public.plant_species (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.restoration_projects(id) ON DELETE CASCADE,
  species_name TEXT NOT NULL,
  scientific_name TEXT,
  quantity INTEGER,
  survival_rate_estimate DECIMAL(5, 2), -- 0-100 percentage
  cost_per_unit DECIMAL(8, 2),
  planting_season TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications and alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('alert', 'update', 'success', 'warning')),
  category TEXT NOT NULL CHECK (category IN ('degradation', 'project', 'data', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_id UUID, -- Can reference project_id or region_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IoT Sensor data (for real-time monitoring)
CREATE TABLE IF NOT EXISTS public.sensor_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  region_id TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  sensor_type TEXT NOT NULL, -- 'soil_moisture', 'temperature', 'rainfall'
  reading_value DECIMAL(10, 4) NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_environmental_data_region ON public.environmental_data(region_id);
CREATE INDEX IF NOT EXISTS idx_environmental_data_date ON public.environmental_data(measurement_date);
CREATE INDEX IF NOT EXISTS idx_restoration_projects_status ON public.restoration_projects(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_sensor_data_region ON public.sensor_data(region_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restoration_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restoration_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for environmental_data
CREATE POLICY "Anyone can view environmental data" ON public.environmental_data FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert environmental data" ON public.environmental_data FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- RLS Policies for restoration_projects
CREATE POLICY "Anyone can view restoration projects" ON public.restoration_projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create projects" ON public.restoration_projects FOR INSERT 
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Project creators and admins can update projects" ON public.restoration_projects FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);
