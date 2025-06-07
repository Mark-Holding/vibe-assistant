import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { EntryPointInfo } from '../../../types/code-analysis';

interface EntryPointsSectionProps {
  entryPoints: EntryPointInfo[];
  isLoading?: boolean;
  error?: string | null;
}

const EntryPointsSection: React.FC<EntryPointsSectionProps> = ({ 
  entryPoints, 
  isLoading = false,
  error = null 
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center">
        <MapPin size={20} className="mr-2 text-green-600" />
        Entry Points & Key Modules
        <span className="ml-3 text-sm font-normal text-gray-500">
          ({entryPoints.length} files)
        </span>
        {isLoading && <Loader2 size={16} className="ml-2 animate-spin text-blue-500" />}
      </h3>
    </div>

    {/* Explanation */}
    <div className="bg-gray-50 border-l-4 border-green-500 p-4 mb-6">
      <p className="text-sm text-gray-700">
        <strong>Entry Points</strong> are the main starting points of your application where execution begins, 
        such as main pages, API endpoints, or root components. <strong>Key Modules</strong> are critical files 
        that contain essential business logic, configuration, or services that other parts of your application depend on.
      </p>
    </div>
    
    {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p className="text-sm">{error}</p>
      </div>
    )}
    
    {isLoading && entryPoints.length === 0 ? (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 size={24} className="animate-spin mr-2" />
        <span>Analyzing entry points with Claude...</span>
      </div>
    ) : (
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entryPoints.map((entry, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{entry.type}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  entry.importance === 'Critical' ? 'bg-red-100 text-red-700' :
                  entry.importance === 'High' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {entry.importance}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{entry.purpose}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{entry.file}</code>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default EntryPointsSection; 