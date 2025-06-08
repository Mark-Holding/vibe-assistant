import React, { useState, useMemo } from 'react';
import { Zap, Search } from 'lucide-react';
import { FunctionInfo } from '../../../types/code-analysis';

interface FunctionsAnalysisSectionProps {
  functions: FunctionInfo[];
  isLoading: boolean;
}

const FunctionsAnalysisSection: React.FC<FunctionsAnalysisSectionProps> = ({ functions, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter functions based on search term
  const filteredFunctions = useMemo(() => {
    if (!searchTerm.trim()) return functions;
    
    const term = searchTerm.toLowerCase();
    return functions.filter(func => 
      func.name.toLowerCase().includes(term) ||
      func.file.toLowerCase().includes(term) ||
      func.type.toLowerCase().includes(term) ||
      func.purpose.toLowerCase().includes(term) ||
      func.complexity.toLowerCase().includes(term)
    );
  }, [functions, searchTerm]);

  return (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      <Zap size={20} className="mr-2 text-purple-600" />
      Functions Analysis
      <span className="ml-3 text-sm font-normal text-gray-500">
        ({filteredFunctions.length} of {functions.length} functions)
      </span>
    </h3>

    {/* Search Bar */}
    <div className="mb-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search functions by name, file, type, purpose, or complexity..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>

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
          {filteredFunctions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No functions found matching "{searchTerm}"</p>
            </div>
          ) : (
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
                {filteredFunctions.map((func, index) => (
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
          )}
        </div>
      </div>
    )}
  </div>
);
};

export default FunctionsAnalysisSection; 