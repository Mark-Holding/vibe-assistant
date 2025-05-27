import React from 'react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '../../../types/code-analyzer';

interface FileTreeProps {
  tree: FileNode;
  expandedFolders: Set<string>;
  onFolderToggle: (path: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ tree, expandedFolders, onFolderToggle }) => {
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
            onClick={() => onFolderToggle(node.path)}
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

  return (
    <div>
      {tree.children && tree.children.map(child => renderFileTree(child))}
    </div>
  );
}; 