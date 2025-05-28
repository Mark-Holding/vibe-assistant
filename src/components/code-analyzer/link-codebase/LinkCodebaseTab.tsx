"use client";

import React from 'react';
import { Link, Folder, BarChart3, Network } from 'lucide-react';
import { FileUploader } from '../FileUploader';
import { FileData } from '../../../types/code-analyzer';

interface LinkCodebaseTabProps {
  onFilesUploaded: (files: FileData[]) => void;
}

export const LinkCodebaseTab: React.FC<LinkCodebaseTabProps> = ({ onFilesUploaded }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Link size={64} className="mx-auto text-blue-600 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Link Your Codebase
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Upload your project files to start analyzing your code structure, dependencies, and design patterns.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <FileUploader onFilesUploaded={onFilesUploaded} />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <Folder size={32} className="mx-auto text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">File Structure</h3>
            <p className="text-sm text-gray-600">
              Explore your project's organization and file hierarchy
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <BarChart3 size={32} className="mx-auto text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Code Analysis</h3>
            <p className="text-sm text-gray-600">
              Analyze functions, components, and code patterns
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <Network size={32} className="mx-auto text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Dependencies</h3>
            <p className="text-sm text-gray-600">
              Visualize relationships and dependencies between files
            </p>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Supported File Types</h4>
          <div className="flex flex-wrap gap-2">
            {[
              'JavaScript (.js)',
              'TypeScript (.ts)',
              'React (.jsx, .tsx)',
              'CSS (.css)',
              'SCSS (.scss)',
              'JSON (.json)',
              'Markdown (.md)'
            ].map((type) => (
              <span
                key={type}
                className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 