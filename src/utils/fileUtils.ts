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