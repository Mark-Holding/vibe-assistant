-- =====================================================
-- VIBE CODE ANALYZER - SUPABASE DATABASE SCHEMA
-- =====================================================
-- This schema supports incremental codebase analysis
-- with efficient storage and retrieval of analysis results
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- CORE ENTITIES
-- =====================================================

-- Projects table - represents a codebase/project
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repository_url VARCHAR(500),
    main_branch VARCHAR(100) DEFAULT 'main',
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    total_files INTEGER DEFAULT 0,
    total_loc INTEGER DEFAULT 0,
    total_functions INTEGER DEFAULT 0,
    total_components INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table - stores individual file information
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    relative_path TEXT NOT NULL, -- path relative to project root
    size_bytes BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'JavaScript', 'TypeScript', 'CSS', etc.
    extension VARCHAR(10) NOT NULL,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for change detection
    last_modified TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(50), -- 'component', 'page', 'utility', 'config', etc.
    importance_score INTEGER DEFAULT 0, -- 0-10 importance rating
    lines_of_code INTEGER DEFAULT 0,
    function_count INTEGER DEFAULT 0,
    component_count INTEGER DEFAULT 0,
    import_count INTEGER DEFAULT 0,
    export_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_entry_point BOOLEAN DEFAULT FALSE,
    is_test_file BOOLEAN DEFAULT FALSE,
    is_config_file BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, relative_path)
);

-- File content table - stores actual file content (separate for performance)
CREATE TABLE file_contents (
    file_id UUID PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_compressed BYTEA, -- Optional: compressed content for large files
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CODE ANALYSIS ENTITIES
-- =====================================================

-- Functions table - extracted functions from code
CREATE TABLE functions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    line_number INTEGER NOT NULL,
    end_line_number INTEGER,
    function_type VARCHAR(50) NOT NULL, -- 'function', 'arrow', 'async', 'method', etc.
    purpose TEXT,
    complexity VARCHAR(20), -- 'low', 'medium', 'high'
    parameters JSONB, -- Array of parameter objects
    return_type VARCHAR(100),
    is_exported BOOLEAN DEFAULT FALSE,
    is_async BOOLEAN DEFAULT FALSE,
    is_generator BOOLEAN DEFAULT FALSE,
    cyclomatic_complexity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Components table - React/Vue components
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    component_type VARCHAR(50) NOT NULL, -- 'functional', 'class', 'hook', etc.
    purpose TEXT,
    props JSONB, -- Array of prop definitions
    dependencies JSONB, -- Array of component dependencies
    used_by JSONB, -- Array of components that use this one
    hooks_used JSONB, -- Array of React hooks used
    is_exported BOOLEAN DEFAULT FALSE,
    is_default_export BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Algorithms table - detected algorithms and patterns
CREATE TABLE algorithms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    line_number INTEGER NOT NULL,
    algorithm_type VARCHAR(100), -- 'sort', 'search', 'optimization', etc.
    purpose TEXT,
    time_complexity VARCHAR(50), -- 'O(n)', 'O(log n)', etc.
    space_complexity VARCHAR(50),
    implementation_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entry points table - application entry points
CREATE TABLE entry_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    entry_type VARCHAR(50) NOT NULL, -- 'app_root', 'page', 'api_endpoint', etc.
    purpose TEXT,
    importance VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    route_path VARCHAR(500), -- For pages/routes
    http_methods JSONB, -- For API endpoints
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DEPENDENCY & RELATIONSHIP ENTITIES
-- =====================================================

-- Dependencies table - file-to-file dependencies
CREATE TABLE dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source_file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    target_file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL, -- 'import', 'export', 'dynamic', 'require'
    import_statement TEXT, -- The actual import statement
    imported_items JSONB, -- What was imported (functions, components, etc.)
    is_external BOOLEAN DEFAULT FALSE, -- Whether it's an external dependency
    weight INTEGER DEFAULT 1, -- Dependency strength/frequency
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(source_file_id, target_file_id, dependency_type)
);

