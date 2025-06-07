import { FileData, FileTreeNode, FileStats } from '../types/code-analyzer';

export const getFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const typeMap: Record<string, string> = {
    'js': 'JavaScript',
    'jsx': 'React JSX',
    'ts': 'TypeScript',
    'tsx': 'React TSX',
    'css': 'CSS',
    'scss': 'SCSS',
    'html': 'HTML',
    'json': 'JSON',
    'md': 'Markdown',
    'py': 'Python',
    'php': 'PHP'
  };
  return typeMap[ext || ''] || 'Unknown';
};

// Centralized filtering logic for relevant source files
export const isRelevantSourceFile = (file: FileData): boolean => {
  if (!file || !file.path) {
    console.warn('Invalid file object:', file);
    return false;
  }
  
  const excludeDirs = [
    '/node_modules/', '/.git/', '/dist/', '/build/', '/out/', '/.next/', '/.vercel/'
  ];
  const ext = file.path.split('.').pop()?.toLowerCase();
  const allowedExts = [
    // JavaScript/TypeScript
    'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
    // Web Technologies  
    'html', 'htm', 'css', 'scss', 'sass', 'less', 'styl',
    // Database/Query Languages
    'sql', 'psql', 'pgsql', 'plsql', 'tsql', 'mysql', 'sqlite', 'graphql', 'gql',
    // Backend Languages
    'py', 'java', 'php', 'rb', 'go', 'rs', 'cs', 'cpp', 'cc', 'cxx', 'c', 'h',
    // Mobile Development
    'dart', 'swift', 'kt', 'm', 'mm',
    // Functional Languages
    'r', 'lua', 'perl', 'pl', 'pm', 'scala', 'clj', 'cljs', 'ex', 'exs', 'erl', 'hs', 'fs', 'ml',
    // Template Engines
    'hbs', 'mustache', 'pug', 'jade', 'ejs', 'liquid', 'twig', 'j2',
    // Framework Files
    'vue', 'svelte',
    // Scripting
    'sh', 'bash', 'ps1', 'bat', 'cmd',
    // Shaders
    'hlsl', 'glsl', 'vert', 'frag',
    // Protocol/Interface Definition
    'proto', 'thrift',
    // Data/Config
    'json', 'xml', 'yml', 'yaml', 'toml',
    // Documentation
    'md', 'txt', 'rst',
    // Environment/Config
    'env', 'local', 'gitignore', 'prisma'
  ];
  
  // Important configuration files that start with dots
  const importantDotFiles = [
    '.env', '.env.local', '.env.development', '.env.production', '.env.test',
    '.eslintrc', '.eslintrc.json', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.yaml', '.eslintrc.yml',
    '.gitignore', '.gitattributes',
    '.prettierrc', '.prettierrc.json', '.prettierrc.js', '.prettierrc.yaml', '.prettierrc.yml',
    '.babelrc', '.babelrc.json', '.babelrc.js',
    '.editorconfig'
  ];
  
  // Check if it's an excluded directory
  if (excludeDirs.some(dir => file.path.includes(dir))) {
    return false;
  }
  
  // Allow important configuration files that start with dots
  if (file.name.startsWith('.')) {
    const isImportantDotFile = importantDotFiles.some(dotFile => 
      file.name === dotFile || file.name.startsWith(dotFile + '.')
    );
    if (!isImportantDotFile) {
      return false;
    }
  }
  
  // For files without extensions (like .gitignore), allow them if they're important dot files
  if (!ext) {
    const isImportantDotFile = importantDotFiles.some(dotFile => 
      file.name === dotFile || file.name.startsWith(dotFile + '.')
    );
    return isImportantDotFile;
  }
  
  if (!allowedExts.includes(ext)) {
    return false;
  }
  
  return true;
};

export const processUploadedFiles = (files: File[]): FileData[] => {
  const processedFiles = Array.from(files).map(file => {
    // Ensure path is always defined and properly formatted
    const path = (file as any).webkitRelativePath || file.name;
    if (!path) {
      return null;
    }
    const processedFile = {
      name: file.name,
      path: path,
      size: file.size,
      type: getFileType(file.name),
      lastModified: new Date(file.lastModified),
      file: file
    };
    return processedFile;
  }).filter((file): file is FileData => file !== null);
  return processedFiles;
};

export const buildFileTree = (files: FileData[]): FileTreeNode => {
  const tree: FileTreeNode = {};
  
  files.forEach(file => {
    if (!file || !file.path) {
      return;
    }
    
    const parts = file.path.split('/');
    let current = tree;
    
    parts.forEach((part, index) => {
      if (!part) return; // Skip empty parts
      
      if (index === parts.length - 1) {
        current[part] = file;
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as FileTreeNode;
      }
    });
  });
  
  return tree;
};

export const calculateStats = (files: FileData[]): FileStats => {
  const typeCount: Record<string, number> = {};
  let totalSize = 0;
  
  files.forEach(file => {
    typeCount[file.type] = (typeCount[file.type] || 0) + 1;
    totalSize += file.size;
  });

  return {
    totalFiles: files.length,
    totalSize: (totalSize / 1024).toFixed(2) + ' KB',
    typeCount
  };
};

export const readFileContent = async (file: FileData): Promise<string> => {
  try {
    const content = await file.file.text();
    return content;
  } catch (error) {
    return 'Error reading file content';
  }
}; 