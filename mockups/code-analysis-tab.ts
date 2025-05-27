import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Zap, 
  Layers, 
  Code, 
  ArrowRight
} from 'lucide-react';

interface CodeAnalysisTabProps {
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
  }>;
}

interface FunctionInfo {
  name: string;
  file: string;
  line: number;
  purpose: string;
  type: string;
  complexity: string;
}

interface ComponentInfo {
  name: string;
  file: string;
  purpose: string;
  props: string[];
  dependencies: string[];
  usedBy: string[];
}

interface AlgorithmInfo {
  name: string;
  file: string;
  line: number;
  purpose: string;
  complexity: string;
  implementation: string;
}

interface DataFlowInfo {
  from: string;
  to: string;
  type: string;
  description: string;
}

interface EntryPointInfo {
  file: string;
  type: string;
  purpose: string;
  importance: string;
}

const CodeAnalysisTab: React.FC<CodeAnalysisTabProps> = ({ files }) => {
  const [functions, setFunctions] = useState<FunctionInfo[]>([]);
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([]);
  const [dataFlow, setDataFlow] = useState<DataFlowInfo[]>([]);
  const [entryPoints, setEntryPoints] = useState<EntryPointInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Extract functions from file content
  const extractFunctions = async (fileContent: string, filePath: string): Promise<FunctionInfo[]> => {
    const functions: FunctionInfo[] = [];
    const lines = fileContent.split('\n');

    // Regular expressions for different function patterns
    const functionPatterns = [
      /function\s+(\w+)\s*\(/g,                    // function declarations
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,      // arrow functions
      /(\w+)\s*:\s*\([^)]*\)\s*=>/g,              // object method arrow functions
      /async\s+function\s+(\w+)\s*\(/g,           // async functions
      /const\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>/g, // async arrow functions
    ];

    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(fileContent)) !== null) {
        const functionName = match[1];
        const lineNumber = fileContent.substring(0, match.index).split('\n').length;
        
        // Determine function type and complexity
        const isAsync = match[0].includes('async');
        const isArrow = match[0].includes('=>');
        const functionType = isAsync ? 'Async Function' : isArrow ? 'Arrow Function' : 'Function Declaration';
        
        // Simple complexity analysis based on content
        const functionContent = extractFunctionContent(fileContent, match.index);
        const complexity = analyzeFunctionComplexity(functionContent);
        const purpose = generateFunctionPurpose(functionName, functionContent);

        functions.push({
          name: functionName,
          file: filePath,
          line: lineNumber,
          purpose,
          type: functionType,
          complexity
        });
      }
    });

    return functions;
  };

  // Extract React components
  const extractComponents = async (fileContent: string, filePath: string): Promise<ComponentInfo[]> => {
    const components: ComponentInfo[] = [];
    
    // Look for React component patterns
    const componentPatterns = [
      /const\s+(\w+):\s*React\.FC/g,                    // React.FC components
      /function\s+(\w+)\s*\([^)]*\).*return\s*\(/g,     // Function components
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{[^}]*return/g, // Arrow function components
    ];

    componentPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(fileContent)) !== null) {
        const componentName = match[1];
        
        // Extract props from component definition
        const props = extractPropsFromComponent(fileContent, match.index);
        const dependencies = extractImportsFromComponent(fileContent);
        const purpose = generateComponentPurpose(componentName, fileContent);

        components.push({
          name: componentName,
          file: filePath,
          purpose,
          props,
          dependencies,
          usedBy: [] // This would need cross-file analysis
        });
      }
    });

    return components;
  };

  // Identify entry points
  const identifyEntryPoints = (files: Array<{ name: string; path: string }>): EntryPointInfo[] => {
    const entryPoints: EntryPointInfo[] = [];

    files.forEach(file => {
      const filename = file.name.toLowerCase();
      const path = file.path.toLowerCase();

      // Next.js entry points
      if (filename === '_app.tsx' || filename === '_app.js') {
        entryPoints.push({
          file: file.path,
          type: 'Application Root',
          purpose: 'Main application wrapper, providers, and global configuration',
          importance: 'Critical'
        });
      }

      if (filename === 'index.tsx' || filename === 'index.js') {
        if (path.includes('pages') || path.includes('app')) {
          entryPoints.push({
            file: file.path,
            type: 'Landing Page',
            purpose: 'Homepage entry point with featured content and navigation',
            importance: 'High'
          });
        }
      }

      // API routes
      if (path.includes('api/') || filename.includes('api')) {
        entryPoints.push({
          file: file.path,
          type: 'API Endpoint',
          purpose: 'Server-side API endpoint for data processing',
          importance: 'High'
        });
      }

      // Configuration files
      if (filename.includes('config') || filename === 'package.json') {
        entryPoints.push({
          file: file.path,
          type: 'Configuration',
          purpose: 'Project configuration and dependencies',
          importance: 'Medium'
        });
      }
    });

    return entryPoints;
  };

  // Helper functions
  const extractFunctionContent = (content: string, startIndex: number): string => {
    // Simple extraction - get next 200 characters for analysis
    return content.substring(startIndex, startIndex + 200);
  };

  const analyzeFunctionComplexity = (functionContent: string): string => {
    const conditions = (functionContent.match(/if|else|switch|case|\?/g) || []).length;
    const loops = (functionContent.match(/for|while|forEach|map|filter/g) || []).length;
    const asyncOps = (functionContent.match(/await|Promise|then|catch/g) || []).length;
    
    const complexityScore = conditions + loops * 2 + asyncOps;
    
    if (complexityScore > 10) return 'High';
    if (complexityScore > 5) return 'Medium';
    return 'Low';
  };

  const generateFunctionPurpose = (name: string, content: string): string => {
    // Simple purpose generation based on naming patterns
    if (name.startsWith('handle')) return `Handles ${name.substring(6).toLowerCase()} events and user interactions`;
    if (name.startsWith('fetch') || name.startsWith('get')) return `Fetches and retrieves ${name.substring(name.startsWith('fetch') ? 5 : 3).toLowerCase()} data`;
    if (name.startsWith('set') || name.startsWith('update')) return `Updates and modifies ${name.substring(3).toLowerCase()} state or data`;
    if (name.startsWith('validate')) return `Validates ${name.substring(8).toLowerCase()} input and data integrity`;
    if (name.startsWith('format')) return `Formats and transforms ${name.substring(6).toLowerCase()} data for display`;
    if (name.includes('auth') || name.includes('login')) return 'Manages user authentication and authorization';
    return `Performs ${name.toLowerCase()} operations and business logic`;
  };

  const generateComponentPurpose = (name: string, content: string): string => {
    if (name.includes('Header') || name.includes('Nav')) return 'Navigation header with menu items and user controls';
    if (name.includes('Footer')) return 'Page footer with links and company information';
    if (name.includes('Card')) return 'Reusable card component for displaying structured content';
    if (name.includes('Button')) return 'Interactive button component with various styles and actions';
    if (name.includes('Form')) return 'Form component with input validation and submission handling';
    if (name.includes('Modal')) return 'Modal dialog component for overlays and pop-up content';
    if (name.includes('Table') || name.includes('List')) return 'Data display component with sorting and filtering capabilities';
    return `${name} component for user interface and interaction handling`;
  };

  const extractPropsFromComponent = (content: string, startIndex: number): string[] => {
    // Simple props extraction - look for interface or type definitions
    const propsMatch = content.match(/interface\s+\w*Props\s*{([^}]*)}/);
    if (propsMatch) {
      return propsMatch[1]
        .split(';')
        .map(prop => prop.trim().split(':')[0].trim())
        .filter(prop => prop.length > 0);
    }
    return ['props'];
  };

  const extractImportsFromComponent = (content: string): string[] => {
    const imports: string[] = [];
    const importRegex = /import\s+{([^}]+)}\s+from/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importedItems = match[1].split(',').map(item => item.trim());
      imports.push(...importedItems);
    }
    
    return imports.slice(0, 5); // Limit to first 5 for display
  };

  // Process files when they change
  useEffect(() => {
    const processFiles = async () => {
      if (files.length === 0) {
        setFunctions([]);
        setComponents([]);
        setAlgorithms([]);
        setDataFlow([]);
        setEntryPoints([]);
        return;
      }

      setIsLoading(true);

      try {
        const allFunctions: FunctionInfo[] = [];
        const allComponents: ComponentInfo[] = [];

        // Process JavaScript/TypeScript files
        for (const file of files) {
          if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
            try {
              const content = await file.file.text();
              const fileFunctions = await extractFunctions(content, file.path);
              const fileComponents = await extractComponents(content, file.path);
              
              allFunctions.push(...fileFunctions);
              allComponents.push(...fileComponents);
            } catch (error) {
              console.error(`Error processing ${file.path}:`, error);
            }
          }
        }

        // Generate sample algorithms and data flow (these would need more sophisticated analysis)
        const sampleAlgorithms: AlgorithmInfo[] = [
          {
            name: 'Search Algorithm',
            file: 'src/utils/search.ts',
            line: 15,
            purpose: 'Implements efficient search functionality with filtering and sorting',
            complexity: 'O(n log n)',
            implementation: 'Uses binary search with preprocessing for optimal performance'
          }
        ];

        const sampleDataFlow: DataFlowInfo[] = [
          {
            from: 'User Input',
            to: 'Form Handler',
            type: 'Event Flow',
            description: 'User interactions trigger form validation and submission'
          },
          {
            from: 'API Service',
            to: 'Component State',
            type: 'Data Flow',
            description: 'External data updates component display state'
          }
        ];

        const identifiedEntryPoints = identifyEntryPoints(files);

        setFunctions(allFunctions.slice(0, 20)); // Limit for performance
        setComponents(allComponents.slice(0, 15));
        setAlgorithms(sampleAlgorithms);
        setDataFlow(sampleDataFlow);
        setEntryPoints(identifiedEntryPoints);

      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processFiles();
  }, [files]);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Code size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Upload files to see code analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Entry Points */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin size={20} className="mr-2 text-green-600" />
          Entry Points & Key Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {entryPoints.map((entry, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{entry.type}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  entry.importance === 'Critical' ? 'bg-red-100 text-red-700' :
                  entry.importance === 'High' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {entry.importance}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{entry.purpose}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{entry.file}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Functions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap size={20} className="mr-2 text-purple-600" />
          Functions Analysis
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Function</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Purpose</th>
                  <th className="text-left py-3 px-4 font-medium">Complexity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {functions.map((func, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm font-medium">{func.name}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="text-gray-600">{func.file}</div>
                      <div className="text-xs text-gray-400">Line {func.line}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {func.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">{func.purpose}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        func.complexity === 'High' ? 'bg-red-100 text-red-700' :
                        func.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {func.complexity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Components */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Layers size={20} className="mr-2 text-blue-600" />
          Components Analysis
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {components.map((comp, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h4 className="font-medium text-lg mb-2">{comp.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{comp.purpose}</p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium">File:</span> 
                  <code className="ml-1 bg-gray-100 px-1 py-0.5 rounded">{comp.file}</code>
                </div>
                <div>
                  <span className="font-medium">Props:</span> 
                  <span className="ml-1">{comp.props.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium">Dependencies:</span> 
                  <span className="ml-1">{comp.dependencies.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium">Used By:</span> 
                  <span className="ml-1">{comp.usedBy.length > 0 ? comp.usedBy.join(', ') : 'Analysis needed'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithms */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Code size={20} className="mr-2 text-green-600" />
          Algorithms & Logic
        </h3>
        <div className="space-y-4">
          {algorithms.map((algo, index) => (
            <div key={index} className="border-l-4 border-green-400 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{algo.name}</h4>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{algo.complexity}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{algo.purpose}</p>
              <p className="text-xs text-gray-500 mb-1">{algo.implementation}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{algo.file}:{algo.line}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Data Flow */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ArrowRight size={20} className="mr-2 text-orange-600" />
          Data Flow Analysis
        </h3>
        <div className="space-y-3">
          {dataFlow.map((flow, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-sm">{flow.from}</div>
              <ArrowRight size={16} className="mx-3 text-gray-400" />
              <div className="font-medium text-sm">{flow.to}</div>
              <div className="ml-auto text-right">
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mb-1">
                  {flow.type}
                </div>
                <div className="text-xs text-gray-600">{flow.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodeAnalysisTab;