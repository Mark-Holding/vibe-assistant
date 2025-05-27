import React from 'react';
import { Code } from 'lucide-react';
import { AlgorithmInfo } from '../../../types/code-analysis';

interface AlgorithmsSectionProps {
  algorithms: AlgorithmInfo[];
}

const AlgorithmsSection: React.FC<AlgorithmsSectionProps> = ({ algorithms }) => (
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
);

export default AlgorithmsSection; 