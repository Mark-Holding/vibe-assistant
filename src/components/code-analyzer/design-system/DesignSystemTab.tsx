import React, { useState, useEffect } from 'react';
import ColorPaletteSection from './ColorPaletteSection';
import TypographySection from './TypographySection';
import SpacingSection from './SpacingSection';
import ComponentStylesSection from './ComponentStylesSection';
import DesignSystemSummarySection from './DesignSystemSummarySection';
import { Palette } from 'lucide-react';
import {
  ColorInfo,
  TypographyInfo,
  SpacingInfo,
  ComponentStyleInfo,
  DesignSystemTabProps
} from '../../../types/design-system';

const DesignSystemTab: React.FC<DesignSystemTabProps> = ({ files }) => {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [typography, setTypography] = useState<TypographyInfo[]>([]);
  const [spacing, setSpacing] = useState<SpacingInfo[]>([]);
  const [componentStyles, setComponentStyles] = useState<ComponentStyleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dummy data for now
  useEffect(() => {
    if (files.length === 0) {
      setColors([]);
      setTypography([]);
      setSpacing([]);
      setComponentStyles([]);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setColors([
        { name: 'Primary Blue', hex: '#3b82f6', usage: 12, locations: ['main.css', 'button.css'] },
        { name: 'Success Green', hex: '#10b981', usage: 8, locations: ['main.css'] },
        { name: 'Error Red', hex: '#ef4444', usage: 5, locations: ['alerts.css'] },
        { name: 'Text Gray', hex: '#374151', usage: 20, locations: ['main.css', 'typography.css'] },
        { name: 'Background Light', hex: '#f9fafb', usage: 15, locations: ['main.css'] }
      ]);
      setTypography([
        { name: 'Primary Font', family: 'Inter', weight: '400-700', usage: 'Headers, body text, UI elements' },
        { name: 'Monospace Font', family: 'Fira Code, monospace', weight: '400', usage: 'Code blocks, technical text' }
      ]);
      setSpacing([
        { size: '4px', pixels: 4, usage: 'Tiny gaps, fine details' },
        { size: '8px', pixels: 8, usage: 'Small spacing, icons' },
        { size: '16px', pixels: 16, usage: 'Standard spacing' },
        { size: '32px', pixels: 32, usage: 'Large spacing' }
      ]);
      setComponentStyles([
        { name: 'Button Styles', variants: 3, usage: 'Primary, secondary, outline variants' },
        { name: 'Card Styles', variants: 2, usage: 'Content containers, product cards' },
        { name: 'Form Styles', variants: 2, usage: 'Input fields, form controls' }
      ]);
      setIsLoading(false);
    }, 500);
  }, [files]);

  const cssFiles = files.filter(file => file.name.match(/\.(css|scss|sass)$/));

  if (cssFiles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Palette size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No CSS files found</p>
          <p className="text-sm">Upload CSS/SCSS files to analyze your design system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DesignSystemSummarySection 
        colors={colors} 
        typography={typography} 
        spacing={spacing} 
        componentStyles={componentStyles} 
      />
      <ColorPaletteSection colors={colors} isLoading={isLoading} />
      <TypographySection typography={typography} />
      <SpacingSection spacing={spacing} />
      <ComponentStylesSection componentStyles={componentStyles} />
    </div>
  );
};

export default DesignSystemTab; 