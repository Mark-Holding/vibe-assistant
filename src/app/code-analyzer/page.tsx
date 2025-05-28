"use client";

import React, { useState, useCallback, useEffect } from "react";
import { BarChart3, Folder, Network, Link } from "lucide-react";
import { useFileAnalysis } from "../../hooks/useFileAnalysis";
import {
  DependencyVisualizer,
  ArchitectureMap,
  LinkCodebaseTab,
  ProjectSelector,
} from "../../components/code-analyzer";
import { Button } from "../../components/ui/Button";
import { FileData } from "../../types/code-analyzer";
import { FileStructureTab } from "../../components/code-analyzer/file-structure/FileStructureTab";
import CodeAnalysisTab from "../../components/code-analyzer/code-analysis/CodeAnalysisTab";
import DesignSystemTab from "../../components/code-analyzer/design-system/DesignSystemTab";

export default function CodeAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<
    "linkCodebase" | "fileStructure" | "codeAnalysis" | "designSystem" | "dependencies" | "codebaseMap"
  >("linkCodebase");

  const {
    files,
    totalImportedFiles,
    handleFileUpload,
  } = useFileAnalysis();

  // Project selection handlers
  const handleProjectChange = (projectId: string) => {
    // TODO: Load project data from the database
    console.log('Project changed:', projectId);
  };

  const handleProjectDelete = (projectId: string) => {
    // TODO: Delete project from the database
    console.log('Project deleted:', projectId);
  };

  // Check for files in localStorage on mount
  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem('uploadedFiles');
      if (storedFiles) {
        const parsedFiles = JSON.parse(storedFiles);
        // Convert back to FileData format with proper File objects containing content
        const fileDataArray: FileData[] = parsedFiles.map((fileInfo: {
          name: string;
          path: string;
          size: number;
          type: string;
          content?: string;
          category?: string;
          importance?: number;
        }) => {
          // Create a proper File object with the stored content
          const fileContent = fileInfo.content || '';
          const file = new File([fileContent], fileInfo.name, { 
            type: fileInfo.type,
            lastModified: Date.now()
          });
          
          return {
            name: fileInfo.name,
            path: fileInfo.path,
            size: fileInfo.size,
            type: fileInfo.type,
            content: fileInfo.content,
            category: fileInfo.category,
            importance: fileInfo.importance,
            file: file // File object with actual content
          };
        });
        
        handleFileUpload(fileDataArray);
        // Switch to File Structure tab after loading files
        setActiveTab("fileStructure");
        // Clear localStorage after loading
        localStorage.removeItem('uploadedFiles');
      }
    } catch (error) {
      console.error('Error loading files from localStorage:', error);
    }
  }, [handleFileUpload]);

  // Directly handle FileData[]
  const onFilesUploaded = (uploadedFiles: FileData[]) => {
    handleFileUpload(uploadedFiles);
    // Switch to File Structure tab after uploading files
    setActiveTab("fileStructure");
  };

  const handleTabChange = useCallback(
    (tab: "linkCodebase" | "fileStructure" | "codeAnalysis" | "designSystem" | "dependencies" | "codebaseMap") => {
      setActiveTab(tab);
    },
    []
  );

  // Utility to filter relevant source files
  const isRelevantSourceFile = (file: FileData) => {
    if (!file || !file.path) {
      console.warn('Invalid file object:', file);
      return false;
    }
    const excludeDirs = [
      '/node_modules/', '/.git/', '/dist/', '/build/', '/out/', '/.next/', '/.vercel/'
    ];
    const ext = file.path.split('.').pop()?.toLowerCase();
    const allowedExts = [
      'js', 'jsx', 'ts', 'tsx', 'json', 'css', 'scss', 'md'
    ];
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
  };

  const filteredFiles = files.filter(isRelevantSourceFile);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - now sticky */}
      <div className="sticky top-0 z-50 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Code Analyzer</h1>
              <ProjectSelector
                onProjectChange={handleProjectChange}
                onProjectDelete={handleProjectDelete}
              />
            </div>
          </div>
        </div>

        {/* Navigation - moved inside header div */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8 pb-3">
              <Button
                variant={activeTab === "linkCodebase" ? "primary" : "outline"}
                onClick={() => handleTabChange("linkCodebase")}
                className="flex items-center"
              >
                <Link size={20} className="mr-2" />
                Link Codebase
              </Button>
              <Button
                variant={activeTab === "fileStructure" ? "primary" : "outline"}
                onClick={() => handleTabChange("fileStructure")}
                className="flex items-center"
                disabled={files.length === 0}
              >
                <Folder size={20} className="mr-2" />
                File Structure
              </Button>
              <Button
                variant={activeTab === "codeAnalysis" ? "primary" : "outline"}
                onClick={() => handleTabChange("codeAnalysis")}
                className="flex items-center"
                disabled={files.length === 0}
              >
                <BarChart3 size={20} className="mr-2" />
                Code Analysis
              </Button>
              <Button
                variant={activeTab === "designSystem" ? "primary" : "outline"}
                onClick={() => handleTabChange("designSystem")}
                className="flex items-center"
                disabled={files.length === 0}
              >
                🎨
                <span className="ml-2">Design System</span>
              </Button>
              <Button
                variant={activeTab === "dependencies" ? "primary" : "outline"}
                onClick={() => handleTabChange("dependencies")}
                className="flex items-center"
                disabled={files.length === 0}
              >
                <Network size={20} className="mr-2" />
                Dependencies
              </Button>
              <Button
                variant={activeTab === "codebaseMap" ? "primary" : "outline"}
                onClick={() => handleTabChange("codebaseMap")}
                className="flex items-center"
                disabled={files.length === 0}
              >
                🗺️
                <span className="ml-2">Codebase Map</span>
              </Button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab content */}
        {activeTab === "linkCodebase" ? (
          <div className="w-full">
            <LinkCodebaseTab onFilesUploaded={onFilesUploaded} />
          </div>
        ) : activeTab === "dependencies" ? (
          <div className="w-full">
            <DependencyVisualizer files={filteredFiles} />
          </div>
        ) : activeTab === "codebaseMap" ? (
          <div className="w-full">
            <ArchitectureMap files={filteredFiles} />
          </div>
        ) : activeTab === "fileStructure" ? (
          <div className="w-full">
            <FileStructureTab 
              files={filteredFiles} 
              totalImportedFiles={totalImportedFiles}
            />
          </div>
        ) : activeTab === "codeAnalysis" ? (
          <div className="w-full">
            <CodeAnalysisTab files={filteredFiles} />
          </div>
        ) : activeTab === "designSystem" ? (
          <div className="w-full">
            <DesignSystemTab files={filteredFiles} />
          </div>
        ) : null}
      </div>
    </div>
  );
}




