-- Clear Existing Algorithm Data and Update Constraint (Clean Slate Approach) - CORRECTED
-- Run this in your Supabase SQL editor

-- Clear all existing algorithm analysis data (recommended for fresh analysis)
DELETE FROM algorithm_analysis;

-- Drop the existing constraint
ALTER TABLE algorithm_analysis DROP CONSTRAINT IF EXISTS algorithm_analysis_complexity_check;

-- Add new constraint for Big O notation
ALTER TABLE algorithm_analysis ADD CONSTRAINT algorithm_analysis_complexity_check 
CHECK (complexity IN ('O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n!)'));

-- Verify the constraint is in place (corrected for modern PostgreSQL)
SELECT conname, pg_get_constraintdef(oid) as constraint_definition 
FROM pg_constraint 
WHERE conrelid = 'algorithm_analysis'::regclass AND conname = 'algorithm_analysis_complexity_check'; 