import React from 'react';
import { MapPin } from 'lucide-react';
import { EntryPointInfo } from '../../../types/code-analysis';

interface EntryPointsSectionProps {
  entryPoints: EntryPointInfo[];
}

const EntryPointsSection: React.FC<EntryPointsSectionProps> = ({ entryPoints }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <MapPin size={20} className="mr-2 text-green-600" />
      Entry Points & Key Modules
    </h3>
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
);

export default EntryPointsSection; 