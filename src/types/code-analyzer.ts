export interface FileData {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
  file: File;
  category?: string;
  importance?: number;
}

export interface FileStats {
  totalFiles: number;
  totalSize: string;
  typeCount: Record<string, number>;
}

export interface FileTreeNode {
  [key: string]: FileData | FileTreeNode;
}

export interface FileViewerProps {
  file: FileData | null;
  readFileContent: (file: FileData) => Promise<string>;
}

export interface FileTreeProps {
  tree: FileTreeNode;
  selectedFile: FileData | null;
  expandedFolders: Set<string>;
  onFileSelect: (file: FileData) => void;
  onFolderToggle: (path: string) => void;
}

export interface FileUploaderProps {
  onFilesUploaded: (files: FileData[]) => void;
}

export interface ProjectOverviewProps {
  stats: FileStats;
}

export interface SearchPanelProps {
  files: FileData[];
  onFileSelect: (file: FileData) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  loc?: number;
  fileType?: string;
  functions?: number;
  path: string;
}

export interface FileTypeData {
  count: number;
  loc: number;
  color: string;
  functions: number;
} 