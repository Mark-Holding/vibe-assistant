import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface EnhancedMetrics {
  // Performance indicators
  bundleImpact: {
    hasHeavyDependencies: boolean;
    usesTreeShaking: boolean;
    hasBarrelExports: boolean;
  };
  
  // Code quality indicators
  complexity: {
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    nestingDepth: number;
  };
  
  // Next.js specific
  nextjsFeatures: {
    usesServerComponents: boolean;
    usesClientComponents: boolean;
    usesServerActions: boolean;
    usesImageOptimization: boolean;
    usesDynamicImports: boolean;
  };
  
  // Dependencies analysis
  dependencies: {
    internal: string[];
    external: string[];
    circular: string[];
  };
}

// Heavy dependencies that impact bundle size
const HEAVY_DEPENDENCIES = [
  'lodash', 'moment', 'jquery', 'rxjs', 'ramda', 'immutable', 
  'underscore', 'bluebird', 'async', 'joi', 'yup', 'zod',
  'three', 'd3', 'chart.js', 'plotly', 'mapbox-gl'
];

// Server Actions patterns (Next.js 13+)
const SERVER_ACTION_PATTERNS = [
  'use server', 'server action', 'formData', 'redirect', 'revalidatePath', 'revalidateTag'
];

export function analyzeEnhancedMetrics(content: string, filePath: string): EnhancedMetrics {
  const metrics: EnhancedMetrics = {
    bundleImpact: {
      hasHeavyDependencies: false,
      usesTreeShaking: false,
      hasBarrelExports: false
    },
    complexity: {
      cyclomaticComplexity: 1, // Start at 1 for the main path
      cognitiveComplexity: 0,
      nestingDepth: 0
    },
    nextjsFeatures: {
      usesServerComponents: false,
      usesClientComponents: false,
      usesServerActions: false,
      usesImageOptimization: false,
      usesDynamicImports: false
    },
    dependencies: {
      internal: [],
      external: [],
      circular: []
    }
  };

  // Skip non-JavaScript files
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (!ext || !['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'].includes(ext)) {
    return metrics;
  }

  // Path-based Next.js detection
  const filename = filePath.toLowerCase();
  const actualFilename = filePath.split('/').pop()?.toLowerCase() || '';
  
  // Next.js App Router special files (these are Server Components by default)
  const nextjsAppRouterFiles = [
    'page.tsx', 'page.jsx', 'page.js', 'page.ts',
    'layout.tsx', 'layout.jsx', 'layout.js', 'layout.ts',
    'error.tsx', 'error.jsx', 'error.js', 'error.ts',
    'loading.tsx', 'loading.jsx', 'loading.js', 'loading.ts',
    'not-found.tsx', 'not-found.jsx', 'not-found.js', 'not-found.ts',
    'global-error.tsx', 'global-error.jsx', 'global-error.js', 'global-error.ts',
    'template.tsx', 'template.jsx', 'template.js', 'template.ts'
  ];
  
  if (nextjsAppRouterFiles.includes(actualFilename) && 
      (filePath.includes('/app/') || filePath.includes('/src/app/'))) {
    console.log('Detected Next.js App Router file (Server Component by default):', filePath);
    metrics.nextjsFeatures.usesServerComponents = true;
  }
  
  // Next.js API Routes
  if ((actualFilename === 'route.ts' || actualFilename === 'route.js') && 
      (filePath.includes('/app/') || filePath.includes('/src/app/'))) {
    console.log('Detected Next.js App Router API route:', filePath);
    metrics.nextjsFeatures.usesServerActions = true; // API routes are server-side
  }
  
  // Next.js Pages Router API routes
  if (filePath.includes('/pages/api/') || filePath.includes('/src/pages/api/')) {
    console.log('Detected Next.js Pages Router API route:', filePath);
    metrics.nextjsFeatures.usesServerActions = true; // API routes are server-side
  }
  
  // Check for 'use client' directive early (this will override server component detection)
  if (content.includes("'use client'") || content.includes('"use client"')) {
    console.log('Detected "use client" directive:', filePath);
    metrics.nextjsFeatures.usesClientComponents = true;
    metrics.nextjsFeatures.usesServerComponents = false; // Can't be both
  }
  
  // Check for 'use server' directive (Server Actions)
  if (content.includes("'use server'") || content.includes('"use server"')) {
    console.log('Detected "use server" directive (Server Actions):', filePath);
    metrics.nextjsFeatures.usesServerActions = true;
  }

  try {
    const ast = babel.parse(content, {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'dynamicImport'],
    });

    let currentDepth = 0;
    let maxDepth = 0;
    let cognitiveDepth = 0;
    let hasJSX = false;
    let hasReactImport = false;

    traverse(ast, {
      // Track nesting depth
      enter(path) {
        if (isBlockStatement(path)) {
          currentDepth++;
          maxDepth = Math.max(maxDepth, currentDepth);
        }
      },
      exit(path) {
        if (isBlockStatement(path)) {
          currentDepth--;
        }
      },

      // Import analysis
      ImportDeclaration(path) {
        const source = path.node.source.value;
        
        // Categorize dependencies
        if (source.startsWith('.') || source.startsWith('/')) {
          metrics.dependencies.internal.push(source);
        } else {
          metrics.dependencies.external.push(source);
        }

        // Check for heavy dependencies
        if (HEAVY_DEPENDENCIES.some(dep => source.includes(dep))) {
          metrics.bundleImpact.hasHeavyDependencies = true;
        }

        // Check for tree-shaking (named imports vs default imports)
        const hasNamedImports = path.node.specifiers.some(spec => 
          spec.type === 'ImportSpecifier'
        );
        if (hasNamedImports) {
          metrics.bundleImpact.usesTreeShaking = true;
        }

        // Next.js Image optimization
        if (source === 'next/image') {
          console.log('Detected next/image import:', filePath);
          metrics.nextjsFeatures.usesImageOptimization = true;
        }

        // Dynamic imports check
        if (source.includes('dynamic') || source === 'next/dynamic') {
          console.log('Detected next/dynamic import:', filePath);
          metrics.nextjsFeatures.usesDynamicImports = true;
        }
        
        // React import detection
        if (source === 'react') {
          hasReactImport = true;
        }
        
        // Next.js specific imports that indicate modern features
        const nextjsModernImports = [
          'next/navigation', 'next/headers', 'next/cookies', 'next/cache',
          'next/server', 'next/font', 'next/router'
        ];
        
        if (nextjsModernImports.some(mod => source.includes(mod))) {
          console.log('Detected Next.js modern import:', source, 'in', filePath);
          // These imports often indicate either Server or Client Components
          if (source.includes('next/navigation') || source.includes('next/router')) {
            // Navigation hooks typically used in Client Components
            if (!metrics.nextjsFeatures.usesServerComponents) {
              metrics.nextjsFeatures.usesClientComponents = true;
            }
          } else if (source.includes('next/headers') || source.includes('next/cookies')) {
            // Headers/cookies typically used in Server Components
            if (!metrics.nextjsFeatures.usesClientComponents) {
              metrics.nextjsFeatures.usesServerComponents = true;
            }
          }
        }
      },

      // JSX detection
      JSXElement() {
        hasJSX = true;
      },

      // Export analysis for barrel exports
      ExportAllDeclaration(path) {
        metrics.bundleImpact.hasBarrelExports = true;
      },

      ExportNamedDeclaration(path) {
        if (path.node.source) {
          metrics.bundleImpact.hasBarrelExports = true;
        }
        
        // Check for Next.js API route exports (HTTP methods)
        if (path.node.declaration && path.node.declaration.type === 'FunctionDeclaration') {
          const func = path.node.declaration as any;
          if (func.id && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(func.id.name)) {
            console.log('Detected Next.js API route export:', func.id.name, 'in', filePath);
            metrics.nextjsFeatures.usesServerActions = true;
          }
        }
      },

      // Cyclomatic complexity - decision points
      IfStatement() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      ConditionalExpression() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      SwitchCase() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      WhileStatement() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      ForStatement() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      ForInStatement() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      ForOfStatement() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      DoWhileStatement() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      CatchClause() { 
        metrics.complexity.cyclomaticComplexity++; 
        metrics.complexity.cognitiveComplexity++;
      },
      LogicalExpression(path) {
        if (path.node.operator === '&&' || path.node.operator === '||') {
          metrics.complexity.cyclomaticComplexity++;
          metrics.complexity.cognitiveComplexity++;
        }
      },

      // Dynamic imports (code splitting)
      CallExpression(path) {
        if (path.node.callee.type === 'Import') {
          console.log('Detected dynamic import() call in:', filePath);
          metrics.nextjsFeatures.usesDynamicImports = true;
        }
        
        // Next.js dynamic function
        if (path.node.callee.type === 'Identifier' && path.node.callee.name === 'dynamic') {
          console.log('Detected dynamic() function call in:', filePath);
          metrics.nextjsFeatures.usesDynamicImports = true;
        }

        // Server Actions function calls
        if (path.node.callee.type === 'Identifier') {
          const name = path.node.callee.name;
          if (['redirect', 'revalidatePath', 'revalidateTag', 'unstable_noStore'].includes(name)) {
            console.log('Detected Server Action function call:', name, 'in', filePath);
            metrics.nextjsFeatures.usesServerActions = true;
          }
        }
      },

      // Additional cognitive complexity for nested structures
      Function(path) {
        const currentCognitiveDepth = getCognitiveDepth(path);
        if (currentCognitiveDepth > 0) {
          metrics.complexity.cognitiveComplexity += currentCognitiveDepth;
        }
      }
    });

    // Post-processing: Infer component types based on React patterns
    if (hasJSX && hasReactImport) {
      console.log('Detected React component with JSX in:', filePath);
      
      // If we haven't detected specific Next.js patterns, but it's a React component
      if (!metrics.nextjsFeatures.usesClientComponents && !metrics.nextjsFeatures.usesServerComponents) {
        // Check file location to make a reasonable guess
        if (filePath.includes('/app/') || filePath.includes('/src/app/')) {
          // In app directory, default to Server Component unless 'use client'
          console.log('Defaulting to Server Component (app directory):', filePath);
          metrics.nextjsFeatures.usesServerComponents = true;
        } else if (filePath.includes('/pages/') || filePath.includes('/src/pages/')) {
          // In pages directory, these are Client Components
          console.log('Defaulting to Client Component (pages directory):', filePath);
          metrics.nextjsFeatures.usesClientComponents = true;
        }
      }
    }

    metrics.complexity.nestingDepth = maxDepth;

    // Deduplicate dependencies
    metrics.dependencies.internal = [...new Set(metrics.dependencies.internal)];
    metrics.dependencies.external = [...new Set(metrics.dependencies.external)];

    // TODO: Implement circular dependency detection
    // This would require analyzing the entire project dependency graph
    metrics.dependencies.circular = [];

  } catch (error) {
    console.warn(`Error analyzing enhanced metrics for ${filePath}:`, error);
  }

  return metrics;
}

