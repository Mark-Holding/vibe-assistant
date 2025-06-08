import React, { useState, useMemo } from 'react';
import { Layers, Search } from 'lucide-react';
import { ComponentInfo } from '../../../types/code-analysis';

interface ComponentsAnalysisSectionProps {
  components: ComponentInfo[];
}

const ComponentsAnalysisSection: React.FC<ComponentsAnalysisSectionProps> = ({ components }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter components based on search term
  const filteredComponents = useMemo(() => {
    if (!searchTerm.trim()) return components;
    
    const term = searchTerm.toLowerCase();
    return components.filter(comp => 
      comp.name.toLowerCase().includes(term) ||
      comp.file.toLowerCase().includes(term) ||
      comp.purpose.toLowerCase().includes(term) ||
      comp.props.some(prop => prop.toLowerCase().includes(term)) ||
      comp.dependencies.some(dep => dep.toLowerCase().includes(term)) ||
      comp.usedBy.some(user => user.toLowerCase().includes(term))
    );
  }, [components, searchTerm]);

  return (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <Layers size={20} className="mr-2 text-blue-600" />
      Components Analysis
      <span className="ml-3 text-sm font-normal text-gray-500">
        ({filteredComponents.length} of {components.length} components)
      </span>
    </h3>

    {/* Search Bar */}
    <div className="mb-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search components by name, file, purpose, props, or dependencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    {/* Explanation */}
    <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
      <p className="text-sm text-gray-700">
        <strong>Components</strong> are reusable pieces of UI that render visual elements in your application. 
        This analysis identifies React components, their props, dependencies, and how they're used throughout 
        your codebase to help you understand your component architecture and relationships.
      </p>
    </div>

    <div className="max-h-96 overflow-y-auto">
      {filteredComponents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Search size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No components found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredComponents.map((comp, index) => (
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
      )}
    </div>
  </div>
);
};

export default ComponentsAnalysisSection; 