import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DataFlowInfo } from '../../../types/code-analysis';

interface DataFlowSectionProps {
  dataFlow: DataFlowInfo[];
}

const DataFlowSection: React.FC<DataFlowSectionProps> = ({ dataFlow }) => (
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
);

export default DataFlowSection; 