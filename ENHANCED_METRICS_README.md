# 📊 Enhanced Metrics System

## Overview

The Enhanced Metrics System provides comprehensive code analysis beyond basic file categorization, offering insights into:

- **Performance Impact** - Bundle size impact, tree-shaking usage, barrel exports
- **Code Quality** - Cyclomatic complexity, cognitive complexity, nesting depth  
- **Next.js Features** - Server/Client Components, Server Actions, Image optimization
- **Dependencies** - Internal/external imports, circular dependencies detection

## 🗄️ Database Schema

### New Columns Added to `files` Table

```sql
-- Performance indicators
has_heavy_dependencies BOOLEAN DEFAULT FALSE;
uses_tree_shaking BOOLEAN DEFAULT FALSE;
has_barrel_exports BOOLEAN DEFAULT FALSE;

-- Code complexity
cyclomatic_complexity INTEGER DEFAULT 0;
cognitive_complexity INTEGER DEFAULT 0;
nesting_depth INTEGER DEFAULT 0;

-- Next.js features
uses_server_components BOOLEAN DEFAULT FALSE;
uses_client_components BOOLEAN DEFAULT FALSE;
uses_server_actions BOOLEAN DEFAULT FALSE;
uses_image_optimization BOOLEAN DEFAULT FALSE;
uses_dynamic_imports BOOLEAN DEFAULT FALSE;

-- Dependencies (JSONB arrays)
internal_dependencies JSONB DEFAULT '[]'::jsonb;
external_dependencies JSONB DEFAULT '[]'::jsonb;
circular_dependencies JSONB DEFAULT '[]'::jsonb;
```

### Indexes for Performance

```sql
CREATE INDEX idx_files_complexity ON files(cyclomatic_complexity, cognitive_complexity);
CREATE INDEX idx_files_nextjs_features ON files(uses_server_components, uses_client_components);
CREATE INDEX idx_files_performance ON files(has_heavy_dependencies, uses_tree_shaking);
```

## 📈 Metrics Explained

### Performance Indicators

#### Heavy Dependencies
- **Purpose**: Identifies files importing large libraries that significantly impact bundle size
- **Detection**: Checks for imports like `lodash`, `moment`, `jquery`, `rxjs`, `three`, `d3`, etc.
- **Impact**: Files with heavy dependencies increase build time and bundle size
- **Example**: `import _ from 'lodash'` → `hasHeavyDependencies: true`

#### Tree Shaking Usage
- **Purpose**: Identifies files using tree-shakable import patterns
- **Detection**: Named imports vs default imports (`import { func } from 'lib'` vs `import lib from 'lib'`)
- **Impact**: Better tree shaking reduces dead code in production bundles
- **Example**: `import { debounce } from 'lodash'` → `usesTreeShaking: true`

#### Barrel Exports
- **Purpose**: Detects re-export patterns that can impact bundle size
- **Detection**: `export * from './module'` or `export { item } from './module'`
- **Impact**: Can prevent proper tree shaking and increase bundle size
- **Example**: `export * from './components'` → `hasBarrelExports: true`

### Code Quality Metrics

#### Cyclomatic Complexity
- **Purpose**: Measures the number of linearly independent paths through code
- **Calculation**: Counts decision points (if, while, for, switch, catch, &&, ||)
- **Thresholds**: 
  - 1-5: Simple, easy to test
  - 6-10: Moderate complexity
  - 11+: High complexity, consider refactoring

#### Cognitive Complexity
- **Purpose**: Measures how difficult code is to understand
- **Calculation**: Similar to cyclomatic but weights nested structures more heavily
- **Thresholds**:
  - 0-8: Easy to understand
  - 9-15: Moderate
  - 16+: Hard to understand

#### Nesting Depth
- **Purpose**: Measures maximum depth of nested code blocks
- **Impact**: Deep nesting reduces readability and maintainability
- **Thresholds**:
  - 1-2: Good
  - 3-4: Acceptable
  - 5+: Consider refactoring

### Next.js Features

#### Server Components
- **Detection**: `'use server'` directive or server-side patterns
- **Purpose**: Identifies files using Next.js 13+ Server Components
- **Benefits**: Better performance, SEO, reduced client bundle

#### Client Components  
- **Detection**: `'use client'` directive or client-side patterns
- **Purpose**: Identifies files requiring client-side execution
- **Use Cases**: Interactive components, hooks, browser APIs

#### Server Actions
- **Detection**: Server action patterns, form handling, `revalidatePath`, etc.
- **Purpose**: Identifies Next.js 13+ Server Actions usage
- **Benefits**: Simplified form handling, progressive enhancement

#### Image Optimization
- **Detection**: `next/image` imports
- **Purpose**: Tracks usage of Next.js optimized Image component
- **Benefits**: Automatic optimization, lazy loading, responsive images

#### Dynamic Imports
- **Detection**: `import()` calls or `next/dynamic` usage
- **Purpose**: Identifies code-splitting patterns
- **Benefits**: Reduced initial bundle size, better performance

### Dependencies Analysis

#### Internal Dependencies
- **Purpose**: Tracks imports within the project
- **Format**: Array of relative import paths
- **Example**: `['./components/Button', '../utils/helpers']`

#### External Dependencies
- **Purpose**: Tracks npm package imports
- **Format**: Array of package names
- **Example**: `['react', 'next', 'lodash']`

