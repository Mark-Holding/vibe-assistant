import React from 'react';
import { Layers } from 'lucide-react';
import { ComponentInfo } from '../../../types/code-analysis';

interface ComponentsAnalysisSectionProps {
  components: ComponentInfo[];
}

const ComponentsAnalysisSection: React.FC<ComponentsAnalysisSectionProps> = ({ components }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <Layers size={20} className="mr-2 text-blue-600" />
      Components Analysis
      <span className="ml-3 text-sm font-normal text-gray-500">
        ({components.length} components)
      </span>
    </h3>

    {/* Explanation */}
    <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
      <p className="text-sm text-gray-700">
        <strong>Components</strong> are reusable pieces of UI that render visual elements in your application. 
        This analysis identifies React components, their props, dependencies, and how they're used throughout 
        your codebase to help you understand your component architecture and relationships.
      </p>
    </div>

    <div className="max-h-96 overflow-y-auto">
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
  </div>
);

export default ComponentsAnalysisSection; 