// Helper function to determine if a path represents a block statement
function isBlockStatement(path: any): boolean {
  return path.isBlockStatement() || 
         path.isFunction() || 
         path.isIfStatement() || 
         path.isForStatement() || 
         path.isWhileStatement() || 
         path.isDoWhileStatement() || 
         path.isTryStatement() ||
         path.isSwitchStatement();
}

// Helper function to calculate cognitive complexity depth
function getCognitiveDepth(path: any): number {
  let depth = 0;
  let current = path.parent;
  
  while (current) {
    if (current.type === 'IfStatement' || 
        current.type === 'ForStatement' || 
        current.type === 'WhileStatement' ||
        current.type === 'DoWhileStatement' ||
        current.type === 'SwitchStatement') {
      depth++;
    }
    current = current.parent;
  }
  
  return depth;
}

// Helper function to detect circular dependencies (simplified)
export function detectCircularDependencies(
  filePath: string, 
  allFiles: Map<string, string[]>
): string[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const circular: string[] = [];

  function visit(file: string, path: string[] = []): void {
    if (visiting.has(file)) {
      // Found a cycle
      const cycleStart = path.indexOf(file);
      if (cycleStart !== -1) {
        circular.push(...path.slice(cycleStart));
      }
      return;
    }

    if (visited.has(file)) {
      return;
    }

    visiting.add(file);
    const dependencies = allFiles.get(file) || [];
    
    for (const dep of dependencies) {
      visit(dep, [...path, file]);
    }

    visiting.delete(file);
    visited.add(file);
  }

  visit(filePath);
  return [...new Set(circular)];
} 