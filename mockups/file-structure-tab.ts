import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';

interface FileStructureTabProps {
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
  }>;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  loc?: number;
  fileType?: string;
  functions?: number;
  path: string;
}

interface FileTypeData {
  count: number;
  loc: number;
  color: string;
}

const FileStructureTab: React.FC<FileStructureTabProps> = ({ files }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'components']));
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [fileTypeBreakdown, setFileTypeBreakdown] = useState<Record<string, FileTypeData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // File type categorization
  const categorizeFile = (filename: string): { type: string; color: string } => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const name = filename.toLowerCase();

    if (ext === 'tsx' || ext === 'jsx') {
      return { type: 'React Component', color: '#61dafb' };
    }
    if (ext === 'ts' || ext === 'js') {
      if (name.includes('page') || name.includes('route')) {
        return { type: 'Next.js Page', color: '#000000' };
      }
      if (name.includes('util') || name.includes('helper') || name.includes('lib')) {
        return { type: 'Utility', color: '#f7df1e' };
      }
      return { type: 'JavaScript/TypeScript', color: '#3178c6' };
    }
    if (ext === 'css' || ext === 'scss' || ext === 'sass') {
      return { type: 'Stylesheet', color: '#1572b6' };
    }
    if (ext === 'json') {
      return { type: 'Config', color: '#6b7280' };
    }
    if (ext === 'md' || ext === 'mdx') {
      return { type: 'Documentation', color: '#22c55e' };
    }
    if (ext === 'html') {
      return { type: 'HTML', color: '#e34f26' };
    }
    return { type: 'Other', color: '#9ca3af' };
  };

  // Build file tree structure
  const buildFileTree = (files: Array<{ name: string; path: string; size: number; file: File }>): FileNode => {
    const root: FileNode = {
      name: 'root',
      type: 'folder',
      children: [],
      path: ''
    };

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
          const { type: fileType } = categorizeFile(part);
          existingNode = {
            name: part,
            type: isLastPart ? 'file' : 'folder',
            path: currentPath,
            fileType: isLastPart ? fileType : undefined,
            loc: isLastPart ? Math.floor(file.size / 25) : undefined, // Rough LOC estimate
            children: isLastPart ? undefined : []
          };
          currentNode.children.push(existingNode);
        }

        if (!isLastPart) {
          currentNode = existingNode;
        }
      });
    });

    return root;
  };

  // Calculate file type breakdown
  const calculateFileTypeBreakdown = (files: Array<{ name: string; size: number }>) => {
    const breakdown: Record<string, FileTypeData> = {};

    files.forEach(file => {
      const { type, color } = categorizeFile(file.name);
      const loc = Math.floor(file.size / 25); // Rough LOC estimate

      if (!breakdown[type]) {
        breakdown[type] = { count: 0, loc: 0, color };
      }

      breakdown[type].count++;
      breakdown[type].loc += loc;
    });

    return breakdown;
  };

  // Process files when they change
  useEffect(() => {
    if (files.length === 0) {
      setFileTree(null);
      setFileTypeBreakdown({});
      return;
    }

    setIsLoading(true);
    
    try {
      const tree = buildFileTree(files);
      const breakdown = calculateFileTypeBreakdown(files);
      
      setFileTree(tree);
      setFileTypeBreakdown(breakdown);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (node: FileNode, depth = 0): React.ReactNode => {
    if (!node.children && node.type === 'file') {
      return (
        <div 
          key={node.path} 
          className="flex items-center py-1 px-2 hover:bg-gray-50 rounded text-sm"
          style={{ marginLeft: `${depth * 16}px` }}
        >
          <FileText size={14} className="mr-2 text-blue-600" />
          <span className="flex-1">{node.name}</span>
          {node.fileType && (
            <span className="text-xs text-gray-500 mr-2">{node.fileType}</span>
          )}
          {node.loc && (
            <span className="text-xs text-gray-400">{node.loc} LOC</span>
          )}
        </div>
      );
    }

    if (node.type === 'folder' && node.children) {
      const isExpanded = expandedFolders.has(node.path);
      
      return (
        <div key={node.path}>
          <div 
            className="flex items-center py-1 px-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
            style={{ marginLeft: `${depth * 16}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {isExpanded ? 
              <FolderOpen size={14} className="mr-2 text-blue-600" /> : 
              <Folder size={14} className="mr-2 text-blue-600" />
            }
            <span className="flex-1 font-medium">{node.name}</span>
            {node.loc && <span className="text-xs text-gray-400">{node.loc} LOC</span>}
          </div>
          {isExpanded && node.children.map(child => renderFileTree(child, depth + 1))}
        </div>
      );
    }

    return null;
  };

  // Calculate totals
  const totalFiles = files.length;
  const totalLOC = Object.values(fileTypeBreakdown).reduce((sum, data) => sum + data.loc, 0);
  const totalFunctions = Math.floor(totalLOC / 50); // Rough estimate
  const totalComponents = Object.values(fileTypeBreakdown)['React Component']?.count || 0;

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Folder size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Upload files to see project structure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* File Tree */}
      <div className="col-span-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Project Structure</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {fileTree && fileTree.children && fileTree.children.map(child => renderFileTree(child))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar with stats */}
      <div className="col-span-4 space-y-6">
        {/* File Type Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">File Type Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(fileTypeBreakdown).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-3"
                    style={{ backgroundColor: data.color }}
                  />
                  <span className="text-sm font-medium">{type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{data.count}</div>
                  <div className="text-xs text-gray-500">{data.loc} LOC</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Files:</span>
              <span className="font-semibold">{totalFiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total LOC:</span>
              <span className="font-semibold">{totalLOC.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Est. Functions:</span>
              <span className="font-semibold">{totalFunctions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Components:</span>
              <span className="font-semibold">{totalComponents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileStructureTab;