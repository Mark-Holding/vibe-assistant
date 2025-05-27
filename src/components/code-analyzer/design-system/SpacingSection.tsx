import React from 'react';
import { SpacingInfo } from '../../../types/design-system';

interface SpacingSectionProps {
  spacing: SpacingInfo[];
}

const SpacingSection: React.FC<SpacingSectionProps> = ({ spacing }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4">Spacing System</h3>
    <div className="space-y-3">
      {spacing.map((space, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex items-center">
            <div 
              className="bg-blue-200 border border-blue-300 mr-3"
              style={{ 
                width: `${Math.min(space.pixels * 2, 64)}px`, 
                height: '16px', 
                minWidth: '8px' 
              }}
            />
            <span className="font-mono text-sm">{space.size}</span>
          </div>
          <span className="text-sm text-gray-600">{space.usage}</span>
        </div>
      ))}
    </div>
  </div>
);

export default SpacingSection; 