import React from 'react';
import { ProjectOverviewProps } from '../../types/code-analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart3 } from 'lucide-react';

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <BarChart3 size={20} className="mr-2 text-blue-600" />
          <CardTitle>Project Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Files</div>
              <div className="text-2xl font-semibold">{stats.totalFiles}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Total Size</div>
              <div className="text-2xl font-semibold">{stats.totalSize}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">File Types</h4>
            <div className="space-y-2">
              {Object.entries(stats.typeCount).map(([type, count]) => (
                <div key={type} className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">{type}</div>
                    <div className="h-2 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{
                          width: `${(count / stats.totalFiles) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-sm font-medium">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 