"use client";

import React, { useState } from 'react';
import { Link, Folder, BarChart3, Network, Github, Upload } from 'lucide-react';
import { FileUploader } from '../FileUploader';
import { FileData } from '../../../types/code-analyzer';
import { Button } from '../../ui/Button';

interface LinkCodebaseTabProps {
  onFilesUploaded: (files: FileData[]) => void;
}

export const LinkCodebaseTab: React.FC<LinkCodebaseTabProps> = ({ onFilesUploaded }) => {
  const [projectName, setProjectName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'upload' | 'github'>('upload');
  const [githubUrl, setGithubUrl] = useState('');

  const handleSubmit = () => {
    // TODO: Handle project creation and file upload
    console.log('Project Name:', projectName);
    if (selectedMethod === 'github') {
      console.log('GitHub URL:', githubUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Link size={64} className="mx-auto text-blue-600 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Link Your Codebase
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Upload your project files or connect your GitHub repository to start analyzing your code structure, dependencies, and design patterns.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Project Name Input */}
        <div className="mb-8">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Upload Method Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Choose Upload Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedMethod('upload')}
              className={`p-6 border rounded-lg flex flex-col items-center ${
                selectedMethod === 'upload'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <Upload size={32} className={`mb-3 ${selectedMethod === 'upload' ? 'text-blue-600' : 'text-gray-600'}`} />
              <h3 className="font-semibold text-gray-900 mb-2">Upload Files</h3>
              <p className="text-sm text-gray-600 text-center">
                Upload your project files directly from your computer
              </p>
            </button>

            <button
              onClick={() => setSelectedMethod('github')}
              className={`p-6 border rounded-lg flex flex-col items-center ${
                selectedMethod === 'github'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <Github size={32} className={`mb-3 ${selectedMethod === 'github' ? 'text-blue-600' : 'text-gray-600'}`} />
              <h3 className="font-semibold text-gray-900 mb-2">Connect GitHub</h3>
              <p className="text-sm text-gray-600 text-center">
                Link your GitHub repository for automatic updates
              </p>
            </button>
          </div>
        </div>

        {/* Upload Method Content */}
        {selectedMethod === 'upload' ? (
          <div className="mb-8">
            <FileUploader onFilesUploaded={onFilesUploaded} />
          </div>
        ) : (
          <div className="mb-8">
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Repository URL
            </label>
            <input
              type="text"
              id="githubUrl"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!projectName || (selectedMethod === 'github' && !githubUrl)}
          className="w-full"
        >
          Link Codebase
        </Button>
        
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