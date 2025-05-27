import React from 'react';
import { TypographyInfo } from '../../../types/design-system';

interface TypographySectionProps {
  typography: TypographyInfo[];
}

const TypographySection: React.FC<TypographySectionProps> = ({ typography }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4">Typography System</h3>
    <div className="space-y-4">
      {typography.map((typo, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{typo.name}</h4>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {typo.family}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Weight: {typo.weight}</span>
            <span>Usage: {typo.usage}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TypographySection; 