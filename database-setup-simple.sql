-- Code Analysis Database Tables (Simple Version)
-- Run this script in your Supabase SQL editor

-- 1. Function Analysis Table
CREATE TABLE IF NOT EXISTS function_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  function_type TEXT NOT NULL,
  complexity TEXT CHECK (complexity IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id, name, line_number)
);

-- 2. Component Analysis Table
CREATE TABLE IF NOT EXISTS component_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  props TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  used_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id, name)
);

-- 3. Algorithm Analysis Table
CREATE TABLE IF NOT EXISTS algorithm_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  complexity TEXT CHECK (complexity IN ('Low', 'Medium', 'High')),
  implementation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id, name, line_number)
);

-- 4. Data Flow Analysis Table
CREATE TABLE IF NOT EXISTS data_flow_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  from_component TEXT NOT NULL,
  to_component TEXT NOT NULL,
  flow_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, from_component, to_component)
);

-- 5. Entry Point Analysis Table
CREATE TABLE IF NOT EXISTS entry_point_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  purpose TEXT NOT NULL,
  importance TEXT CHECK (importance IN ('Low', 'Medium', 'High', 'Critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_function_analysis_project_id ON function_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_function_analysis_file_id ON function_analysis(file_id);

CREATE INDEX IF NOT EXISTS idx_component_analysis_project_id ON component_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_component_analysis_file_id ON component_analysis(file_id);

CREATE INDEX IF NOT EXISTS idx_algorithm_analysis_project_id ON algorithm_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_algorithm_analysis_file_id ON algorithm_analysis(file_id);

CREATE INDEX IF NOT EXISTS idx_data_flow_analysis_project_id ON data_flow_analysis(project_id);

CREATE INDEX IF NOT EXISTS idx_entry_point_analysis_project_id ON entry_point_analysis(project_id);
CREATE INDEX IF NOT EXISTS idx_entry_point_analysis_file_id ON entry_point_analysis(file_id);

-- No RLS policies needed since projects table doesn't have user restrictions
-- Tables will inherit the same access pattern as your existing setup 