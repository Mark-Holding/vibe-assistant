import { useState, useCallback } from 'react';
import { FileData, FileStats, FileTreeNode } from '../types/code-analyzer';
import { processUploadedFiles, buildFileTree, calculateStats, readFileContent, isRelevantSourceFile } from '../utils/fileUtils';
import { categorizeByAST } from '../components/code-analyzer/architecture-map';

export const useFileAnalysis = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [totalImportedFiles, setTotalImportedFiles] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pre-analyzed files from database (no re-analysis)
  const loadPreAnalyzedFiles = useCallback((preAnalyzedFiles: FileData[]) => {
    console.log('📂 Loading pre-analyzed files from database (no re-analysis needed)');
    setTotalImportedFiles(preAnalyzedFiles.length);
    setFiles(preAnalyzedFiles);
    setError(null);
  }, []);

  const handleFileUpload = useCallback(async (uploadedFiles: FileData[]) => {
    try {
      console.log('🔍 Analyzing new files...');
      // Store total count before filtering
      setTotalImportedFiles(uploadedFiles.length);
      
      // Only keep files that pass the relevant source file filter
      const validFiles = uploadedFiles.filter(file => file && file.path && isRelevantSourceFile(file));
      if (validFiles.length === 0) {
        setError('No valid files to process');
        return;
      }
      const categorizedFiles: FileData[] = [];
      for (const file of validFiles) {
        let content = '';
        try {
          if (typeof file.file.text === 'function') {
            content = await file.file.text();
          }
        } catch {}
        const { category, importance } = categorizeByAST(content, file.path);
        categorizedFiles.push({ ...file, category, importance });
      }
      setFiles(categorizedFiles);
      setError(null);
    } catch (err) {
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
    totalImportedFiles,
    selectedFile,
    fileContent,
    fileTree,
    stats,
    isLoading,
    error,
    handleFileUpload,
    handleFileSelect,
    loadPreAnalyzedFiles
  };
}; 