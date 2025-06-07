-- Update Algorithm Complexity Constraint to Support Big O Notation
-- Run this in your Supabase SQL editor

-- Drop the existing constraint
ALTER TABLE algorithm_analysis DROP CONSTRAINT IF EXISTS algorithm_analysis_complexity_check;

-- Add new constraint for Big O notation
ALTER TABLE algorithm_analysis ADD CONSTRAINT algorithm_analysis_complexity_check 
CHECK (complexity IN ('O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n!)'));

-- Optional: Update existing data (if any) - you may want to clear and re-analyze instead
-- UPDATE algorithm_analysis SET complexity = 'O(n)' WHERE complexity = 'Low';
-- UPDATE algorithm_analysis SET complexity = 'O(n²)' WHERE complexity = 'Medium';  
-- UPDATE algorithm_analysis SET complexity = 'O(2^n)' WHERE complexity = 'High'; 