import React, { useState, useMemo } from 'react';
import { Code, Search } from 'lucide-react';
import { AlgorithmInfo } from '../../../types/code-analysis';
import { Tooltip } from '../../ui/Tooltip';

interface AlgorithmsSectionProps {
  algorithms: AlgorithmInfo[];
}

// Tooltip content for Big O notation types
const getBigOTooltipContent = (notation: string) => {
  const tooltipData: Record<string, { name: string; example: string; description: string }> = {
    'O(1)': {
      name: 'Constant time',
      example: 'Accessing an array element',
      description: 'No matter the size, time stays the same'
    },
    'O(log n)': {
      name: 'Logarithmic time',
      example: 'Binary search',
      description: 'Cuts the problem in half each step'
    },
    'O(n)': {
      name: 'Linear time',
      example: 'Loop through array',
      description: 'Grows directly with input size'
    },
    'O(n log n)': {
      name: 'Log-linear time',
      example: 'Merge sort, quicksort (avg)',
      description: 'Efficient sorting'
    },
    'O(n²)': {
      name: 'Quadratic time',
      example: 'Nested loops (e.g., bubble sort)',
      description: 'Gets slow fast with large n'
    },
    'O(n³)': {
      name: 'Cubic time',
      example: 'Triple nested loops',
      description: 'Very slow for large inputs'
    },
    'O(2^n)': {
      name: 'Exponential time',
      example: 'Recursive Fibonacci',
      description: 'Becomes infeasible quickly'
    },
    'O(n!)': {
      name: 'Factorial time',
      example: 'Permutations / brute force',
      description: 'Very slow — avoid if possible'
    }
  };

  const data = tooltipData[notation];
  if (!data) return null;

  return (
    <div className="text-left">
      <div className="font-semibold text-white mb-2">{notation}</div>
      <div className="text-gray-200 mb-2">
        <div className="font-medium">{data.name}</div>
        <div className="text-sm mt-1">{data.description}</div>
      </div>
      <div className="pt-2 border-t border-gray-600">
        <div className="text-xs text-gray-400">
          <span className="font-medium">Example:</span> {data.example}
        </div>
      </div>
    </div>
  );
};

const AlgorithmsSection: React.FC<AlgorithmsSectionProps> = ({ algorithms }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  // Get unique complexity values for the filter dropdown
  const complexityOptions = useMemo(() => {
    const uniqueComplexities = Array.from(new Set(algorithms.map(algo => algo.complexity)));
    return uniqueComplexities.sort((a, b) => {
      // Sort by complexity order (better to worse)
      const complexityOrder = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n!)'];
      return complexityOrder.indexOf(a) - complexityOrder.indexOf(b);
    });
  }, [algorithms]);

  // Filter algorithms based on search term and complexity
  const filteredAlgorithms = useMemo(() => {
    let filtered = algorithms;
    
    // Filter by complexity
    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(algo => algo.complexity === selectedComplexity);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(algo => 
        algo.name.toLowerCase().includes(term) ||
        algo.file.toLowerCase().includes(term) ||
        algo.purpose.toLowerCase().includes(term) ||
        algo.complexity.toLowerCase().includes(term) ||
        algo.implementation.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [algorithms, searchTerm, selectedComplexity]);

  // Color coding for Big O complexity
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'O(1)':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'O(log n)':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'O(n)':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'O(n log n)':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'O(n²)':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'O(n³)':
        return 'bg-red-200 text-red-900 border-red-300';
      case 'O(2^n)':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'O(n!)':
        return 'bg-purple-200 text-purple-900 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Code size={20} className="mr-2 text-green-600" />
        Algorithms & Logic
        <span className="ml-3 text-sm font-normal text-gray-500">
          ({filteredAlgorithms.length} of {algorithms.length} algorithms)
        </span>
        <select
          value={selectedComplexity}
          onChange={(e) => setSelectedComplexity(e.target.value)}
          className="ml-4 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Complexities</option>
          {complexityOptions.map(complexity => {
            const count = algorithms.filter(algo => algo.complexity === complexity).length;
            return (
              <option key={complexity} value={complexity}>
                {complexity} ({count})
              </option>
            );
          })}
        </select>
      </h3>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search algorithms by name, file, purpose, complexity, or implementation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Big O Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Big O Complexity Guide:</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Tooltip
            content={getBigOTooltipContent('O(1)')}
            position="top"
            maxWidth="320px"
            delay={300}
          >
            <span className="px-2 py-1 rounded border bg-green-100 text-green-800 border-green-200 cursor-help hover:bg-green-200 transition-colors">
              O(1) - Excellent
            </span>
          </Tooltip>
          <Tooltip
            content={getBigOTooltipContent('O(log n)')}
            position="top"
            maxWidth="320px"
            delay={300}
          >
            <span className="px-2 py-1 rounded border bg-blue-100 text-blue-800 border-blue-200 cursor-help hover:bg-blue-200 transition-colors">
              O(log n) - Very Good
            </span>
          </Tooltip>
          <Tooltip
            content={getBigOTooltipContent('O(n)')}
            position="top"
            maxWidth="320px"
            delay={300}
          >
            <span className="px-2 py-1 rounded border bg-yellow-100 text-yellow-800 border-yellow-200 cursor-help hover:bg-yellow-200 transition-colors">
              O(n) - Good
            </span>
          </Tooltip>
          <Tooltip
            content={getBigOTooltipContent('O(n log n)')}
            position="top"
            maxWidth="320px"
            delay={300}
          >
            <span className="px-2 py-1 rounded border bg-orange-100 text-orange-800 border-orange-200 cursor-help hover:bg-orange-200 transition-colors">
              O(n log n) - Fair
            </span>
          </Tooltip>
          <Tooltip
            content={getBigOTooltipContent('O(n²)')}
            position="top"
            maxWidth="320px"
            delay={300}
          >
            <span className="px-2 py-1 rounded border bg-red-100 text-red-800 border-red-200 cursor-help hover:bg-red-200 transition-colors">
              O(n²) - Poor
            </span>
          </Tooltip>
          <Tooltip
            content={getBigOTooltipContent('O(2^n)')}
            position="top"
            maxWidth="320px"
            delay={300}
          >
            <span className="px-2 py-1 rounded border bg-purple-100 text-purple-800 border-purple-200 cursor-help hover:bg-purple-200 transition-colors">
              O(2^n) - Very Poor
            </span>
          </Tooltip>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-4">
        {filteredAlgorithms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            {searchTerm || selectedComplexity !== 'all' ? (
              <div>
                <p>No algorithms found matching the current filters:</p>
                {searchTerm && <p className="text-sm mt-1">Search: "{searchTerm}"</p>}
                {selectedComplexity !== 'all' && <p className="text-sm mt-1">Complexity: {selectedComplexity}</p>}
              </div>
            ) : (
              <p>No algorithms found</p>
            )}
          </div>
        ) : (
          filteredAlgorithms.map((algo, index) => (
            <div key={index} className="border-l-4 border-green-400 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{algo.name}</h4>
                <Tooltip
                  content={getBigOTooltipContent(algo.complexity)}
                  position="left"
                  maxWidth="320px"
                  delay={300}
                >
                  <span className={`text-sm font-mono px-3 py-1 rounded border cursor-help hover:opacity-80 transition-opacity ${getComplexityColor(algo.complexity)}`}>
                    {algo.complexity}
                  </span>
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600 mb-2">{algo.purpose}</p>
              <p className="text-xs text-gray-500 mb-1">💡 {algo.implementation}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{algo.file}:{algo.line}</code>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlgorithmsSection; 