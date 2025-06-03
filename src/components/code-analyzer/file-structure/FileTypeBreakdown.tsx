import React from 'react';
import { FileTypeData } from '../../../types/code-analyzer';
import { FileTypeUtils } from './utils';

interface FileTypeBreakdownProps {
  breakdown: Record<string, FileTypeData>;
  totalFiles: number;
  totalLOC: number;
  totalFunctions: number;
  totalComponents: number;
  totalImportedFiles: number;
}

// List of all possible categories (labels and colors)
const ALL_CATEGORIES = [
  'Page',
  'Service',
  'Component',
  'Utility',
  'Types',
  'Styles',
  'Config',
  'Dependencies',
  'Tests',
  'Documentation',
  'HTML',
  'Middleware',
  'Database/Model',
  'State Management',
  'Environment',
  'Other',
];

export const FileTypeBreakdown: React.FC<FileTypeBreakdownProps> = ({
  breakdown,
  totalFiles,
  totalLOC,
  totalFunctions,
  totalComponents,
  totalImportedFiles
}) => {
  // Build a sorted array of categories by count (descending)
  const sortedCategories = ALL_CATEGORIES
    .map(label => ({
      label,
      data: breakdown[label] || { count: 0, loc: 0, color: FileTypeUtils.categorizeFile(label).color, functions: 0 }
    }))
    .sort((a, b) => b.data.count - a.data.count);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">File Type Breakdown</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Files</div>
          <div className="text-2xl font-semibold">{totalImportedFiles}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Source Files</div>
          <div className="text-2xl font-semibold">{totalFiles}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total LOC</div>
          <div className="text-2xl font-semibold">{totalLOC}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Functions</div>
          <div className="text-2xl font-semibold">{totalFunctions}</div>
        </div>
      </div>

      {/* File Type Distribution */}
      <div className="space-y-4">
        {sortedCategories.map(({ label, data }) => (
          <div key={label} className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: data.color }}
                />
                <div className="text-sm text-gray-600">{label}</div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-1">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${totalFiles > 0 ? (data.count / totalFiles) * 100 : 0}%`,
                    backgroundColor: data.color
                  }}
                />
              </div>
            </div>
            <div className="ml-4 text-sm font-medium">
              {data.count} files
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 