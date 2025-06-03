export interface FileTypeDescription {
  category: string;
  title: string;
  description: string;
  examples: string[];
  importance: string;
}

export const FILE_TYPE_DESCRIPTIONS: Record<string, FileTypeDescription> = {
  'Page': {
    category: 'Page',
    title: 'Page Components',
    description: 'A page file represents a complete route or screen in your application. These are typically top-level components that define what users see when they navigate to a specific URL. Includes Next.js App Router files (page.tsx, layout.tsx, error.tsx), Pages Router files, and special files like _app.tsx.',
    examples: ['pages/home.tsx', 'app/dashboard/page.tsx', 'app/layout.tsx', '_app.tsx', 'error.tsx', 'loading.tsx'],
    importance: 'Critical - These define your app\'s main user interfaces'
  },

  'Service': {
    category: 'Service',
    title: 'Service & API Files',
    description: 'Service files contain business logic, API calls, and data fetching functions. They handle communication with external services, databases, and manage application state. Includes Next.js API routes (route.ts in App Router, files in /pages/api/).',
    examples: ['services/userService.ts', 'app/api/users/route.ts', 'pages/api/auth.js', 'lib/dataFetcher.ts'],
    importance: 'High - Core business logic and data management'
  },

  'Component': {
    category: 'Component',
    title: 'UI Components',
    description: 'Component files are reusable UI building blocks written in React, Vue, or other frameworks. They encapsulate specific functionality and can be used throughout your application.',
    examples: ['components/Button.tsx', 'ui/Modal.jsx', 'widgets/Header.vue'],
    importance: 'High - Building blocks of your user interface'
  },

  'Utility': {
    category: 'Utility',
    title: 'Utility & Helper Functions',
    description: 'Utility files contain helper functions, custom hooks, and shared logic that can be used across multiple parts of your application. They promote code reusability and maintainability.',
    examples: ['utils/formatDate.ts', 'hooks/useAuth.js', 'helpers/validation.ts'],
    importance: 'Medium-High - Shared functionality and custom logic'
  },

  'Types': {
    category: 'Types',
    title: 'Type Definitions',
    description: 'Type files define TypeScript interfaces, type aliases, and data structures. They provide type safety and documentation for your application\'s data models.',
    examples: ['types/user.ts', 'interfaces/api.d.ts', 'models/Product.ts'],
    importance: 'Medium - Type safety and code documentation'
  },

  'Styles': {
    category: 'Styles',
    title: 'Styling Files',
    description: 'Style files contain CSS, SCSS, or styling-related code that defines the visual appearance of your application. This includes global styles, component-specific styles, and theme definitions.',
    examples: ['styles/globals.css', 'components/Button.scss', 'theme/colors.ts'],
    importance: 'Medium - Visual design and user experience'
  },

  'Config': {
    category: 'Config',
    title: 'Configuration Files',
    description: 'Configuration files contain settings and options for your project, build tools, linters, and development environment. They control how your application is built and deployed.',
    examples: ['tsconfig.json', '.eslintrc.js', 'webpack.config.js', '.gitignore'],
    importance: 'Low-Medium - Project setup and tooling'
  },

  'Dependencies': {
    category: 'Dependencies',
    title: 'Dependencies & Packages',
    description: 'Dependency files are external libraries and packages installed via npm, yarn, or other package managers. They provide pre-built functionality to your application.',
    examples: ['node_modules/react', 'node_modules/lodash', 'package.json'],
    importance: 'Low - External code dependencies'
  },

  'Tests': {
    category: 'Tests',
    title: 'Test Files',
    description: 'Test files contain unit tests, integration tests, and end-to-end tests that verify your application works correctly. They help maintain code quality and prevent bugs.',
    examples: ['__tests__/Button.test.tsx', 'specs/user.spec.js', 'e2e/login.test.ts'],
    importance: 'Medium - Code quality and reliability'
  },

  'Documentation': {
    category: 'Documentation',
    title: 'Documentation Files',
    description: 'Documentation files contain project information, setup instructions, API documentation, and other written materials that help developers understand and use your codebase.',
    examples: ['README.md', 'docs/api.md', 'CHANGELOG.md', 'LICENSE'],
    importance: 'Low-Medium - Project documentation and knowledge sharing'
  },

  'HTML': {
    category: 'HTML',
    title: 'HTML Files',
    description: 'HTML files define the structure and content of web pages. They may include the main index.html file, email templates, or static HTML pages.',
    examples: ['public/index.html', 'templates/email.html', 'static/404.html'],
    importance: 'Medium - Web page structure and content'
  },

  'Middleware': {
    category: 'Middleware',
    title: 'Middleware & Interceptors',
    description: 'Middleware files contain code that runs between requests and responses in your application. They handle authentication, logging, CORS, and other cross-cutting concerns.',
    examples: ['middleware/auth.ts', 'interceptors/api.js', 'middleware.ts'],
    importance: 'High - Request/response processing and security'
  },

  'Database/Model': {
    category: 'Database/Model',
    title: 'Database & Data Models',
    description: 'Database and model files define data schemas, ORM configurations, and database-related logic. They structure how your application stores and retrieves data.',
    examples: ['models/User.ts', 'prisma/schema.prisma', 'db/migrations/', 'entities/Product.ts'],
    importance: 'Medium-High - Data structure and persistence'
  },

  'State Management': {
    category: 'State Management',
    title: 'State Management',
    description: 'State management files contain Redux stores, Zustand stores, context providers, and other state management logic. They handle application-wide data and user interface state.',
    examples: ['store/userSlice.ts', 'context/AuthContext.tsx', 'atoms/userAtom.ts'],
    importance: 'Medium-High - Application state and data flow'
  },

  'Environment': {
    category: 'Environment',
    title: 'Environment Configuration',
    description: 'Environment files contain environment variables, secrets, and configuration that varies between development, staging, and production environments.',
    examples: ['.env.local', '.env.production', 'config/env.ts'],
    importance: 'Medium - Environment-specific settings and secrets'
  },

  'Other': {
    category: 'Other',
    title: 'Other Files',
    description: 'Other files include miscellaneous files that don\'t fit into the main categories. These might be assets, legacy code, or specialized files for your specific use case.',
    examples: ['assets/images/', 'scripts/deploy.sh', 'legacy/old-code.js'],
    importance: 'Variable - Depends on specific file purpose'
  }
};

// Helper function to get description by category
export const getFileTypeDescription = (category: string): FileTypeDescription | null => {
  return FILE_TYPE_DESCRIPTIONS[category] || null;
};

// Helper function to get all categories
export const getAllFileTypeCategories = (): string[] => {
  return Object.keys(FILE_TYPE_DESCRIPTIONS);
}; 