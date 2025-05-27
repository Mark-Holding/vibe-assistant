import React from 'react';
import { Palette } from 'lucide-react';
import { ColorInfo } from '../../../types/design-system';

interface ColorPaletteSectionProps {
  colors: ColorInfo[];
  isLoading: boolean;
}

const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({ colors, isLoading }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <Palette size={20} className="mr-2 text-pink-600" />
      Color Palette
    </h3>
    {isLoading ? (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {colors.map((color, index) => (
          <div key={index} className="text-center">
            <div 
              className="w-16 h-16 rounded-lg mx-auto mb-2 border border-gray-200 shadow-sm"
              style={{ backgroundColor: color.hex }}
            />
            <div className="text-sm font-medium">{color.name}</div>
            <div className="text-xs text-gray-500">{color.hex}</div>
            <div className="text-xs text-gray-400 mt-1">{color.usage} uses</div>
            <div className="text-xs text-gray-400">
              {color.locations.join(', ')}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ColorPaletteSection; 