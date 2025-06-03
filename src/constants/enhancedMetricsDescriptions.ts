export interface MetricDescription {
  title: string;
  description: string;
  interpretation: {
    good: string;
    warning: string;
    bad: string;
  };
  thresholds: {
    good: number | boolean;
    warning: number | boolean;
    bad: number | boolean;
  };
  examples?: string[];
}

export const ENHANCED_METRICS_DESCRIPTIONS: Record<string, MetricDescription> = {
  cyclomaticComplexity: {
    title: "Cyclomatic Complexity",
    description: "Measures the number of linearly independent paths through the code. Each decision point (if, while, for, switch, catch, &&, ||) increases complexity.",
    interpretation: {
      good: "Simple, easy to test and maintain",
      warning: "Moderate complexity, manageable but monitor growth",
      bad: "High complexity, consider refactoring into smaller functions"
    },
    thresholds: {
      good: 5,
      warning: 10,
      bad: 15
    },
    examples: [
      "1-5: Simple function with few decision points",
      "6-10: Moderate function with several conditions", 
      "11+: Complex function needing refactoring"
    ]
  },

  cognitiveComplexity: {
    title: "Cognitive Complexity",
    description: "Measures how difficult the code is to understand. Similar to cyclomatic complexity but weights nested structures more heavily.",
    interpretation: {
      good: "Easy to read and understand",
      warning: "Moderate mental effort required",
      bad: "Hard to understand, high mental overhead"
    },
    thresholds: {
      good: 8,
      warning: 15,
      bad: 25
    },
    examples: [
      "0-8: Clear, straightforward logic",
      "9-15: Some mental effort needed",
      "16+: Difficult to follow, needs simplification"
    ]
  },

  nestingDepth: {
    title: "Nesting Depth",
    description: "The maximum depth of nested code blocks (functions, loops, conditionals). Deep nesting reduces readability.",
    interpretation: {
      good: "Flat structure, easy to follow",
      warning: "Some nesting, still manageable",
      bad: "Deep nesting, consider flattening structure"
    },
    thresholds: {
      good: 2,
      warning: 4,
      bad: 6
    },
    examples: [
      "1-2: Good structure with minimal nesting",
      "3-4: Acceptable but monitor complexity",
      "5+: Too deep, use early returns or extract functions"
    ]
  },

  hasHeavyDependencies: {
    title: "Heavy Dependencies",
    description: "Indicates if the file imports large libraries that significantly impact bundle size (lodash, moment, jquery, etc.).",
    interpretation: {
      good: "No heavy dependencies detected",
      warning: "Some heavy dependencies present",
      bad: "Multiple heavy dependencies affecting bundle size"
    },
    thresholds: {
      good: false,
      warning: true,
      bad: true
    },
    examples: [
      "Heavy libs: lodash, moment, jquery, three.js, d3",
      "Consider: date-fns instead of moment",
      "Use: specific imports like import { debounce } from 'lodash'"
    ]
  },

  usesTreeShaking: {
    title: "Tree Shaking Usage",
    description: "Whether the file uses tree-shakable import patterns (named imports vs default imports) to reduce bundle size.",
    interpretation: {
      good: "Using tree-shakable imports effectively",
      warning: "Mixed import patterns",
      bad: "Not leveraging tree shaking benefits"
    },
    thresholds: {
      good: true,
      warning: true,
      bad: false
    },
    examples: [
      "Good: import { func } from 'library'",
      "Bad: import * as lib from 'library'",
      "Avoid: import lib from 'library' for large libs"
    ]
  },

  hasBarrelExports: {
    title: "Barrel Exports",
    description: "Detects re-export patterns (export * from './module') that can prevent tree shaking and increase bundle size.",
    interpretation: {
      good: "No barrel exports, optimal for tree shaking",
      warning: "Some barrel exports present",
      bad: "Heavy use of barrel exports affecting performance"
    },
    thresholds: {
      good: false,
      warning: true,
      bad: true
    },
    examples: [
      "Barrel: export * from './components'",
      "Better: Direct imports from specific files",
      "Consider: Selective re-exports when needed"
    ]
  },

  usesServerComponents: {
    title: "Server Components",
    description: "Next.js 13+ Server Components that render on the server, improving performance and SEO.",
    interpretation: {
      good: "Using modern Next.js Server Components",
      warning: "Mixed component types",
      bad: "Not leveraging server-side rendering benefits"
    },
    thresholds: {
      good: true,
      warning: true,
      bad: false
    },
    examples: [
      "Detected by: 'use server' directive",
      "Benefits: Better SEO, faster initial load",
      "Use for: Static content, data fetching"
    ]
  },

  usesClientComponents: {
    title: "Client Components", 
    description: "Next.js 13+ Client Components that run in the browser, required for interactivity.",
    interpretation: {
      good: "Properly using client-side rendering",
      warning: "Balance client/server components",
      bad: "Overusing client components"
    },
    thresholds: {
      good: true,
      warning: true,
      bad: false
    },
    examples: [
      "Detected by: 'use client' directive",
      "Required for: Hooks, event handlers, browser APIs",
      "Use sparingly: Keep bundle size small"
    ]
  },

  usesServerActions: {
    title: "Server Actions",
    description: "Next.js 13+ Server Actions for form handling and server-side mutations without API routes.",
    interpretation: {
      good: "Using modern form handling patterns",
      warning: "Some server-side logic",
      bad: "Missing server action opportunities"
    },
    thresholds: {
      good: true,
      warning: true,
      bad: false
    },
    examples: [
      "Detected by: Server action patterns, revalidatePath",
      "Benefits: Simplified forms, progressive enhancement",
      "Use for: Form submissions, data mutations"
    ]
  },

  usesImageOptimization: {
    title: "Image Optimization",
    description: "Usage of Next.js optimized Image component for automatic optimization, lazy loading, and responsive images.",
    interpretation: {
      good: "Leveraging Next.js image optimization",
      warning: "Some image optimization in use",
      bad: "Missing image optimization opportunities"
    },
    thresholds: {
      good: true,
      warning: true,
      bad: false
    },
    examples: [
      "Detected by: next/image imports",
      "Benefits: Auto optimization, lazy loading, WebP conversion",
      "Use instead of: Regular <img> tags"
    ]
  },

  usesDynamicImports: {
    title: "Dynamic Imports",
    description: "Code splitting using dynamic imports or Next.js dynamic function to reduce initial bundle size.",
    interpretation: {
      good: "Implementing code splitting effectively",
      warning: "Some dynamic loading in place",
      bad: "Missing code splitting opportunities"
    },
    thresholds: {
      good: true,
      warning: true,
      bad: false
    },
    examples: [
      "Detected by: import() calls, next/dynamic",
      "Benefits: Smaller initial bundle, faster page loads",
      "Use for: Large components, conditional features"
    ]
  },

  internalDependencies: {
    title: "Internal Dependencies",
    description: "Number of imports from other files within the project. High numbers may indicate tight coupling.",
    interpretation: {
      good: "Reasonable internal coupling",
      warning: "Moderate internal dependencies", 
      bad: "High coupling, consider refactoring"
    },
    thresholds: {
      good: 5,
      warning: 10,
      bad: 15
    },
    examples: [
      "Includes: ./components/Button, ../utils/helpers",
      "High count: May indicate God objects",
      "Consider: Dependency injection, smaller modules"
    ]
  },

  externalDependencies: {
    title: "External Dependencies",
    description: "Number of npm package imports. Too many can indicate over-engineering or missing built-in alternatives.",
    interpretation: {
      good: "Focused external dependencies",
      warning: "Moderate external library usage",
      bad: "Heavy external dependency usage"
    },
    thresholds: {
      good: 5,
      warning: 10,
      bad: 15
    },
    examples: [
      "Includes: react, next, lodash, axios",
      "Review: Whether all are necessary",
      "Consider: Built-in alternatives, bundle impact"
    ]
  },

  circularDependencies: {
    title: "Circular Dependencies",
    description: "Circular import chains that can cause build issues and runtime problems.",
    interpretation: {
      good: "No circular dependencies detected",
      warning: "Some circular dependencies present",
      bad: "Multiple circular dependencies found"
    },
    thresholds: {
      good: 0,
      warning: 1,
      bad: 3
    },
    examples: [
      "Example: A imports B, B imports C, C imports A",
      "Issues: Build failures, runtime errors",
      "Fix: Refactor shared code to separate module"
    ]
  }
}; 