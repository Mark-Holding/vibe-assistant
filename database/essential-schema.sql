-- Essential tables for Vibe Code Analyzer
-- Run this in your Supabase SQL Editor

-- Files table - stores file metadata and analysis results
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    file_type VARCHAR(100),
    extension VARCHAR(20),
    content_hash VARCHAR(64),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Analysis results
    category VARCHAR(100),
    importance_score DECIMAL(3,2) DEFAULT 0,
    lines_of_code INTEGER DEFAULT 0,
    function_count INTEGER DEFAULT 0,
    component_count INTEGER DEFAULT 0,
    import_count INTEGER DEFAULT 0,
    export_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- File characteristics
    is_entry_point BOOLEAN DEFAULT FALSE,
    is_test_file BOOLEAN DEFAULT FALSE,
    is_config_file BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(project_id, relative_path)
);

-- File contents table - stores actual file content
CREATE TABLE IF NOT EXISTS file_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One content per file
    UNIQUE(file_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_relative_path ON files(relative_path);
CREATE INDEX IF NOT EXISTS idx_files_content_hash ON files(content_hash);
CREATE INDEX IF NOT EXISTS idx_file_contents_file_id ON file_contents(file_id);

-- Enable Row Level Security (optional)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_contents ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on files" ON files FOR ALL USING (true);
CREATE POLICY "Allow all operations on file_contents" ON file_contents FOR ALL USING (true); 