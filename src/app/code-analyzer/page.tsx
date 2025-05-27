"use client";

import React, { useState, useCallback } from "react";
import { BarChart3, Folder, Network } from "lucide-react";
import { useFileAnalysis } from "../../hooks/useFileAnalysis";
import {
  FileUploader,
  DependencyVisualizer,
  ArchitectureMap,
} from "../../components/code-analyzer";
import { Button } from "../../components/ui/Button";
import { FileData } from "../../types/code-analyzer";
import { FileStructureTab } from "../../components/code-analyzer/file-structure/FileStructureTab";
import CodeAnalysisTab from "../../components/code-analyzer/code-analysis/CodeAnalysisTab";
import DesignSystemTab from "../../components/code-analyzer/design-system/DesignSystemTab";

export default function CodeAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<
    "fileStructure" | "codeAnalysis" | "designSystem" | "dependencies" | "codebaseMap"
  >("fileStructure");

  const {
    files,
    totalImportedFiles,
    handleFileUpload,
  } = useFileAnalysis();

  // Directly handle FileData[]
  const onFilesUploaded = (uploadedFiles: FileData[]) => {
    handleFileUpload(uploadedFiles);
  };

  const handleTabChange = useCallback(
    (tab: "fileStructure" | "codeAnalysis" | "designSystem" | "dependencies" | "codebaseMap") => {
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
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Code Analyzer</h1>
            {files.length === 0 && (
              <FileUploader onFilesUploaded={onFilesUploaded} />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      {files.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8">
              <Button
                variant={activeTab === "fileStructure" ? "primary" : "outline"}
                onClick={() => handleTabChange("fileStructure")}
                className="flex items-center"
              >
                <Folder size={20} className="mr-2" />
                File Structure
              </Button>
              <Button
                variant={activeTab === "codeAnalysis" ? "primary" : "outline"}
                onClick={() => handleTabChange("codeAnalysis")}
                className="flex items-center"
              >
                <BarChart3 size={20} className="mr-2" />
                Code Analysis
              </Button>
              <Button
                variant={activeTab === "designSystem" ? "primary" : "outline"}
                onClick={() => handleTabChange("designSystem")}
                className="flex items-center"
              >
                🎨
                <span className="ml-2">Design System</span>
              </Button>
              <Button
                variant={activeTab === "dependencies" ? "primary" : "outline"}
                onClick={() => handleTabChange("dependencies")}
                className="flex items-center"
              >
                <Network size={20} className="mr-2" />
                Dependencies
              </Button>
              <Button
                variant={activeTab === "codebaseMap" ? "primary" : "outline"}
                onClick={() => handleTabChange("codebaseMap")}
                className="flex items-center"
              >
                🗺️
                <span className="ml-2">Codebase Map</span>
              </Button>
            </nav>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Tab content */}
          {activeTab === "dependencies" ? (
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
      )}
    </div>
  );
}