-- Data flow table - tracks data flow between components/functions
CREATE TABLE data_flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    from_entity VARCHAR(255) NOT NULL, -- Source entity name
    to_entity VARCHAR(255) NOT NULL, -- Target entity name
    from_file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    to_file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    flow_type VARCHAR(50) NOT NULL, -- 'event', 'data', 'context', 'props', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DESIGN SYSTEM ENTITIES
-- =====================================================

-- Colors table - extracted color palette
CREATE TABLE colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    hex_value VARCHAR(7) NOT NULL, -- #RRGGBB format
    rgb_value VARCHAR(20), -- rgb(r,g,b) format
    hsl_value VARCHAR(20), -- hsl(h,s,l) format
    usage_count INTEGER DEFAULT 1,
    locations JSONB, -- Array of file paths where this color is used
    color_category VARCHAR(50), -- 'primary', 'secondary', 'accent', 'neutral', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, hex_value)
);

-- Typography table - font families and typography rules
CREATE TABLE typography (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    font_family VARCHAR(255) NOT NULL,
    font_weights JSONB, -- Array of available weights
    font_sizes JSONB, -- Array of used font sizes
    line_heights JSONB, -- Array of line heights
    usage_description TEXT,
    locations JSONB, -- Array of file paths where this typography is defined
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spacing table - spacing system values
CREATE TABLE spacing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100), -- 'small', 'medium', 'large', etc.
    size_value VARCHAR(20) NOT NULL, -- '16px', '1rem', etc.
    pixels INTEGER NOT NULL, -- Converted to pixels for comparison
    usage_description TEXT,
    usage_count INTEGER DEFAULT 1,
    spacing_category VARCHAR(50), -- 'margin', 'padding', 'gap', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, size_value)
);

-- Component styles table - reusable component styles
CREATE TABLE component_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    style_type VARCHAR(50) NOT NULL, -- 'button', 'card', 'form', 'layout', etc.
    variants JSONB, -- Array of style variants
    css_properties JSONB, -- Key CSS properties and values
    usage_description TEXT,
    locations JSONB, -- Array of file paths where this style is defined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ARCHITECTURE & STRUCTURE ENTITIES
-- =====================================================

-- Architecture nodes table - high-level architecture components
CREATE TABLE architecture_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    node_type VARCHAR(50) NOT NULL, -- 'service', 'component', 'page', 'utility', 'config', 'group'
    level INTEGER NOT NULL, -- Hierarchy level (1 = top level)
    file_count INTEGER DEFAULT 0,
    files JSONB, -- Array of file paths in this node
    connections JSONB, -- Array of connected node IDs
    position_x FLOAT DEFAULT 0, -- For visualization
    position_y FLOAT DEFAULT 0,
    width FLOAT DEFAULT 100,
    height FLOAT DEFAULT 50,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File tree table - hierarchical file structure
CREATE TABLE file_tree_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES file_tree_nodes(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE, -- NULL for folders
    name VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    node_type VARCHAR(10) NOT NULL CHECK (node_type IN ('file', 'folder')),
    depth INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYSIS SESSIONS & CACHING
-- =====================================================

-- Analysis sessions table - tracks analysis runs
CREATE TABLE analysis_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'partial'
    status VARCHAR(20) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed'
    files_processed INTEGER DEFAULT 0,
    files_added INTEGER DEFAULT 0,
    files_modified INTEGER DEFAULT 0,
    files_deleted INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    error_message TEXT,
    metadata JSONB, -- Additional session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis cache table - for expensive computations
CREATE TABLE analysis_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) NOT NULL,
    cache_type VARCHAR(50) NOT NULL, -- 'file_analysis', 'dependency_graph', etc.
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(cache_key, cache_type)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Project indexes
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_last_analyzed ON projects(last_analyzed_at);

-- File indexes
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_path ON files(path);
CREATE INDEX idx_files_relative_path ON files(relative_path);
CREATE INDEX idx_files_content_hash ON files(content_hash);
CREATE INDEX idx_files_file_type ON files(file_type);
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_last_modified ON files(last_modified);
CREATE INDEX idx_files_importance ON files(importance_score DESC);

-- Function indexes
CREATE INDEX idx_functions_file_id ON functions(file_id);
CREATE INDEX idx_functions_name ON functions(name);
CREATE INDEX idx_functions_type ON functions(function_type);

