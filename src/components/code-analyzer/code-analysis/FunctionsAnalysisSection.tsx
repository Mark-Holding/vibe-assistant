import React from 'react';
import { Zap } from 'lucide-react';
import { FunctionInfo } from '../../../types/code-analysis';

interface FunctionsAnalysisSectionProps {
  functions: FunctionInfo[];
  isLoading: boolean;
}

const FunctionsAnalysisSection: React.FC<FunctionsAnalysisSectionProps> = ({ functions, isLoading }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <Zap size={20} className="mr-2 text-purple-600" />
      Functions Analysis
      <span className="ml-3 text-sm font-normal text-gray-500">
        ({functions.length} functions)
      </span>
    </h3>

    {/* Explanation */}
    <div className="bg-gray-50 border-l-4 border-purple-500 p-4 mb-6">
      <p className="text-sm text-gray-700">
        <strong>Functions</strong> are reusable blocks of code that perform specific tasks in your application. 
        This analysis identifies all functions, methods, components, and hooks in your codebase, along with their 
        purpose, complexity level, and location to help you understand your code structure and identify areas for optimization.
      </p>
    </div>

    {isLoading ? (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
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
    )}
  </div>
);

export default FunctionsAnalysisSection; 