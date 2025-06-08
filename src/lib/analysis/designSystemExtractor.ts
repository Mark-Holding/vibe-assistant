import { ColorData, TypographyData, SpacingData, ComponentStyleData } from '../database/designSystem';

interface DesignSystemAnalysis {
  colors: ColorData[];
  typography: TypographyData[];
  spacing: SpacingData[];
  componentStyles: ComponentStyleData[];
}

// Helper functions
function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function parseSpacingValue(value: string): number {
  // Convert various units to pixels (approximate)
  const numValue = parseFloat(value);
  
  if (value.includes('rem')) {
    return numValue * 16; // Assuming 1rem = 16px
  } else if (value.includes('em')) {
    return numValue * 16; // Assuming 1em = 16px
  } else if (value.includes('px')) {
    return numValue;
  } else if (value.includes('pt')) {
    return numValue * 1.333; // 1pt = 1.333px
  } else if (value.includes('%')) {
    return numValue; // Keep as percentage value
  }
  
  return numValue;
}

function categorizeColor(hex: string, name?: string): string {
  const colorKeywords = {
    primary: ['primary', 'main', 'brand'],
    secondary: ['secondary', 'accent'],
    success: ['success', 'green', 'positive'],
    warning: ['warning', 'yellow', 'orange', 'caution'],
    error: ['error', 'danger', 'red', 'negative'],
    neutral: ['gray', 'grey', 'neutral', 'text', 'background', 'bg']
  };
  
  if (name) {
    const lowerName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(colorKeywords)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
  }
  
  return 'custom';
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Convert HSL to hex (approximate)
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c/2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return rgbToHex(r, g, b);
}

// Named color mappings
const namedColors: Record<string, string> = {
  'red': '#ff0000',
  'green': '#008000',
  'blue': '#0000ff',
  'white': '#ffffff',
  'black': '#000000',
  'yellow': '#ffff00',
  'orange': '#ffa500',
  'purple': '#800080',
  'pink': '#ffc0cb',
  'brown': '#a52a2a',
  'gray': '#808080',
  'grey': '#808080',
  'navy': '#000080',
  'teal': '#008080',
  'lime': '#00ff00',
  'aqua': '#00ffff',
  'silver': '#c0c0c0',
  'maroon': '#800000',
  'fuchsia': '#ff00ff',
  'olive': '#808000'
};

export function analyzeDesignSystem(
  projectId: string,
  filePath: string,
  cssContent: string
): DesignSystemAnalysis {
  console.log(`🎨 Analyzing design system in ${filePath} (${cssContent.length} characters)`);
  
  // Debug: Log first 500 characters of content to see what we're working with
  console.log(`📝 Content preview: ${cssContent.substring(0, 500)}...`);
  
  const colors: ColorData[] = [];
  const typography: TypographyData[] = [];
  const spacing: SpacingData[] = [];
  const componentStyles: ComponentStyleData[] = [];
  
  // Track all discovered colors
  const colorCounts = new Map<string, { count: number; name?: string; source: string }>();

  // Extract hex colors
  const hexColorRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g;
  const hexMatches = cssContent.match(hexColorRegex);
  if (hexMatches) {
    console.log(`🎨 Found ${hexMatches.length} hex color matches`);
    hexMatches.forEach(color => {
      const normalizedColor = color.length === 4 
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color.toLowerCase();
      
      const existing = colorCounts.get(normalizedColor) || { count: 0, source: 'hex' };
      colorCounts.set(normalizedColor, { 
        ...existing, 
        count: existing.count + 1 
      });
    });
  }

  // Extract RGB colors
  const rgbColorRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi;
  let rgbMatch;
  while ((rgbMatch = rgbColorRegex.exec(cssContent)) !== null) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    const hexValue = rgbToHex(r, g, b);
    
    const existing = colorCounts.get(hexValue) || { count: 0, source: 'rgb' };
    colorCounts.set(hexValue, { 
      ...existing, 
      count: existing.count + 1,
      name: existing.name || `rgb(${r}, ${g}, ${b})`
    });
  }

  // Extract RGBA colors
  const rgbaColorRegex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/gi;
  let rgbaMatch;
  while ((rgbaMatch = rgbaColorRegex.exec(cssContent)) !== null) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const hexValue = rgbToHex(r, g, b);
    
    const existing = colorCounts.get(hexValue) || { count: 0, source: 'rgba' };
    colorCounts.set(hexValue, { 
      ...existing, 
      count: existing.count + 1,
      name: existing.name || `rgba(${r}, ${g}, ${b}, ...)`
    });
  }

  // Extract HSL colors
  const hslColorRegex = /hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/gi;
  let hslMatch;
  while ((hslMatch = hslColorRegex.exec(cssContent)) !== null) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);
    const hexValue = hslToHex(h, s, l);
    
    const existing = colorCounts.get(hexValue) || { count: 0, source: 'hsl' };
    colorCounts.set(hexValue, { 
      ...existing, 
      count: existing.count + 1,
      name: existing.name || `hsl(${h}, ${s}%, ${l}%)`
    });
  }

  // Extract named colors
  Object.entries(namedColors).forEach(([name, hex]) => {
    const nameRegex = new RegExp(`\\b${name}\\b`, 'gi');
    const matches = cssContent.match(nameRegex);
    if (matches) {
      const existing = colorCounts.get(hex) || { count: 0, source: 'named' };
      colorCounts.set(hex, { 
        ...existing, 
        count: existing.count + matches.length,
        name: existing.name || name
      });
    }
  });

  // Extract CSS custom properties (variables) for colors
  const cssVarColorRegex = /--[\w-]+:\s*(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\))/g;
  let cssVarMatch;
  while ((cssVarMatch = cssVarColorRegex.exec(cssContent)) !== null) {
    const varName = cssVarMatch[0].split(':')[0].replace('--', '');
    const colorValue = cssVarMatch[1];
    
    let hexValue = colorValue;
    if (colorValue.startsWith('rgb(')) {
      const rgbMatch = colorValue.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (rgbMatch) {
        hexValue = rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
      }
    } else if (colorValue.startsWith('hsl(')) {
      const hslMatch = colorValue.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
      if (hslMatch) {
        hexValue = hslToHex(parseInt(hslMatch[1]), parseInt(hslMatch[2]), parseInt(hslMatch[3]));
      }
    } else if (colorValue.startsWith('#')) {
      hexValue = colorValue.length === 4 
        ? `#${colorValue[1]}${colorValue[1]}${colorValue[2]}${colorValue[2]}${colorValue[3]}${colorValue[3]}`
        : colorValue.toLowerCase();
    }
    
    const existing = colorCounts.get(hexValue) || { count: 0, source: 'css-var' };
    colorCounts.set(hexValue, { 
      ...existing, 
      count: existing.count + 1,
      name: varName
    });
  }

  // Detect Tailwind CSS color classes
  const tailwindColorRegex = /(?:bg-|text-|border-|from-|to-|via-)([a-z]+)-(\d+)/g;
  let tailwindMatch;
  while ((tailwindMatch = tailwindColorRegex.exec(cssContent)) !== null) {
    const colorName = tailwindMatch[1];
    const shade = tailwindMatch[2];
    
    // This is a simplified mapping - in practice, you'd want a complete Tailwind color palette
    const tailwindColors: Record<string, Record<string, string>> = {
      'blue': { '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8' },
      'red': { '500': '#ef4444', '600': '#dc2626', '700': '#b91c1c' },
      'green': { '500': '#10b981', '600': '#059669', '700': '#047857' },
      'yellow': { '500': '#f59e0b', '600': '#d97706', '700': '#b45309' },
      'purple': { '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9' },
      'pink': { '500': '#ec4899', '600': '#db2777', '700': '#be185d' },
      'gray': { '500': '#6b7280', '600': '#4b5563', '700': '#374151' }
    };
    
    const hexValue = tailwindColors[colorName]?.[shade];
    if (hexValue) {
      const existing = colorCounts.get(hexValue) || { count: 0, source: 'tailwind' };
      colorCounts.set(hexValue, { 
        ...existing, 
        count: existing.count + 1,
        name: existing.name || `${colorName}-${shade}`
      });
    }
  }

  console.log(`🎨 Total unique colors found: ${colorCounts.size}`);

  // Convert to ColorData format
  colorCounts.forEach((data, hex) => {
    colors.push({
      project_id: projectId,
      name: data.name || `Color ${hex}`,
      hex_value: hex,
      rgb_value: hexToRgb(hex) || undefined,
      hsl_value: hexToHsl(hex) || undefined,
      usage_count: data.count,
      locations: [filePath],
      color_category: categorizeColor(hex, data.name)
    });
  });

  // Extract typography (font-family declarations)
  const fontFamilyRegex = /font-family:\s*([^;]+)/gi;
  const fontFamilies = new Set<string>();
  let fontMatch;
  
  while ((fontMatch = fontFamilyRegex.exec(cssContent)) !== null) {
    const fontValue = fontMatch[1].trim().replace(/['"]/g, '');
    fontFamilies.add(fontValue);
  }
  
  console.log(`📝 Found ${fontFamilies.size} font families`);

  Array.from(fontFamilies).forEach((fontFamily, index) => {
    // Extract font weights from the same context
    const fontWeights = new Set<string>();
    const fontSizes = new Set<string>();
    const lineHeights = new Set<string>();
    
    // Look for font-weight declarations
    const weightRegex = /font-weight:\s*([^;]+)/gi;
    let weightMatch;
    while ((weightMatch = weightRegex.exec(cssContent)) !== null) {
      fontWeights.add(weightMatch[1].trim());
    }
    
    // Look for font-size declarations
    const sizeRegex = /font-size:\s*([^;]+)/gi;
    let sizeMatch;
    while ((sizeMatch = sizeRegex.exec(cssContent)) !== null) {
      fontSizes.add(sizeMatch[1].trim());
    }
    
    // Look for line-height declarations
    const heightRegex = /line-height:\s*([^;]+)/gi;
    let heightMatch;
    while ((heightMatch = heightRegex.exec(cssContent)) !== null) {
      lineHeights.add(heightMatch[1].trim());
    }
    
    const isPrimary = index === 0 || fontFamily.toLowerCase().includes('primary') || 
                     fontFamily.toLowerCase().includes('main');
    
    typography.push({
      project_id: projectId,
      name: fontFamily.split(',')[0].trim(),
      font_family: fontFamily,
      font_weights: Array.from(fontWeights),
      font_sizes: Array.from(fontSizes),
      line_heights: Array.from(lineHeights),
      usage_description: `Font family used in ${filePath}`,
      locations: [filePath],
      is_primary: isPrimary
    });
  });

  // Extract spacing values (margin, padding, gap, etc.)
  const spacingRegex = /(margin|padding|gap|top|right|bottom|left|width|height):\s*([^;]+)/gi;
  const spacingValues = new Map<string, number>();
  let spacingMatch;
  
  while ((spacingMatch = spacingRegex.exec(cssContent)) !== null) {
    const property = spacingMatch[1];
    const values = spacingMatch[2].split(/\s+/);
    
    values.forEach(value => {
      value = value.trim();
      if (value.match(/^\d+(\.\d+)?(px|rem|em|pt|%)$/)) {
        spacingValues.set(value, (spacingValues.get(value) || 0) + 1);
      }
    });
  }
  
  console.log(`📏 Found ${spacingValues.size} spacing values`);

  spacingValues.forEach((count, value) => {
    const pixels = parseSpacingValue(value);
    const category = value.includes('margin') ? 'margin' : 
                    value.includes('padding') ? 'padding' : 'general';
    
    spacing.push({
      project_id: projectId,
      size_value: value,
      pixels: pixels,
      usage_count: count,
      spacing_category: category,
      usage_description: `Used ${count} times in ${filePath}`
    });
  });

  // Extract component styles (class-based patterns)
  const classRegex = /\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{([^}]+)\}/g;
  const componentPatterns = new Map<string, any>();
  let classMatch;
  
  while ((classMatch = classRegex.exec(cssContent)) !== null) {
    const className = classMatch[1];
    const styles = classMatch[2];
    
    // Categorize by common component patterns
    let styleType = 'custom';
    const variants: string[] = [];
    
    if (className.includes('btn') || className.includes('button')) {
      styleType = 'button';
      if (className.includes('primary')) variants.push('primary');
      if (className.includes('secondary')) variants.push('secondary');
      if (className.includes('outline')) variants.push('outline');
    } else if (className.includes('card')) {
      styleType = 'card';
    } else if (className.includes('form') || className.includes('input')) {
      styleType = 'form';
    } else if (className.includes('nav') || className.includes('menu')) {
      styleType = 'navigation';
    } else if (className.includes('modal') || className.includes('dialog')) {
      styleType = 'modal';
    }
    
    const key = `${styleType}-${className}`;
    if (!componentPatterns.has(key)) {
      // Parse CSS properties
      const cssProperties: Record<string, any> = {};
      const propertyRegex = /([a-zA-Z-]+):\s*([^;]+)/g;
      let propMatch;
      
      while ((propMatch = propertyRegex.exec(styles)) !== null) {
        cssProperties[propMatch[1].trim()] = propMatch[2].trim();
      }
      
      componentStyles.push({
        project_id: projectId,
        name: className,
        style_type: styleType,
        variants: variants.length > 0 ? variants : ['default'],
        css_properties: cssProperties,
        usage_description: `Component styles defined in ${filePath}`,
        locations: [filePath]
      });
    }
  }
  
  console.log(`🧩 Found ${componentStyles.length} component styles`);
  console.log(`✅ Design system analysis complete for ${filePath}: ${colors.length} colors, ${typography.length} typography, ${spacing.length} spacing, ${componentStyles.length} components`);

  return {
    colors,
    typography,
    spacing,
    componentStyles
  };
} 