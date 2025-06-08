import { supabase } from '../supabase';

// Database interfaces matching the schema
export interface ColorData {
  id?: string;
  project_id: string;
  name: string;
  hex_value: string;
  rgb_value?: string;
  hsl_value?: string;
  usage_count: number;
  locations: string[];
  color_category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TypographyData {
  id?: string;
  project_id: string;
  name: string;
  font_family: string;
  font_weights: string[];
  font_sizes: string[];
  line_heights: string[];
  usage_description?: string;
  locations: string[];
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SpacingData {
  id?: string;
  project_id: string;
  name?: string;
  size_value: string;
  pixels: number;
  usage_description?: string;
  usage_count: number;
  spacing_category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ComponentStyleData {
  id?: string;
  project_id: string;
  name: string;
  style_type: string;
  variants: string[];
  css_properties: Record<string, any>;
  usage_description?: string;
  locations: string[];
  created_at?: string;
  updated_at?: string;
}

export const designSystemService = {
  // Colors
  async saveColors(colors: ColorData[]): Promise<void> {
    if (colors.length === 0) return;
    
    // Remove duplicates based on the unique constraint (project_id, hex_value)
    const uniqueColors = colors.reduce((acc, color) => {
      const key = `${color.project_id}-${color.hex_value}`;
      if (!acc.has(key)) {
        acc.set(key, color);
      } else {
        // If duplicate, merge usage counts and locations
        const existing = acc.get(key)!;
        existing.usage_count += color.usage_count;
        existing.locations = [...new Set([...existing.locations, ...color.locations])];
      }
      return acc;
    }, new Map<string, ColorData>());
    
    const deduplicatedColors = Array.from(uniqueColors.values());
    
    console.log(`💾 Saving ${deduplicatedColors.length} unique colors (removed ${colors.length - deduplicatedColors.length} duplicates)`);
    
    const { error } = await supabase
      .from('colors')
      .upsert(deduplicatedColors, { 
        onConflict: 'project_id,hex_value',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving colors:', error);
      throw error;
    }
  },

  async getColors(projectId: string): Promise<ColorData[]> {
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .eq('project_id', projectId)
      .order('usage_count', { ascending: false });
    
    if (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
    
    return data || [];
  },

  // Typography
  async saveTypography(typography: TypographyData[]): Promise<void> {
    if (typography.length === 0) return;
    
    // Remove duplicates based on font_family
    const uniqueTypography = typography.reduce((acc, typo) => {
      const key = `${typo.project_id}-${typo.font_family}`;
      if (!acc.has(key)) {
        acc.set(key, typo);
      } else {
        // Merge font weights, sizes, and locations
        const existing = acc.get(key)!;
        existing.font_weights = [...new Set([...existing.font_weights, ...typo.font_weights])];
        existing.font_sizes = [...new Set([...existing.font_sizes, ...typo.font_sizes])];
        existing.line_heights = [...new Set([...existing.line_heights, ...typo.line_heights])];
        existing.locations = [...new Set([...existing.locations, ...typo.locations])];
      }
      return acc;
    }, new Map<string, TypographyData>());
    
    const deduplicatedTypography = Array.from(uniqueTypography.values());
    
    console.log(`💾 Saving ${deduplicatedTypography.length} unique typography entries`);
    
    const { error } = await supabase
      .from('typography')
      .upsert(deduplicatedTypography, { 
        onConflict: 'project_id,font_family',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving typography:', error);
      throw error;
    }
  },

  async getTypography(projectId: string): Promise<TypographyData[]> {
    const { data, error } = await supabase
      .from('typography')
      .select('*')
      .eq('project_id', projectId)
      .order('is_primary', { ascending: false });
    
    if (error) {
      console.error('Error fetching typography:', error);
      throw error;
    }
    
    return data || [];
  },

  // Spacing
  async saveSpacing(spacing: SpacingData[]): Promise<void> {
    if (spacing.length === 0) return;
    
    // Remove duplicates based on the unique constraint (project_id, size_value)
    const uniqueSpacing = spacing.reduce((acc, space) => {
      const key = `${space.project_id}-${space.size_value}`;
      if (!acc.has(key)) {
        acc.set(key, space);
      } else {
        // Merge usage counts
        const existing = acc.get(key)!;
        existing.usage_count += space.usage_count;
      }
      return acc;
    }, new Map<string, SpacingData>());
    
    const deduplicatedSpacing = Array.from(uniqueSpacing.values());
    
    console.log(`💾 Saving ${deduplicatedSpacing.length} unique spacing values`);
    
    const { error } = await supabase
      .from('spacing')
      .upsert(deduplicatedSpacing, { 
        onConflict: 'project_id,size_value',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving spacing:', error);
      throw error;
    }
  },

  async getSpacing(projectId: string): Promise<SpacingData[]> {
    const { data, error } = await supabase
      .from('spacing')
      .select('*')
      .eq('project_id', projectId)
      .order('pixels', { ascending: true });
    
    if (error) {
      console.error('Error fetching spacing:', error);
      throw error;
    }
    
    return data || [];
  },

  // Component Styles
  async saveComponentStyles(componentStyles: ComponentStyleData[]): Promise<void> {
    if (componentStyles.length === 0) return;
    
    // Remove duplicates based on name and style_type
    const uniqueStyles = componentStyles.reduce((acc, style) => {
      const key = `${style.project_id}-${style.name}-${style.style_type}`;
      if (!acc.has(key)) {
        acc.set(key, style);
      } else {
        // Merge variants and locations
        const existing = acc.get(key)!;
        existing.variants = [...new Set([...existing.variants, ...style.variants])];
        existing.locations = [...new Set([...existing.locations, ...style.locations])];
        existing.css_properties = { ...existing.css_properties, ...style.css_properties };
      }
      return acc;
    }, new Map<string, ComponentStyleData>());
    
    const deduplicatedStyles = Array.from(uniqueStyles.values());
    
    console.log(`💾 Saving ${deduplicatedStyles.length} unique component styles`);
    
    const { error } = await supabase
      .from('component_styles')
      .upsert(deduplicatedStyles, { 
        onConflict: 'project_id,name,style_type',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving component styles:', error);
      throw error;
    }
  },

  async getComponentStyles(projectId: string): Promise<ComponentStyleData[]> {
    const { data, error } = await supabase
      .from('component_styles')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    
    if (error) {
      console.error('Error fetching component styles:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get all design system data for a project
  async getAllDesignSystemData(projectId: string) {
    const [colors, typography, spacing, componentStyles] = await Promise.all([
      this.getColors(projectId),
      this.getTypography(projectId),
      this.getSpacing(projectId),
      this.getComponentStyles(projectId)
    ]);

    return {
      colors,
      typography,
      spacing,
      componentStyles
    };
  }
}; 