-- Component indexes
CREATE INDEX idx_components_file_id ON components(file_id);
CREATE INDEX idx_components_name ON components(name);
CREATE INDEX idx_components_type ON components(component_type);

-- Dependency indexes
CREATE INDEX idx_dependencies_project_id ON dependencies(project_id);
CREATE INDEX idx_dependencies_source_file ON dependencies(source_file_id);
CREATE INDEX idx_dependencies_target_file ON dependencies(target_file_id);
CREATE INDEX idx_dependencies_type ON dependencies(dependency_type);

-- Design system indexes
CREATE INDEX idx_colors_project_id ON colors(project_id);
CREATE INDEX idx_colors_hex ON colors(hex_value);
CREATE INDEX idx_typography_project_id ON typography(project_id);
CREATE INDEX idx_spacing_project_id ON spacing(project_id);
CREATE INDEX idx_spacing_pixels ON spacing(pixels);

-- Architecture indexes
CREATE INDEX idx_architecture_nodes_project_id ON architecture_nodes(project_id);
CREATE INDEX idx_architecture_nodes_type ON architecture_nodes(node_type);
CREATE INDEX idx_architecture_nodes_level ON architecture_nodes(level);

-- File tree indexes
CREATE INDEX idx_file_tree_project_id ON file_tree_nodes(project_id);
CREATE INDEX idx_file_tree_parent_id ON file_tree_nodes(parent_id);
CREATE INDEX idx_file_tree_path ON file_tree_nodes(path);

-- Analysis session indexes
CREATE INDEX idx_analysis_sessions_project_id ON analysis_sessions(project_id);
CREATE INDEX idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX idx_analysis_sessions_started_at ON analysis_sessions(started_at);

-- Cache indexes
CREATE INDEX idx_analysis_cache_key ON analysis_cache(cache_key);
CREATE INDEX idx_analysis_cache_type ON analysis_cache(cache_type);
CREATE INDEX idx_analysis_cache_project_id ON analysis_cache(project_id);
CREATE INDEX idx_analysis_cache_expires_at ON analysis_cache(expires_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_contents_updated_at BEFORE UPDATE ON file_contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_functions_updated_at BEFORE UPDATE ON functions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_algorithms_updated_at BEFORE UPDATE ON algorithms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entry_points_updated_at BEFORE UPDATE ON entry_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dependencies_updated_at BEFORE UPDATE ON dependencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_flows_updated_at BEFORE UPDATE ON data_flows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_colors_updated_at BEFORE UPDATE ON colors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_typography_updated_at BEFORE UPDATE ON typography FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spacing_updated_at BEFORE UPDATE ON spacing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_component_styles_updated_at BEFORE UPDATE ON component_styles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_architecture_nodes_updated_at BEFORE UPDATE ON architecture_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_tree_nodes_updated_at BEFORE UPDATE ON file_tree_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Project summary view
CREATE VIEW project_summary AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.repository_url,
    p.main_branch,
    p.last_analyzed_at,
    p.total_files,
    p.total_loc,
    p.total_functions,
    p.total_components,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT f.id) as actual_file_count,
    COUNT(DISTINCT fn.id) as actual_function_count,
    COUNT(DISTINCT c.id) as actual_component_count,
    COUNT(DISTINCT d.id) as actual_dependency_count,
    COUNT(DISTINCT col.id) as actual_color_count
FROM projects p
LEFT JOIN files f ON p.id = f.project_id
LEFT JOIN functions fn ON f.id = fn.file_id
LEFT JOIN components c ON f.id = c.file_id
LEFT JOIN dependencies d ON p.id = d.project_id
LEFT JOIN colors col ON p.id = col.project_id
GROUP BY p.id;

