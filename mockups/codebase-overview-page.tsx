import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Code, 
  Palette, 
  BarChart3, 
  ChevronRight, 
  ChevronDown,
  MapPin,
  Zap,
  Layers,
  ArrowRight,
  Eye,
  Search,
  Filter,
  Download
} from 'lucide-react';

const CodebaseOverview = () => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'components']));
  const [selectedTab, setSelectedTab] = useState('structure');
  const [selectedFile, setSelectedFile] = useState(null);

  // Mock data for demonstration
  const projectStructure = {
    name: 'my-nextjs-app',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        loc: 2847,
        children: [
          {
            name: 'components',
            type: 'folder',
            loc: 1923,
            children: [
              { name: 'Header.tsx', type: 'file', fileType: 'React Component', loc: 156, functions: 3 },
              { name: 'Navigation.tsx', type: 'file', fileType: 'React Component', loc: 203, functions: 5 },
              { name: 'Button.tsx', type: 'file', fileType: 'React Component', loc: 89, functions: 2 },
              { name: 'Modal.tsx', type: 'file', fileType: 'React Component', loc: 234, functions: 6 }
            ]
          },
          {
            name: 'pages',
            type: 'folder',
            loc: 567,
            children: [
              { name: 'index.tsx', type: 'file', fileType: 'Next.js Page', loc: 234, functions: 4 },
              { name: 'about.tsx', type: 'file', fileType: 'Next.js Page', loc: 156, functions: 2 },
              { name: 'contact.tsx', type: 'file', fileType: 'Next.js Page', loc: 177, functions: 3 }
            ]
          },
          {
            name: 'utils',
            type: 'folder',
            loc: 357,
            children: [
              { name: 'helpers.ts', type: 'file', fileType: 'Utility', loc: 178, functions: 8 },
              { name: 'api.ts', type: 'file', fileType: 'API Utils', loc: 179, functions: 6 }
            ]
          }
        ]
      },
      {
        name: 'styles',
        type: 'folder',
        loc: 456,
        children: [
          { name: 'globals.css', type: 'file', fileType: 'CSS', loc: 234, functions: 0 },
          { name: 'components.css', type: 'file', fileType: 'CSS', loc: 222, functions: 0 }
        ]
      },
      { name: 'package.json', type: 'file', fileType: 'Config', loc: 45, functions: 0 },
      { name: 'README.md', type: 'file', fileType: 'Documentation', loc: 67, functions: 0 }
    ]
  };

  const fileTypeBreakdown = {
    'React Component': { count: 12, loc: 2340, color: '#61dafb' },
    'Next.js Page': { count: 8, loc: 1456, color: '#000000' },
    'Utility': { count: 6, loc: 890, color: '#f7df1e' },
    'CSS': { count: 4, loc: 567, color: '#1572b6' },
    'Config': { count: 3, loc: 234, color: '#6b7280' },
    'Documentation': { count: 2, loc: 123, color: '#22c55e' }
  };

  const functions = [
    {
      name: 'handleSubmit',
      file: 'src/components/ContactForm.tsx',
      line: 45,
      purpose: 'Handles form submission, validates input data, and sends contact information to the API endpoint',
      type: 'Event Handler',
      complexity: 'Medium'
    },
    {
      name: 'fetchUserData',
      file: 'src/utils/api.ts',
      line: 23,
      purpose: 'Fetches user profile data from the backend API with error handling and retry logic',
      type: 'API Function',
      complexity: 'High'
    },
    {
      name: 'formatCurrency',
      file: 'src/utils/helpers.ts',
      line: 12,
      purpose: 'Formats numeric values as currency strings with proper locale and currency symbol',
      type: 'Utility Function',
      complexity: 'Low'
    },
    {
      name: 'useAuth',
      file: 'src/hooks/useAuth.ts',
      line: 8,
      purpose: 'Custom React hook that manages user authentication state and provides login/logout methods',
      type: 'React Hook',
      complexity: 'High'
    }
  ];

  const components = [
    {
      name: 'Header',
      file: 'src/components/Header.tsx',
      purpose: 'Main navigation header with logo, menu items, and user authentication controls',
      props: ['title', 'user', 'onLogout'],
      dependencies: ['Navigation', 'UserMenu'],
      usedBy: ['Layout', 'HomePage']
    },
    {
      name: 'ProductCard',
      file: 'src/components/ProductCard.tsx',
      purpose: 'Displays product information including image, name, price, and action buttons',
      props: ['product', 'onAddToCart', 'onViewDetails'],
      dependencies: ['Button', 'Image'],
      usedBy: ['ProductGrid', 'SearchResults']
    },
    {
      name: 'DataTable',
      file: 'src/components/DataTable.tsx',
      purpose: 'Reusable table component with sorting, filtering, and pagination capabilities',
      props: ['data', 'columns', 'onSort', 'onFilter'],
      dependencies: ['Pagination', 'SortIcon'],
      usedBy: ['UsersList', 'OrdersPage', 'Analytics']
    }
  ];

  const algorithms = [
    {
      name: 'Binary Search',
      file: 'src/utils/search.ts',
      line: 34,
      purpose: 'Efficiently searches sorted arrays using divide-and-conquer approach',
      complexity: 'O(log n)',
      implementation: 'Recursive implementation with bounds checking'
    },
    {
      name: 'Debounce',
      file: 'src/hooks/useDebounce.ts',
      line: 15,
      purpose: 'Delays function execution until after specified time has elapsed since last call',
      complexity: 'O(1)',
      implementation: 'Uses setTimeout with cleanup on each new call'
    },
    {
      name: 'Cache Manager',
      file: 'src/utils/cache.ts',
      line: 67,
      purpose: 'LRU cache implementation for optimizing API response storage',
      complexity: 'O(1) average',
      implementation: 'HashMap with doubly-linked list for efficient access'
    }
  ];

  const dataFlow = [
    {
      from: 'HomePage',
      to: 'ProductService',
      type: 'API Call',
      description: 'Fetches featured products on page load'
    },
    {
      from: 'ProductService',
      to: 'ProductCard',
      type: 'Data Flow',
      description: 'Passes product data to display components'
    },
    {
      from: 'Header',
      to: 'AuthContext',
      type: 'State Access',
      description: 'Reads user authentication status'
    },
    {
      from: 'ContactForm',
      to: 'EmailService',
      type: 'API Call',
      description: 'Sends form data to email processing service'
    }
  ];

  const entryPoints = [
    {
      file: 'src/pages/_app.tsx',
      type: 'Application Root',
      purpose: 'Main application wrapper, providers, and global configuration',
      importance: 'Critical'
    },
    {
      file: 'src/pages/index.tsx',
      type: 'Landing Page',
      purpose: 'Homepage entry point with featured content and navigation',
      importance: 'High'
    },
    {
      file: 'src/utils/api.ts',
      type: 'API Layer',
      purpose: 'Central API configuration and request handling utilities',
      importance: 'High'
    }
  ];

  const cssAnalysis = {
    colors: [
      { name: 'Primary Blue', hex: '#3B82F6', usage: 23, locations: ['buttons', 'links', 'headers'] },
      { name: 'Success Green', hex: '#10B981', usage: 12, locations: ['success messages', 'badges'] },
      { name: 'Warning Orange', hex: '#F59E0B', usage: 8, locations: ['alerts', 'warnings'] },
      { name: 'Error Red', hex: '#EF4444', usage: 6, locations: ['error states', 'validation'] },
      { name: 'Text Gray', hex: '#374151', usage: 45, locations: ['body text', 'labels'] },
      { name: 'Background Light', hex: '#F9FAFB', usage: 18, locations: ['page backgrounds', 'cards'] }
    ],
    typography: [
      { name: 'Heading Font', family: 'Inter', weight: '600-700', usage: 'h1, h2, h3 elements' },
      { name: 'Body Font', family: 'Inter', weight: '400-500', usage: 'paragraphs, labels' },
      { name: 'Code Font', family: 'Fira Code', weight: '400', usage: 'code blocks, inline code' }
    ],
    spacing: [
      { size: '4px', usage: 'Tiny gaps, borders' },
      { size: '8px', usage: 'Small spacing, icon gaps' },
      { size: '16px', usage: 'Standard component spacing' },
      { size: '24px', usage: 'Section spacing' },
      { size: '32px', usage: 'Large gaps, card spacing' }
    ],
    components: [
      { name: 'Button Styles', variants: 4, usage: 'primary, secondary, outline, ghost' },
      { name: 'Card Styles', variants: 2, usage: 'default, elevated' },
      { name: 'Form Styles', variants: 3, usage: 'input, textarea, select' }
    ]
  };

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (node, path = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(currentPath);

    if (node.type === 'file') {
      return (
        <div key={currentPath} className="flex items-center py-1 px-2 hover:bg-gray-50 rounded text-sm">
          <FileText size={14} className="mr-2 text-blue-600" />
          <span className="flex-1">{node.name}</span>
          <span className="text-xs text-gray-500 mr-2">{node.fileType}</span>
          <span className="text-xs text-gray-400">{node.loc} LOC</span>
        </div>
      );
    }

    return (
      <div key={currentPath}>
        <div 
          className="flex items-center py-1 px-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
          onClick={() => toggleFolder(currentPath)}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {isExpanded ? <FolderOpen size={14} className="mr-2 text-blue-600" /> : <Folder size={14} className="mr-2 text-blue-600" />}
          <span className="flex-1 font-medium">{node.name}</span>
          {node.loc && <span className="text-xs text-gray-400">{node.loc} LOC</span>}
        </div>
        {isExpanded && node.children && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {node.children.map(child => renderFileTree(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Codebase Overview</h1>
          <p className="text-gray-600">Comprehensive analysis of your project structure and code</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'structure', label: 'File Structure', icon: Folder },
              { id: 'code', label: 'Code Analysis', icon: Code },
              { id: 'design', label: 'Design System', icon: Palette }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* File Structure Tab */}
        {selectedTab === 'structure' && (
          <div className="grid grid-cols-12 gap-6">
            {/* File Tree */}
            <div className="col-span-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Project Structure</h3>
                <div className="max-h-96 overflow-y-auto">
                  {renderFileTree(projectStructure)}
                </div>
              </div>
            </div>

            {/* File Type Breakdown */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">File Type Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(fileTypeBreakdown).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded mr-3"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="text-sm font-medium">{type}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{data.count}</div>
                        <div className="text-xs text-gray-500">{data.loc} LOC</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Files:</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total LOC:</span>
                    <span className="font-semibold">5,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Functions:</span>
                    <span className="font-semibold">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Components:</span>
                    <span className="font-semibold">23</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Analysis Tab */}
        {selectedTab === 'code' && (
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
                        <span className="ml-1">{comp.usedBy.join(', ')}</span>
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
        )}

        {/* Design System Tab */}
        {selectedTab === 'design' && (
          <div className="space-y-6">
            {/* Color Palette */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Palette size={20} className="mr-2 text-pink-600" />
                Color Palette
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cssAnalysis.colors.map((color, index) => (
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
            </div>

            {/* Typography */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Typography System</h3>
              <div className="space-y-4">
                {cssAnalysis.typography.map((typo, index) => (
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
                {cssAnalysis.spacing.map((space, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div 
                        className="bg-blue-200 border border-blue-300 mr-3"
                        style={{ width: `${parseInt(space.size) * 2}px`, height: '16px', minWidth: '8px' }}
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
                {cssAnalysis.components.map((comp, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{comp.name}</h4>
                    <div className="text-sm text-gray-600 mb-2">
                      {comp.variants} variants available
                    </div>
                    <div className="text-xs text-gray-500">{comp.usage}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodebaseOverview;