-- Enhanced Metrics Schema Updates for Files Table
-- Run these SQL statements in your Supabase SQL editor

-- Add performance indicators columns
ALTER TABLE files ADD COLUMN IF NOT EXISTS has_heavy_dependencies BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS uses_tree_shaking BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS has_barrel_exports BOOLEAN DEFAULT FALSE;

-- Add code complexity columns
ALTER TABLE files ADD COLUMN IF NOT EXISTS cyclomatic_complexity INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS cognitive_complexity INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS nesting_depth INTEGER DEFAULT 0;

-- Add Next.js feature columns
ALTER TABLE files ADD COLUMN IF NOT EXISTS uses_server_components BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS uses_client_components BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS uses_server_actions BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS uses_image_optimization BOOLEAN DEFAULT FALSE;
ALTER TABLE files ADD COLUMN IF NOT EXISTS uses_dynamic_imports BOOLEAN DEFAULT FALSE;

-- Add dependencies analysis columns (storing as JSON arrays)
ALTER TABLE files ADD COLUMN IF NOT EXISTS internal_dependencies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE files ADD COLUMN IF NOT EXISTS external_dependencies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE files ADD COLUMN IF NOT EXISTS circular_dependencies JSONB DEFAULT '[]'::jsonb;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_complexity ON files(cyclomatic_complexity, cognitive_complexity);
CREATE INDEX IF NOT EXISTS idx_files_nextjs_features ON files(uses_server_components, uses_client_components);
CREATE INDEX IF NOT EXISTS idx_files_performance ON files(has_heavy_dependencies, uses_tree_shaking);

-- Add comments for documentation
COMMENT ON COLUMN files.has_heavy_dependencies IS 'Whether file imports heavy libraries like lodash, moment, etc.';
COMMENT ON COLUMN files.uses_tree_shaking IS 'Whether file uses tree-shakable import patterns';
COMMENT ON COLUMN files.has_barrel_exports IS 'Whether file has barrel export patterns (index.ts re-exports)';
COMMENT ON COLUMN files.cyclomatic_complexity IS 'Cyclomatic complexity score (number of linearly independent paths)';
COMMENT ON COLUMN files.cognitive_complexity IS 'Cognitive complexity score (perceived difficulty of understanding)';
COMMENT ON COLUMN files.nesting_depth IS 'Maximum nesting depth of code blocks';
COMMENT ON COLUMN files.uses_server_components IS 'Whether file uses Next.js Server Components';
COMMENT ON COLUMN files.uses_client_components IS 'Whether file uses Next.js Client Components';
COMMENT ON COLUMN files.uses_server_actions IS 'Whether file uses Next.js Server Actions';
COMMENT ON COLUMN files.uses_image_optimization IS 'Whether file uses Next.js Image optimization';
COMMENT ON COLUMN files.uses_dynamic_imports IS 'Whether file uses dynamic imports for code splitting';
COMMENT ON COLUMN files.internal_dependencies IS 'Array of internal project dependencies';
COMMENT ON COLUMN files.external_dependencies IS 'Array of external npm package dependencies';
COMMENT ON COLUMN files.circular_dependencies IS 'Array of circular dependencies detected'; 