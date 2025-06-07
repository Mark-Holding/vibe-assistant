import React from 'react';
import { FileTypeData } from '../../../types/code-analyzer';
import { FileTypeUtils } from './utils';
import { FileTypeTooltip } from '../../ui/FileTypeTooltip';

interface FileTypeBreakdownProps {
  breakdown: Record<string, FileTypeData>;
  totalFiles: number;
  totalLOC: number;
  totalFunctions: number;
  totalComponents: number;
  totalImportedFiles: number;
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
    category?: string;
  }>;
}

// Language colors similar to GitHub's language colors
const LANGUAGE_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a', 
  'CSS': '#563d7c',
  'SCSS': '#c6538c',
  'HTML': '#e34c26',
  'JSON': '#292929',
  'Markdown': '#083fa1',
  'Python': '#3572A5',
  'Java': '#b07219',
  'PHP': '#4F5D95',
  'C++': '#f34b7d',
  'C#': '#239120',
  'Ruby': '#701516',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Dart': '#00B4AB',
  'Swift': '#FA7343',
  'Kotlin': '#A97BFF',
  'Shell': '#89e051',
  'SQL': '#e38c00',
  'XML': '#0060ac',
  'YAML': '#cb171e',
  'TOML': '#9c4221',
  'Vue': '#4FC08D',
  'Svelte': '#ff3e00',
  'R': '#198CE7',
  'Lua': '#000080',
  'Perl': '#0298c3',
  'Scala': '#c22d40',
  'Clojure': '#db5855',
  'Elixir': '#6e4a7e',
  'Erlang': '#B83998',
  'Haskell': '#5e5086',
  'F#': '#b845fc',
  'OCaml': '#3be133',
  'Objective-C': '#438eff',
  'Objective-C++': '#6866fb',
  'Less': '#1d365d',
  'Stylus': '#ff6347',
  'Handlebars': '#f7931e',
  'Pug': '#a86454',
  'EJS': '#a91e50',
  'Liquid': '#67b8de',
  'Twig': '#c1d026',
  'Jinja2': '#a41e22',
  'GraphQL': '#e10098',
  'PowerShell': '#012456',
  'Batch': '#C1F12E',
  'HLSL': '#aace60',
  'GLSL': '#5686a5',
  'Protocol Buffers': '#3d85c6',
  'Thrift': '#D12127',
  'Other': '#ededed'
};

// Function to get language from file extension
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'ts': 'TypeScript',
    'tsx': 'TypeScript', // TSX is TypeScript with JSX
    'js': 'JavaScript', 
    'jsx': 'JavaScript', // JSX is JavaScript with JSX
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'SCSS',
    'html': 'HTML',
    'htm': 'HTML',
    'json': 'JSON',
    'md': 'Markdown',
    'py': 'Python',
    'java': 'Java',
    'php': 'PHP',
    'cpp': 'C++',
    'cc': 'C++',
    'cxx': 'C++',
    'cs': 'C#',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'dart': 'Dart',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'sh': 'Shell',
    'bash': 'Shell',
    'sql': 'SQL',
    'psql': 'SQL',
    'pgsql': 'SQL', 
    'plsql': 'SQL',
    'tsql': 'SQL',
    'mysql': 'SQL',
    'sqlite': 'SQL',
    'xml': 'XML',
    'yml': 'YAML',
    'yaml': 'YAML',
    'toml': 'TOML',
    'vue': 'Vue',
    'svelte': 'Svelte',
    // Additional programming languages
    'r': 'R',
    'lua': 'Lua',
    'perl': 'Perl',
    'pl': 'Perl',
    'pm': 'Perl',
    'scala': 'Scala',
    'clj': 'Clojure',
    'cljs': 'Clojure',
    'ex': 'Elixir',
    'exs': 'Elixir',
    'erl': 'Erlang',
    'hs': 'Haskell',
    'fs': 'F#',
    'ml': 'OCaml',
    'm': 'Objective-C',
    'mm': 'Objective-C++',
    // CSS preprocessors
    'less': 'Less',
    'styl': 'Stylus',
    // Template engines
    'hbs': 'Handlebars',
    'mustache': 'Handlebars',
    'pug': 'Pug',
    'jade': 'Pug',
    'ejs': 'EJS',
    'liquid': 'Liquid',
    'twig': 'Twig',
    'j2': 'Jinja2',
    // Query languages
    'graphql': 'GraphQL',
    'gql': 'GraphQL',
    // Scripting
    'ps1': 'PowerShell',
    'bat': 'Batch',
    'cmd': 'Batch',
    // Shaders
    'hlsl': 'HLSL',
    'glsl': 'GLSL',
    'vert': 'GLSL',
    'frag': 'GLSL',
    // Protocol/Interface Definition
    'proto': 'Protocol Buffers',
    'thrift': 'Thrift'
  };
  return languageMap[ext || ''] || 'Other';
};

