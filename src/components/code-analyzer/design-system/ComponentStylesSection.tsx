import React from 'react';
import { ComponentStyleInfo } from '../../../types/design-system';

interface ComponentStylesSectionProps {
  componentStyles: ComponentStyleInfo[];
}

const ComponentStylesSection: React.FC<ComponentStylesSectionProps> = ({ componentStyles }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4">Component Styles</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {componentStyles.map((comp, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">{comp.name}</h4>
          <div className="text-sm text-gray-600 mb-2">
            {comp.variants} variant{comp.variants !== 1 ? 's' : ''} available
          </div>
          <div className="text-xs text-gray-500">{comp.usage}</div>
        </div>
      ))}
    </div>
  </div>
);

export default ComponentStylesSection; 