-- File analysis view
CREATE VIEW file_analysis AS
SELECT 
    f.id,
    f.project_id,
    f.name,
    f.path,
    f.relative_path,
    f.size_bytes,
    f.file_type,
    f.extension,
    f.content_hash,
    f.last_modified,
    f.category,
    f.importance_score,
    f.lines_of_code,
    f.function_count,
    f.component_count,
    f.import_count,
    f.export_count,
    f.comment_count,
    f.is_entry_point,
    f.is_test_file,
    f.is_config_file,
    f.created_at,
    f.updated_at,
    COUNT(DISTINCT fn.id) as actual_function_count,
    COUNT(DISTINCT c.id) as actual_component_count,
    COUNT(DISTINCT d_out.id) as outgoing_dependency_count,
    COUNT(DISTINCT d_in.id) as incoming_dependency_count
FROM files f
LEFT JOIN functions fn ON f.id = fn.file_id
LEFT JOIN components c ON f.id = c.file_id
LEFT JOIN dependencies d_out ON f.id = d_out.source_file_id
LEFT JOIN dependencies d_in ON f.id = d_in.target_file_id
GROUP BY f.id;

-- =====================================================
-- FUNCTIONS FOR INCREMENTAL ANALYSIS
-- =====================================================

-- Function to detect changed files based on content hash
CREATE OR REPLACE FUNCTION get_changed_files(
    p_project_id UUID,
    p_file_data JSONB -- Array of {path, content_hash, last_modified}
)
RETURNS TABLE(
    action VARCHAR(10), -- 'insert', 'update', 'delete'
    file_path TEXT,
    existing_file_id UUID
) AS $$
BEGIN
    -- Return files that need to be inserted (new files)
    RETURN QUERY
    SELECT 
        'insert'::VARCHAR(10) as action,
        (file_info->>'path')::TEXT as file_path,
        NULL::UUID as existing_file_id
    FROM jsonb_array_elements(p_file_data) as file_info
    WHERE NOT EXISTS (
        SELECT 1 FROM files f 
        WHERE f.project_id = p_project_id 
        AND f.relative_path = (file_info->>'path')::TEXT
    );
    
    -- Return files that need to be updated (content hash changed)
    RETURN QUERY
    SELECT 
        'update'::VARCHAR(10) as action,
        (file_info->>'path')::TEXT as file_path,
        f.id as existing_file_id
    FROM jsonb_array_elements(p_file_data) as file_info
    JOIN files f ON f.project_id = p_project_id 
        AND f.relative_path = (file_info->>'path')::TEXT
    WHERE f.content_hash != (file_info->>'content_hash')::TEXT;
    
    -- Return files that need to be deleted (exist in DB but not in new data)
    RETURN QUERY
    SELECT 
        'delete'::VARCHAR(10) as action,
        f.relative_path as file_path,
        f.id as existing_file_id
    FROM files f
    WHERE f.project_id = p_project_id
    AND NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(p_file_data) as file_info
        WHERE (file_info->>'path')::TEXT = f.relative_path
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA INSERTION FUNCTION
-- =====================================================

-- Function to create a sample project (useful for testing)
CREATE OR REPLACE FUNCTION create_sample_project()
RETURNS UUID AS $$
DECLARE
    project_id UUID;
BEGIN
    INSERT INTO projects (name, description)
    VALUES ('Sample React App', 'A sample React application for testing')
    RETURNING id INTO project_id;
    
    RETURN project_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up old analysis cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analysis_cache 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE projects IS 'Main projects/codebases being analyzed';
COMMENT ON TABLE files IS 'Individual files within projects with metadata';
COMMENT ON TABLE file_contents IS 'Actual file content, separated for performance';
COMMENT ON TABLE functions IS 'Extracted functions from code files';
COMMENT ON TABLE components IS 'React/Vue components with their properties';
COMMENT ON TABLE dependencies IS 'File-to-file import/export relationships';
COMMENT ON TABLE colors IS 'Design system color palette';
COMMENT ON TABLE typography IS 'Typography system definitions';
COMMENT ON TABLE spacing IS 'Spacing system values';
COMMENT ON TABLE architecture_nodes IS 'High-level architecture visualization nodes';
COMMENT ON TABLE analysis_sessions IS 'Tracks analysis runs for debugging and metrics';
COMMENT ON TABLE analysis_cache IS 'Caches expensive analysis computations';

COMMENT ON FUNCTION get_changed_files IS 'Detects which files need to be processed in incremental analysis';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Removes expired cache entries to free up space'; 