import React from 'react';
import { FileText, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { FileTreeProps } from '../../types/code-analyzer';
import { Card, CardContent } from '../ui/Card';

export const FileTree: React.FC<FileTreeProps> = ({
  tree,
  selectedFile,
  expandedFolders,
  onFileSelect,
  onFolderToggle
}) => {
  const renderFileTree = (node: any, path = '') => {
    return Object.entries(node).map(([key, value]: [string, any]) => {
      const currentPath = path ? `${path}/${key}` : key;
      const isFile = value.file;
      
      if (isFile) {
        return (
          <div
            key={currentPath}
            className={`flex items-center py-1 px-2 cursor-pointer hover:bg-blue-50 rounded ${
              selectedFile?.path === value.path ? 'bg-blue-100' : ''
            }`}
            onClick={() => onFileSelect(value)}
          >
            <FileText size={16} className="mr-2 text-gray-600" />
            <span className="text-sm">{key}</span>
            <span className="ml-auto text-xs text-gray-500">{value.type}</span>
          </div>
        );
      } else {
        const isExpanded = expandedFolders.has(currentPath);
        return (
          <div key={currentPath}>
            <div
              className="flex items-center py-1 px-2 cursor-pointer hover:bg-gray-50 rounded"
              onClick={() => onFolderToggle(currentPath)}
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
              <Folder size={16} className="mr-2 text-blue-600" />
              <span className="text-sm font-medium">{key}</span>
            </div>
            {isExpanded && (
              <div className="ml-4 border-l border-gray-200">
                {renderFileTree(value, currentPath)}
              </div>
            )}
          </div>
        );
      }
    });
  };

  return (
    <Card>
      <CardContent>
        <div className="overflow-y-auto max-h-[600px]">
          {renderFileTree(tree)}
        </div>
      </CardContent>
    </Card>
  );
}; 