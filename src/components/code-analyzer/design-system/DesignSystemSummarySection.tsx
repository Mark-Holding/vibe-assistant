import React from 'react';
import { ColorInfo, TypographyInfo, SpacingInfo, ComponentStyleInfo } from '../../../types/design-system';

interface DesignSystemSummarySectionProps {
  colors: ColorInfo[];
  typography: TypographyInfo[];
  spacing: SpacingInfo[];
  componentStyles: ComponentStyleInfo[];
}

const DesignSystemSummarySection: React.FC<DesignSystemSummarySectionProps> = ({ colors, typography, spacing, componentStyles }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4">Design System Summary</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{colors.length}</div>
        <div className="text-sm text-gray-600">Colors</div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{typography.length}</div>
        <div className="text-sm text-gray-600">Font Families</div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">{spacing.length}</div>
        <div className="text-sm text-gray-600">Spacing Values</div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">{componentStyles.length}</div>
        <div className="text-sm text-gray-600">Component Types</div>
      </div>
    </div>
  </div>
);

export default DesignSystemSummarySection; 