// Language breakdown component
const LanguageBreakdown: React.FC<{ files: Array<{ name: string; size: number; category?: string }> }> = ({ files }) => {
  // Filter to only source code files (exclude config, dependencies, documentation, etc.)
  const sourceFiles = files.filter(file => {
    const language = getLanguageFromExtension(file.name);
    const category = file.category?.toLowerCase() || '';
    
    // Include actual programming language files
    const isSourceLanguage = [
      'TypeScript', 'JavaScript', 'CSS', 'SCSS', 'HTML', 'SQL', 'Python', 'Java', 'PHP', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Dart', 'Swift', 'Kotlin', 'Shell', 'Vue', 'Svelte',
      'R', 'Lua', 'Perl', 'Scala', 'Clojure', 'Elixir', 'Erlang', 'Haskell', 'F#', 'OCaml', 'Objective-C', 'Objective-C++',
      'Less', 'Stylus', 'Handlebars', 'Pug', 'EJS', 'Liquid', 'Twig', 'Jinja2', 'GraphQL', 'PowerShell', 'Batch', 'HLSL', 'GLSL', 'Protocol Buffers', 'Thrift'
    ].includes(language);
    
    // Don't exclude based on category for now - let file extension be the primary filter
    // This is more similar to how GitHub works - it primarily looks at file content/extension
    
    // Exclude node_modules and common non-source paths  
    const isNodeModules = file.name.includes('node_modules') || file.name.includes('.git');
    
    // Exclude common config file names that aren't source code
    const configFileNames = ['package.json', 'package-lock.json', 'yarn.lock', 'tsconfig.json', '.gitignore', '.eslintrc', '.prettierrc', 'webpack.config', 'vite.config', 'next.config'];
    const isConfigFile = configFileNames.some(configName => file.name.toLowerCase().includes(configName.toLowerCase()));
    
    return isSourceLanguage && !isNodeModules && !isConfigFile;
  });

  // Calculate language statistics from filtered source files
  const languageStats = sourceFiles.reduce((acc, file) => {
    const language = getLanguageFromExtension(file.name);
    if (!acc[language]) {
      acc[language] = { count: 0, bytes: 0 };
    }
    acc[language].count++;
    acc[language].bytes += file.size;
    return acc;
  }, {} as Record<string, { count: number; bytes: number }>);

  const totalBytes = Object.values(languageStats).reduce((sum, stat) => sum + stat.bytes, 0);
  
  // Sort languages by bytes (descending) and filter out very small percentages
  const sortedLanguages = Object.entries(languageStats)
    .map(([language, stats]) => ({
      language,
      ...stats,
      percentage: (stats.bytes / totalBytes) * 100
    }))
    .filter(item => item.percentage > 0.5) // Only show languages > 0.5%
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 10); // Limit to top 10 languages

  if (sortedLanguages.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Source Code Languages</h4>
      
      {/* Language bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-3">
        {sortedLanguages.map(({ language, percentage }) => (
          <div
            key={language}
            className="transition-all duration-200 hover:opacity-80"
            style={{
              width: `${percentage}%`,
              backgroundColor: LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Other']
            }}
            title={`${language} ${percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Language legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {sortedLanguages.map(({ language, percentage }) => (
          <div key={language} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-1.5"
              style={{ backgroundColor: LANGUAGE_COLORS[language] || LANGUAGE_COLORS['Other'] }}
            />
            <span className="text-gray-600">
              {language} {percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// List of all possible categories (labels and colors)
const ALL_CATEGORIES = [
  'Page',
  'Service',
  'Component',
  'Utility',
  'Types',
  'Styles',
  'Config',
  'Dependencies',
  'Tests',
  'Documentation',
  'HTML',
  'Middleware',
  'Database/Model',
  'State Management',
  'Environment',
  'Other',
];

export const FileTypeBreakdown: React.FC<FileTypeBreakdownProps> = ({
  breakdown,
  totalFiles,
  totalLOC,
  totalFunctions,
  totalComponents,
  totalImportedFiles,
  files
}) => {
  // Build a sorted array of categories by count (descending)
  const sortedCategories = ALL_CATEGORIES
    .map(label => ({
      label,
      data: breakdown[label] || { count: 0, loc: 0, color: FileTypeUtils.categorizeFile(label).color, functions: 0 }
    }))
    .sort((a, b) => b.data.count - a.data.count);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">File Type Breakdown</h3>
      
      {/* Language Breakdown */}
      <LanguageBreakdown files={files} />
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Files</div>
          <div className="text-2xl font-semibold">{totalImportedFiles}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Source Files</div>
          <div className="text-2xl font-semibold">{totalFiles}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total LOC</div>
          <div className="text-2xl font-semibold">{totalLOC}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Functions</div>
          <div className="text-2xl font-semibold">{totalFunctions}</div>
        </div>
      </div>

      {/* File Type Distribution */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">File Categories</h4>
        {sortedCategories.map(({ label, data }) => (
          <div key={label} className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: data.color }}
                />
                <FileTypeTooltip fileType={label} position="left">
                  <div className="text-sm text-gray-600 cursor-help hover:text-gray-800 transition-colors">
                    {label}
                  </div>
                </FileTypeTooltip>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-1">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${totalFiles > 0 ? (data.count / totalFiles) * 100 : 0}%`,
                    backgroundColor: data.color
                  }}
                />
              </div>
            </div>
            <div className="ml-4 text-sm font-medium">
              {data.count} files
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 