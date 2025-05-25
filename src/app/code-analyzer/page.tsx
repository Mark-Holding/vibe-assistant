"use client";

import React, { useState, useCallback } from "react";
import { BarChart3, Folder, Network, Search } from "lucide-react";
import { useFileAnalysis } from "../../hooks/useFileAnalysis";
import { useFileTree } from "../../hooks/useFileTree";
import {
  FileUploader,
  FileTree,
  FileViewer,
  ProjectOverview,
  SearchPanel,
  DependencyVisualizer,
  ArchitectureMap,
} from "../../components/code-analyzer";
import { Button } from "../../components/ui/Button";
import { FileData } from "../../types/code-analyzer";
import { readFileContent } from "../../utils/fileUtils";

export default function CodeAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "files" | "search" | "dependencies"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");

  console.log(
    "CodeAnalyzerPage render - activeTab:",
    activeTab,
    "searchTerm:",
    searchTerm
  );

  const {
    files,
    selectedFile,
    fileTree,
    stats,
    handleFileUpload,
    handleFileSelect,
  } = useFileAnalysis();

  const { expandedFolders, toggleFolder } = useFileTree();

  // Directly handle FileData[]
  const onFilesUploaded = (uploadedFiles: FileData[]) => {
    handleFileUpload(uploadedFiles);
  };

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleTabChange = useCallback(
    (tab: "overview" | "files" | "search" | "dependencies") => {
      setActiveTab(tab);
    },
    []
  );

  // Utility to filter relevant source files
  const isRelevantSourceFile = (file: FileData) => {
    // First validate that we have a valid file with a path
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
    // Exclude hidden/system files and excluded directories
    if (
      file.path.startsWith('.') ||
      file.name.startsWith('.') ||
      excludeDirs.some(dir => file.path.includes(dir))
    ) {
      return false;
    }
    // Only allow certain extensions
    if (!ext || !allowedExts.includes(ext)) {
      return false;
    }
    return true;
  };

  // Filter files before passing to analyzer components
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
                variant={activeTab === "overview" ? "primary" : "outline"}
                onClick={() => handleTabChange("overview")}
                className="flex items-center"
              >
                <BarChart3 size={20} className="mr-2" />
                Overview
              </Button>
              <Button
                variant={activeTab === "files" ? "primary" : "outline"}
                onClick={() => handleTabChange("files")}
                className="flex items-center"
              >
                <Folder size={20} className="mr-2" />
                Files
              </Button>
              <Button
                variant={activeTab === "search" ? "primary" : "outline"}
                onClick={() => handleTabChange("search")}
                className="flex items-center"
              >
                <Search size={20} className="mr-2" />
                Search
              </Button>
              <Button
                variant={activeTab === "dependencies" ? "primary" : "outline"}
                onClick={() => handleTabChange("dependencies")}
                className="flex items-center"
              >
                <Network size={20} className="mr-2" />
                Dependencies
              </Button>
            </nav>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Dependencies and Overview tabs use full width */}
          {(activeTab === "dependencies" || activeTab === "overview") ? (
            <div className="w-full">
              {activeTab === "dependencies" ? (
                <DependencyVisualizer files={filteredFiles} />
              ) : (
                <ArchitectureMap files={filteredFiles} />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Main Content */}
              <div className="col-span-8">
                <FileViewer
                  file={selectedFile}
                  readFileContent={readFileContent}
                />
              </div>
              {/* Sidebar */}
              <div className="col-span-4">
                {activeTab === "overview" && <ProjectOverview stats={stats} />}
                {activeTab === "files" && (
                  <FileTree
                    tree={fileTree}
                    selectedFile={selectedFile}
                    expandedFolders={expandedFolders}
                    onFileSelect={handleFileSelect}
                    onFolderToggle={toggleFolder}
                  />
                )}
                {activeTab === "search" && (
                  <SearchPanel
                    files={filteredFiles}
                    onFileSelect={handleFileSelect}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
