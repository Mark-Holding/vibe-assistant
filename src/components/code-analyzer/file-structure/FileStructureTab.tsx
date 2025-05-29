import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import { FileNode, FileTypeData } from '../../../types/code-analyzer';
import { FileTree } from './FileTree';
import { FileTypeBreakdown } from './FileTypeBreakdown';
import { FileTypeUtils } from './utils';

interface FileStructureTabProps {
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
    category?: string;
  }>;
  totalImportedFiles: number;
}

export const FileStructureTab: React.FC<FileStructureTabProps> = ({ files, totalImportedFiles }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'components']));
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [fileTypeBreakdown, setFileTypeBreakdown] = useState<Record<string, FileTypeData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Process files when they change
  useEffect(() => {
    if (files.length === 0) {
      setFileTree(null);
      setFileTypeBreakdown({});
      return;
    }

    setIsLoading(true);
    
    const processFiles = async () => {
      try {
        const tree = await FileTypeUtils.buildFileTree(files);
        const breakdown = await FileTypeUtils.calculateFileTypeBreakdown(files);
        
        setFileTree(tree);
        setFileTypeBreakdown(breakdown);
      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processFiles();
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

  // Calculate totals
  const totalFiles = files.length;
  const totalLOC = Object.values(fileTypeBreakdown).reduce((sum, data) => sum + data.loc, 0);
  const totalFunctions = Object.values(fileTypeBreakdown).reduce((sum, data) => sum + (data.functions || 0), 0);
  const totalComponents = Object.entries(fileTypeBreakdown).find(([type]) => type === 'React Component')?.[1].count || 0;

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
              {fileTree && fileTree.children && (
                <FileTree 
                  tree={fileTree} 
                  expandedFolders={expandedFolders}
                  onFolderToggle={toggleFolder}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* File Type Breakdown */}
      <div className="col-span-4">
        <FileTypeBreakdown 
          breakdown={fileTypeBreakdown}
          totalFiles={totalFiles}
          totalLOC={totalLOC}
          totalFunctions={totalFunctions}
          totalComponents={totalComponents}
          totalImportedFiles={totalImportedFiles}
        />
      </div>
    </div>
  );
}; 