#### Circular Dependencies
- **Purpose**: Detects circular import chains
- **Impact**: Can cause build issues and runtime problems
- **Example**: A imports B, B imports C, C imports A

## 🚀 Usage

### Analyzing Files

```typescript
import { analyzeEnhancedMetrics } from './utils/enhancedMetricsAnalyzer';

const metrics = analyzeEnhancedMetrics(fileContent, filePath);
console.log(metrics);
```

### Database Integration

```typescript
// In files.ts service
const analysis = await this.analyzeFileContent(content, normalizedPath);

const fileData = {
  // ... other fields
  has_heavy_dependencies: analysis.enhancedMetrics.bundleImpact.hasHeavyDependencies,
  cyclomatic_complexity: analysis.enhancedMetrics.complexity.cyclomaticComplexity,
  uses_server_components: analysis.enhancedMetrics.nextjsFeatures.usesServerComponents,
  external_dependencies: JSON.stringify(analysis.enhancedMetrics.dependencies.external)
};
```

### Querying Enhanced Metrics

```sql
-- Find high-complexity files
SELECT name, path, cyclomatic_complexity, cognitive_complexity 
FROM files 
WHERE cyclomatic_complexity > 10 OR cognitive_complexity > 15;

-- Find files with heavy dependencies
SELECT name, path, external_dependencies
FROM files 
WHERE has_heavy_dependencies = true;

-- Next.js feature adoption
SELECT 
  COUNT(CASE WHEN uses_server_components THEN 1 END) as server_components,
  COUNT(CASE WHEN uses_client_components THEN 1 END) as client_components,
  COUNT(CASE WHEN uses_server_actions THEN 1 END) as server_actions
FROM files;

-- Top external dependencies
SELECT dep, COUNT(*) as usage_count
FROM files, jsonb_array_elements_text(external_dependencies) as dep
GROUP BY dep
ORDER BY usage_count DESC
LIMIT 10;
```

## 📊 Interpretation Guidelines

### Quality Score Calculation

The system calculates a quality score (0-100) based on:

- **-5 points** per high-complexity file
- **-10 points** per file with heavy dependencies  
- **-15 points** if >50% files use barrel exports
- **+20 points** for high tree-shaking adoption (weighted)
- **+10 points** for Next.js modern features usage

### Recommended Actions

#### High Complexity (Cyclomatic > 10, Cognitive > 15)
- Break down large functions
- Extract helper functions
- Use early returns to reduce nesting
- Consider design patterns (Strategy, Command)

#### Heavy Dependencies
- Use specific imports instead of entire libraries
- Consider lighter alternatives (date-fns vs moment)
- Implement dynamic imports for large libraries
- Evaluate if dependency is actually needed

#### Poor Tree Shaking
- Use named imports: `import { func } from 'lib'`
- Avoid importing entire modules: `import * as lib`
- Check library documentation for tree-shaking support
- Use bundle analyzers to verify improvements

#### Barrel Export Issues
- Import directly from modules when possible
- Use selective re-exports instead of `export *`
- Consider if re-exports are actually needed
- Monitor bundle size impact

## 🔧 Configuration

### Heavy Dependencies List

Add to `enhancedMetricsAnalyzer.ts`:

```typescript
const HEAVY_DEPENDENCIES = [
  'lodash', 'moment', 'jquery', 'rxjs', 'ramda', 'immutable',
  'three', 'd3', 'chart.js', 'plotly', 'mapbox-gl',
  // Add your project-specific heavy deps
];
```

### Complexity Thresholds

Customize in your analysis:

```typescript
const COMPLEXITY_THRESHOLDS = {
  cyclomatic: { low: 5, high: 10 },
  cognitive: { low: 8, high: 15 },
  nesting: { low: 2, high: 4 }
};
```

## 📈 Visualization

### Architecture Map Integration

Enhanced metrics appear in the Architecture Map when clicking on individual files:

- 🧠 **Complexity** - Color-coded complexity scores
- ⚡ **Performance** - Bundle impact indicators  
- ⚛️ **Next.js** - Feature usage badges
- 📦 **Dependencies** - Internal/external counts

### Summary Dashboard

The `EnhancedMetricsSummary` component provides project-wide insights:

- Average complexity scores
- Performance indicator distribution
- Next.js feature adoption rates
- Top dependencies usage
- Overall quality score

## 🔍 Troubleshooting

### Common Issues

1. **AST Parsing Errors**
   - Check file syntax validity
   - Ensure proper TypeScript/JSX configuration
   - Verify Babel parser plugins

2. **Missing Metrics**
   - Confirm file is JavaScript/TypeScript
   - Check if file content is accessible
   - Verify enhanced analyzer is called

3. **Incorrect Complexity Scores**
   - Review complexity calculation logic
   - Consider if calculation matches expectations
   - Check for edge cases in AST traversal

### Performance Considerations

- Enhanced analysis adds ~50-100ms per file
- Consider caching results for unchanged files
- Use worker threads for large codebases
- Implement incremental analysis for file changes

## 🎯 Future Enhancements

- **Security Analysis** - Detect potential security issues
- **Performance Patterns** - Identify common performance anti-patterns
- **Accessibility Metrics** - Track a11y compliance
- **Test Coverage Integration** - Correlate with test coverage data
- **Custom Rules Engine** - User-defined analysis rules
- **Machine Learning Insights** - Pattern recognition and recommendations 