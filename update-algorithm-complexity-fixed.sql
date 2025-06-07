-- Update Algorithm Complexity Constraint to Support Big O Notation (Fixed Version)
-- Run this in your Supabase SQL editor

-- Step 1: First, let's see what data we have
-- SELECT complexity, COUNT(*) FROM algorithm_analysis GROUP BY complexity;

-- Step 2: Update existing data to use Big O notation
UPDATE algorithm_analysis SET complexity = 'O(n)' WHERE complexity = 'Low';
UPDATE algorithm_analysis SET complexity = 'O(n²)' WHERE complexity = 'Medium';  
UPDATE algorithm_analysis SET complexity = 'O(2^n)' WHERE complexity = 'High';

-- Step 3: Drop the existing constraint
ALTER TABLE algorithm_analysis DROP CONSTRAINT IF EXISTS algorithm_analysis_complexity_check;

-- Step 4: Add new constraint for Big O notation
ALTER TABLE algorithm_analysis ADD CONSTRAINT algorithm_analysis_complexity_check 
CHECK (complexity IN ('O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n!)'));

-- Verify the update worked
SELECT complexity, COUNT(*) FROM algorithm_analysis GROUP BY complexity; 