import { FileNode, FileTypeData } from '../../../types/code-analyzer';
import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import { categorizeByAST } from '../architecture-map';

export const FileTypeUtils = {
  // File type categorization (for color mapping and bar chart labels)
  categorizeFile: (category: string): { type: string; color: string } => {
    // Normalize category to lower case for matching
    const cat = (category || '').toLowerCase();
    switch (cat) {
      case 'page':
        return { type: 'Page', color: '#6366f1' }; // Indigo
      case 'service':
        return { type: 'Service', color: '#f59e42' }; // Orange
      case 'component':
        return { type: 'Component', color: '#61dafb' }; // React blue
      case 'utility':
        return { type: 'Utility', color: '#f7df1e' }; // Yellow
      case 'types':
        return { type: 'Types', color: '#a21caf' }; // Purple
      case 'styles':
        return { type: 'Styles', color: '#1572b6' }; // CSS blue
      case 'config':
        return { type: 'Config', color: '#6b7280' }; // Gray
      case 'dependencies':
        return { type: 'Dependencies', color: '#10b981' }; // Green
      case 'tests':
        return { type: 'Tests', color: '#ef4444' }; // Red
      case 'documentation':
        return { type: 'Documentation', color: '#22c55e' }; // Emerald
      case 'html':
        return { type: 'HTML', color: '#e34f26' }; // HTML orange
      case 'next.js page':
        return { type: 'Next.js Page', color: '#000000' }; // Black
      case 'react component':
        return { type: 'React Component', color: '#61dafb' }; // React blue
      case 'javascript/typescript':
        return { type: 'JavaScript/TypeScript', color: '#3178c6' }; // TS blue
      case 'stylesheet':
        return { type: 'Stylesheet', color: '#1572b6' }; // CSS blue
      case 'other':
        return { type: 'Other', color: '#9ca3af' }; // Gray
      default:
        // Fallback for unknown/legacy categories
        return { type: category, color: '#9ca3af' };
    }
  },

  // Build file tree structure using categorizeByAST
  buildFileTree: async (files: Array<{ name: string; path: string; size: number; file: File }>): Promise<FileNode> => {
    const root: FileNode = {
      name: 'root',
      type: 'folder',
      children: [],
      path: ''
    };

    // Pre-read all file contents and categorize
    const fileCategories: Record<string, string> = {};
    await Promise.all(files.map(async file => {
      let content = '';
      try {
        content = await file.file.text();
      } catch {}
      const { category } = categorizeByAST(content, file.path);
      fileCategories[file.path] = category;
    }));

    files.forEach(file => {
      const pathParts = file.path.split('/').filter(part => part.length > 0);
      let currentNode = root;

      pathParts.forEach((part, index) => {
        const isLastPart = index === pathParts.length - 1;
        const currentPath = pathParts.slice(0, index + 1).join('/');

        if (!currentNode.children) {
          currentNode.children = [];
        }

        let existingNode = currentNode.children.find(child => child.name === part);

        if (!existingNode) {
          // Use category for color mapping
          const category = isLastPart ? fileCategories[file.path] : undefined;
          let color = '#9ca3af';
          let label = category;
          if (category) {
            // Map category to color and label
            const mapped = FileTypeUtils.categorizeFile(category);
            color = mapped.color;
            label = mapped.type;
          }
          existingNode = {
            name: part,
            type: isLastPart ? 'file' : 'folder',
            path: currentPath,
            fileType: isLastPart ? label : undefined,
            loc: isLastPart ? Math.floor(file.size / 25) : undefined, // Rough LOC estimate
            children: isLastPart ? undefined : [],
            color: isLastPart ? color : undefined
          };
          currentNode.children.push(existingNode);
        }

        if (!isLastPart) {
          currentNode = existingNode;
        }
      });
    });

    return root;
  },

  // Parse and count functions in a file
  async countFunctions(file: File): Promise<number> {
    try {
      const content = await file.text();
      const ast = babel.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      let functionCount = 0;
      traverse(ast, {
        // Count function declarations
        FunctionDeclaration() {
          functionCount++;
        },
        // Count arrow functions
        ArrowFunctionExpression() {
          functionCount++;
        },
        // Count function expressions
        FunctionExpression() {
          functionCount++;
        },
        // Count class methods
        ClassMethod() {
          functionCount++;
        },
        // Count object methods
        ObjectMethod() {
          functionCount++;
        }
      });

      return functionCount;
    } catch (error) {
      console.warn(`Error parsing file ${file.name}:`, error);
      return 0;
    }
  },

  // Calculate file type breakdown with accurate function counts and categorizeByAST
  async calculateFileTypeBreakdown(files: Array<{ name: string; path: string; size: number; file: File }>): Promise<Record<string, FileTypeData>> {
    const breakdown: Record<string, FileTypeData> = {};
    let totalFunctions = 0;

    await Promise.all(files.map(async file => {
      let content = '';
      try {
        content = await file.file.text();
      } catch {}
      const { category } = categorizeByAST(content, file.path);
      // Map category to color and label
      const mapped = FileTypeUtils.categorizeFile(category);
      const color = mapped.color;
      const label = mapped.type;
      const loc = Math.floor(file.size / 25);
      let functionCount = 0;
      if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || 
          file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        functionCount = await FileTypeUtils.countFunctions(file.file);
        totalFunctions += functionCount;
      }
      if (!breakdown[label]) {
        breakdown[label] = { count: 0, loc: 0, color, functions: 0 };
      }
      breakdown[label].count++;
      breakdown[label].loc += loc;
      breakdown[label].functions = (breakdown[label].functions || 0) + functionCount;
    }));

    return breakdown;
  }
}; 