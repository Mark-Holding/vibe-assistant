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
import { designSystemService, ColorData, TypographyData, SpacingData, ComponentStyleData } from '../../../lib/database/designSystem';

const DesignSystemTab: React.FC<DesignSystemTabProps> = ({ files, projectId }) => {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [typography, setTypography] = useState<TypographyInfo[]>([]);
  const [spacing, setSpacing] = useState<SpacingInfo[]>([]);
  const [componentStyles, setComponentStyles] = useState<ComponentStyleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to transform database data to UI format
  const transformColorData = (colorData: ColorData[]): ColorInfo[] => {
    return colorData.map(color => ({
      name: color.name,
      hex: color.hex_value,
      usage: color.usage_count,
      locations: color.locations
    }));
  };

  const transformTypographyData = (typographyData: TypographyData[]): TypographyInfo[] => {
    return typographyData.map(typo => ({
      name: typo.name,
      family: typo.font_family,
      weight: typo.font_weights.join(', ') || 'Unknown',
      usage: typo.usage_description || `Used in ${typo.locations.join(', ')}`
    }));
  };

  const transformSpacingData = (spacingData: SpacingData[]): SpacingInfo[] => {
    return spacingData.map(space => ({
      size: space.size_value,
      pixels: space.pixels,
      usage: space.usage_description || `Used ${space.usage_count} times`
    }));
  };

  const transformComponentStyleData = (componentStyleData: ComponentStyleData[]): ComponentStyleInfo[] => {
    return componentStyleData.map(style => ({
      name: style.name,
      variants: style.variants.length,
      usage: style.usage_description || `${style.style_type} component styles`
    }));
  };

  // Load design system data from database
  useEffect(() => {
    if (!projectId) {
      setColors([]);
      setTypography([]);
      setSpacing([]);
      setComponentStyles([]);
      return;
    }

    const loadDesignSystemData = async () => {
      setIsLoading(true);
      try {
        console.log('📊 Loading design system data from database...');
        
        const designSystemData = await designSystemService.getAllDesignSystemData(projectId);
        
        setColors(transformColorData(designSystemData.colors));
        setTypography(transformTypographyData(designSystemData.typography));
        setSpacing(transformSpacingData(designSystemData.spacing));
        setComponentStyles(transformComponentStyleData(designSystemData.componentStyles));

        console.log('✅ Design system data loaded:', {
          colors: designSystemData.colors.length,
          typography: designSystemData.typography.length,
          spacing: designSystemData.spacing.length,
          componentStyles: designSystemData.componentStyles.length
        });

      } catch (error) {
        console.error('❌ Error loading design system data:', error);
        // Fall back to empty arrays
        setColors([]);
        setTypography([]);
        setSpacing([]);
        setComponentStyles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDesignSystemData();
  }, [projectId]);

  const cssFiles = files.filter(file => file.name.match(/\.(css|scss|sass)$/));
  const hasDesignSystemData = colors.length > 0 || typography.length > 0 || spacing.length > 0 || componentStyles.length > 0;

  if (!hasDesignSystemData && !isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Palette size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No design system data found</p>
          <p className="text-sm">
            {cssFiles.length === 0 
              ? "Upload CSS/SCSS files to analyze your design system"
              : "Run a new analysis to extract design system data from your CSS files"
            }
          </p>
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