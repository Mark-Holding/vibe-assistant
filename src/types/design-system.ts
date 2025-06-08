export interface ColorInfo {
  name: string;
  hex: string;
  usage: number;
  locations: string[];
}

export interface TypographyInfo {
  name: string;
  family: string;
  weight: string;
  usage: string;
}

export interface SpacingInfo {
  size: string;
  pixels: number;
  usage: string;
}

export interface ComponentStyleInfo {
  name: string;
  variants: number;
  usage: string;
}

export interface DesignSystemTabProps {
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
  }>;
  projectId: string;
} 