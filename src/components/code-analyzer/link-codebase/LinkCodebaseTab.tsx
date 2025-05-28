"use client";

import React, { useState } from 'react';
import { Link, Folder, BarChart3, Network, Github, Upload, Loader2 } from 'lucide-react';
import { FileUploader } from '../FileUploader';
import { FileData } from '../../../types/code-analyzer';
import { Button } from '../../ui/Button';
import { projectService } from '../../../lib/database/projects';
import { fileService } from '../../../lib/database/files';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { debugEnvironment } from '../../../lib/debug-env';

interface LinkCodebaseTabProps {
  onFilesUploaded: (files: FileData[]) => void;
  onProjectCreated?: (projectId: string, projectName: string) => void;
}

export const LinkCodebaseTab: React.FC<LinkCodebaseTabProps> = ({ 
  onFilesUploaded, 
  onProjectCreated 
}) => {
  const [projectName, setProjectName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'upload' | 'github'>('upload');
  const [githubUrl, setGithubUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [error, setError] = useState<string>('');

  // Debug environment variables on component mount
  React.useEffect(() => {
    debugEnvironment();
  }, []);

  const handleFilesUploaded = (files: FileData[]) => {
    setUploadedFiles(files);
    // Don't call onFilesUploaded here - wait until database processing is complete
  };

  const handleSubmit = async () => {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      setError('Database not configured. Please check your environment variables in .env.local');
      return;
    }

    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    if (selectedMethod === 'upload' && uploadedFiles.length === 0) {
      setError('Please upload files first');
      return;
    }

    if (selectedMethod === 'github' && !githubUrl.trim()) {
      setError('Please enter a GitHub URL');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create project in database
      const project = await projectService.createProject({
        name: projectName.trim(),
        description: `Project created via ${selectedMethod === 'upload' ? 'file upload' : 'GitHub integration'}`,
        repository_url: selectedMethod === 'github' ? githubUrl.trim() : undefined
      });

      console.log('Project created:', project);

      if (selectedMethod === 'upload' && uploadedFiles.length > 0) {
        // Filter relevant files (same logic as before)
        const relevantFiles = uploadedFiles.filter(file => {
          if (!file || !file.path) return false;
          const excludeDirs = [
            '/node_modules/', '/.git/', '/dist/', '/build/', '/out/', '/.next/', '/.vercel/'
          ];
          const ext = file.path.split('.').pop()?.toLowerCase();
          const allowedExts = ['js', 'jsx', 'ts', 'tsx', 'json', 'css', 'scss', 'md'];
          
          if (
            file.path.startsWith('.') ||
            file.name.startsWith('.') ||
            excludeDirs.some(dir => file.path.includes(dir))
          ) {
            return false;
          }
          
          if (!ext || !allowedExts.includes(ext)) {
            return false;
          }
          
          return true;
        });

        console.log(`Processing ${relevantFiles.length} relevant files out of ${uploadedFiles.length} total files`);

        // Analyze and save files to database
        console.log('📁 Starting file analysis and database storage...');
        await fileService.analyzeAndSaveFiles(project.id, relevantFiles);
        console.log('✅ Files analyzed and stored in database');

        // Calculate actual stats from analyzed files
        console.log('📊 Calculating project statistics...');
        let totalFunctions = 0;
        let totalComponents = 0;
        let totalLoc = 0;

        for (const file of relevantFiles) {
          try {
            const content = await file.file.text();
            const analysis = await fileService.analyzeFileContent(content, file.path);
            totalFunctions += analysis.functionCount;
            totalComponents += analysis.componentCount;
            totalLoc += analysis.linesOfCode;
          } catch (error) {
            console.warn(`Error analyzing ${file.path}:`, error);
          }
        }

        // Update project stats
        const stats = {
          total_files: relevantFiles.length,
          total_loc: totalLoc,
          total_functions: totalFunctions,
          total_components: totalComponents
        };

        await projectService.updateProjectStats(project.id, stats);
        console.log('📈 Project statistics updated:', stats);

        // Now call onFilesUploaded to update the UI with the processed files
        onFilesUploaded(relevantFiles);
      }

      // Notify parent component
      if (onProjectCreated) {
        onProjectCreated(project.id, project.name);
      }

      // Reset form
      setProjectName('');
      setGithubUrl('');
      setUploadedFiles([]);
      
      alert(`Project "${project.name}" created successfully!`);

    } catch (error) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsProcessing(false);
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
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Project Name Input */}
        <div className="mb-8">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
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
              disabled={isProcessing}
              className={`p-6 border rounded-lg flex flex-col items-center transition-colors ${
                selectedMethod === 'upload'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload size={32} className={`mb-3 ${selectedMethod === 'upload' ? 'text-blue-600' : 'text-gray-600'}`} />
              <h3 className="font-semibold text-gray-900 mb-2">Upload Files</h3>
              <p className="text-sm text-gray-600 text-center">
                Upload your project files directly from your computer
              </p>
            </button>

            <button
              onClick={() => setSelectedMethod('github')}
              disabled={isProcessing}
              className={`p-6 border rounded-lg flex flex-col items-center transition-colors ${
                selectedMethod === 'github'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <FileUploader onFilesUploaded={handleFilesUploaded} />
            {uploadedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">
                  ✓ {uploadedFiles.length} files uploaded and ready for analysis
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8">
            <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Repository URL *
            </label>
            <input
              type="text"
              id="githubUrl"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isProcessing}
            />
            <p className="mt-2 text-sm text-gray-500">
              Note: GitHub integration is coming soon. For now, please use file upload.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            isProcessing || 
            !projectName.trim() || 
            (selectedMethod === 'upload' && uploadedFiles.length === 0) ||
            (selectedMethod === 'github' && !githubUrl.trim())
          }
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Creating Project & Analyzing Files...
            </>
          ) : (
            'Create Project & Analyze Code'
          )}
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