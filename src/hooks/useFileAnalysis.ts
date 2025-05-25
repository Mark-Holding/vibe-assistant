import { useState, useCallback } from 'react';
import { FileData, FileStats, FileTreeNode } from '../types/code-analyzer';
import { processUploadedFiles, buildFileTree, calculateStats, readFileContent } from '../utils/fileUtils';

export const useFileAnalysis = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((uploadedFiles: FileData[]) => {
    try {
      console.log('Processing uploaded files:', uploadedFiles.length);
      // Filter out any null files that might have been returned
      const validFiles = uploadedFiles.filter(file => file && file.path);
      console.log('Valid files after filtering:', validFiles.length);
      if (validFiles.length === 0) {
        console.warn('No valid files to process');
        setError('No valid files to process');
        return;
      }
      console.log('First few valid files:', validFiles.slice(0, 3).map(f => ({
        name: f.name,
        path: f.path,
        type: f.type
      })));
      setFiles(validFiles);
      setError(null);
    } catch (err) {
      console.error('Error processing files:', err);
      setError('Error processing files');
    }
  }, []);

  const handleFileSelect = useCallback(async (file: FileData) => {
    if (!file || !file.file) {
      console.error('Invalid file object:', file);
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);
    setError(null);
    
    try {
      const content = await readFileContent(file);
      setFileContent(content);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Error reading file content');
      setFileContent('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fileTree = buildFileTree(files);
  const stats = calculateStats(files);

  return {
    files,
    selectedFile,
    fileContent,
    fileTree,
    stats,
    isLoading,
    error,
    handleFileUpload,
    handleFileSelect
  };
}; 