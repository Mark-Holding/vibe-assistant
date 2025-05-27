import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

interface DesignSystemTabProps {
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
  }>;
}

interface ColorInfo {
  name: string;
  hex: string;
  usage: number;
  locations: string[];
}

interface TypographyInfo {
  name: string;
  family: string;
  weight: string;
  usage: string;
}

interface SpacingInfo {
  size: string;
  pixels: number;
  usage: string;
}

interface ComponentStyleInfo {
  name: string;
  variants: number;
  usage: string;
}

const DesignSystemTab: React.FC<DesignSystemTabProps> = ({ files }) => {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [typography, setTypography] = useState<TypographyInfo[]>([]);
  const [spacing, setSpacing] = useState<SpacingInfo[]>([]);
  const [componentStyles, setComponentStyles] = useState<ComponentStyleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Parse CSS colors
  const parseColors = (cssContent: string, filename: string): ColorInfo[] => {
    const colors: ColorInfo[] = [];
    const colorRegex = /#([0-9a-fA-F]{3,6})|rgb\(([^)]+)\)|rgba\(([^)]+)\)|hsl\(([^)]+)\)|hsla\(([^)]+)\)/g;
    const colorMap = new Map<string, { count: number; locations: Set<string> }>();

    let match;
    while ((match = colorRegex.exec(cssContent)) !== null) {
      const colorValue = match[0];
      const normalizedColor = normalizeColor(colorValue);
      
      if (!colorMap.has(normalizedColor)) {
        colorMap.set(normalizedColor, { count: 0, locations: new Set() });
      }
      
      const colorData = colorMap.get(normalizedColor)!;
      colorData.count++;
      colorData.locations.add(filename);
    }

    // Convert common colors to named colors
    const colorNames = {
      '#ffffff': 'White',
      '#000000': 'Black',
      '#ff0000': 'Red',
      '#00ff00': 'Green',
      '#0000ff': 'Blue',
      '#ffff00': 'Yellow',
      '#ff00ff': 'Magenta',
      '#00ffff': 'Cyan',
      '#808080': 'Gray',
      '#3b82f6': 'Primary Blue',
      '#10b981': 'Success Green',
      '#f59e0b': 'Warning Orange',
      '#ef4444': 'Error Red',
      '#374151': 'Text Gray',
      '#f9fafb': 'Background Light'
    };

    colorMap.forEach((data, hex) => {
      const name = colorNames[hex.toLowerCase()] || generateColorName(hex);
      colors.push({
        name,
        hex,
        usage: data.count,
        locations: Array.from(data.locations)
      });
    });

    return colors.sort((a, b) => b.usage - a.usage);
  };

  // Parse typography information
  const parseTypography = (cssContent: string): TypographyInfo[] => {
    const typography: TypographyInfo[] = [];
    const fontFamilyRegex = /font-family:\s*([^;]+)/g;
    const fontWeightRegex = /font-weight:\s*([^;]+)/g;
    
    const families = new Set<string>();
    const weights = new Set<string>();

    let match;
    while ((match = fontFamilyRegex.exec(cssContent)) !== null) {
      families.add(match[1].trim().replace(/['"]/g, ''));
    }

    while ((match = fontWeightRegex.exec(cssContent)) !== null) {
      weights.add(match[1].trim());
    }

    // Common typography patterns
    if (families.has('Inter') || cssContent.includes('Inter')) {
      typography.push({
        name: 'Primary Font',
        family: 'Inter',
        weight: '400-700',
        usage: 'Headers, body text, UI elements'
      });
    }

    if (families.has('system-ui') || cssContent.includes('system-ui')) {
      typography.push({
        name: 'System Font',
        family: 'system-ui',
        weight: '400-600',
        usage: 'Fallback system fonts'
      });
    }

    if (families.has('monospace') || cssContent.includes('monospace') || families.has('Fira Code')) {
      typography.push({
        name: 'Monospace Font',
        family: 'Fira Code, monospace',
        weight: '400',
        usage: 'Code blocks, technical text'
      });
    }

    // If no specific fonts found, add defaults
    if (typography.length === 0) {
      typography.push({
        name: 'Default Font',
        family: 'system-ui, sans-serif',
        weight: '400-600',
        usage: 'All text elements'
      });
    }

    return typography;
  };

  // Parse spacing values
  const parseSpacing = (cssContent: string): SpacingInfo[] => {
    const spacing: SpacingInfo[] = [];
    const spacingRegex = /(?:margin|padding|gap|top|right|bottom|left|width|height):\s*(\d+)px/g;
    const spacingMap = new Map<number, number>();

    let match;
    while ((match = spacingRegex.exec(cssContent)) !== null) {
      const pixels = parseInt(match[1]);
      spacingMap.set(pixels, (spacingMap.get(pixels) || 0) + 1);
    }

    // Common spacing patterns
    const commonSpacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
    commonSpacing.forEach(size => {
      if (spacingMap.has(size) || cssContent.includes(`${size}px`)) {
        spacing.push({
          size: `${size}px`,
          pixels: size,
          usage: getSpacingUsage(size)
        });
      }
    });

    // Add Tailwind-style spacing if detected
    if (cssContent.includes('rem') || cssContent.includes('tailwind')) {
      const tailwindSpacing = [
        { size: '0.25rem', pixels: 4, usage: 'Tiny gaps, fine details' },
        { size: '0.5rem', pixels: 8, usage: 'Small spacing, icons' },
        { size: '1rem', pixels: 16, usage: 'Standard spacing' },
        { size: '1.5rem', pixels: 24, usage: 'Medium gaps' },
        { size: '2rem', pixels: 32, usage: 'Large spacing' }
      ];
      spacing.push(...tailwindSpacing);
    }

    return spacing.sort((a, b) => a.pixels - b.pixels);
  };

  // Parse component styles
  const parseComponentStyles = (cssContent: string, filename: string): ComponentStyleInfo[] => {
    const components: ComponentStyleInfo[] = [];
    
    // Look for common component patterns
    const buttonRegex = /\.btn|\.button|button\s*{/g;
    const cardRegex = /\.card|\.panel/g;
    const formRegex = /\.form|\.input|input\s*{/g;
    const modalRegex = /\.modal|\.dialog/g;

    if (buttonRegex.test(cssContent)) {
      const buttonVariants = (cssContent.match(/\.btn-\w+|\.button-\w+/g) || []).length;
      components.push({
        name: 'Button Styles',
        variants: Math.max(1, buttonVariants),
        usage: 'Primary, secondary, outline variants'
      });
    }

    if (cardRegex.test(cssContent)) {
      const cardVariants = (cssContent.match(/\.card-\w+/g) || []).length;
      components.push({
        name: 'Card Styles',
        variants: Math.max(1, cardVariants),
        usage: 'Content containers, product cards'
      });
    }

    if (formRegex.test(cssContent)) {
      const formVariants = (cssContent.match(/input\[type="\w+"\]/g) || []).length;
      components.push({
        name: 'Form Styles',
        variants: Math.max(1, formVariants),
        usage: 'Input fields, form controls'
      });
    }

    if (modalRegex.test(cssContent)) {
      components.push({
        name: 'Modal Styles',
        variants: 1,
        usage: 'Dialog boxes, overlays'
      });
    }

    return components;
  };

  // Helper functions
  const normalizeColor = (color: string): string => {
    // Convert rgb to hex, normalize hex colors
    if (color.startsWith('rgb(')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0]).toString(16).padStart(2, '0');
        const g = parseInt(matches[1]).toString(16).padStart(2, '0');
        const b = parseInt(matches[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
    }
    
    // Normalize hex colors
    if (color.startsWith('#')) {
      if (color.length === 4) {
        // Convert #abc to #aabbcc
        return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
      }
      return color.toLowerCase();
    }
    
    return color;
  };

  const generateColorName = (hex: string): string => {
    // Simple color name generation
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    if (r > 200 && g > 200 && b > 200) return 'Light Color';
    if (r < 50 && g < 50 && b < 50) return 'Dark Color';
    if (r > g && r > b) return 'Red Tone';
    if (g > r && g > b) return 'Green Tone';
    if (b > r && b > g) return 'Blue Tone';
    return 'Custom Color';
  };

  const getSpacingUsage = (size: number): string => {
    if (size <= 4) return 'Fine details, borders';
    if (size <= 8) return 'Small gaps, icon spacing';
    if (size <= 16) return 'Standard component spacing';
    if (size <= 24) return 'Section gaps';
    if (size <= 32) return 'Large component spacing';
    return 'Major layout spacing';
  };

  // Process files when they change
  useEffect(() => {
    const processFiles = async () => {
      if (files.length === 0) {
        setColors([]);
        setTypography([]);
        setSpacing([]);
        setComponentStyles([]);
        return;
      }

      setIsLoading(true);

      try {
        const allColors: ColorInfo[] = [];
        const allTypography: TypographyInfo[] = [];
        const allSpacing: SpacingInfo[] = [];
        const allComponentStyles: ComponentStyleInfo[] = [];

        // Process CSS files
        for (const file of files) {
          if (file.name.match(/\.(css|scss|sass)$/)) {
            try {
              const content = await file.file.text();
              const fileColors = parseColors(content, file.name);
              const fileTypography = parseTypography(content);
              const fileSpacing = parseSpacing(content);
              const fileComponents = parseComponentStyles(content, file.name);
              
              allColors.push(...fileColors);
              allTypography.push(...fileTypography);
              allSpacing.push(...fileSpacing);
              allComponentStyles.push(...fileComponents);
            } catch (error) {
              console.error(`Error processing ${file.path}:`, error);
            }
          }
        }

        // Merge and deduplicate
        const mergedColors = mergeColors(allColors);
        const mergedTypography = deduplicateTypography(allTypography);
        const mergedSpacing = deduplicateSpacing(allSpacing);
        const mergedComponents = deduplicateComponents(allComponentStyles);

        setColors(mergedColors);
        setTypography(mergedTypography);
        setSpacing(mergedSpacing);
        setComponentStyles(mergedComponents);

      } catch (error) {
        console.error('Error processing design system:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processFiles();
  }, [files]);

  // Helper functions for merging data
  const mergeColors = (colors: ColorInfo[]): ColorInfo[] => {
    const colorMap = new Map<string, ColorInfo>();
    
    colors.forEach(color => {
      if (colorMap.has(color.hex)) {
        const existing = colorMap.get(color.hex)!;
        existing.usage += color.usage;
        existing.locations = [...new Set([...existing.locations, ...color.locations])];
      } else {
        colorMap.set(color.hex, { ...color });
      }
    });
    
    return Array.from(colorMap.values()).sort((a, b) => b.usage - a.usage).slice(0, 12);
  };

  const deduplicateTypography = (typography: TypographyInfo[]): TypographyInfo[] => {
    const seen = new Set<string>();
    return typography.filter(typo => {
      const key = `${typo.family}-${typo.weight}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const deduplicateSpacing = (spacing: SpacingInfo[]): SpacingInfo[] => {
    const seen = new Set<number>();
    return spacing.filter(space => {
      if (seen.has(space.pixels)) return false;
      seen.add(space.pixels);
      return true;
    }).slice(0, 8);
  };

  const deduplicateComponents = (components: ComponentStyleInfo[]): ComponentStyleInfo[] => {
    const seen = new Set<string>();
    return components.filter(comp => {
      if (seen.has(comp.name)) return false;
      seen.add(comp.name);
      return true;
    });
  };

  // Get CSS files count
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
      {/* Color Palette */}
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

      {/* Typography */}
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

      {/* Spacing System */}
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

      {/* Component Styles */}
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

      {/* Summary */}
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
    </div>
  );
};

export default DesignSystemTab;