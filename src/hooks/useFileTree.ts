import { useState, useCallback } from 'react';
import { FileData } from '../types/code-analyzer';

export const useFileTree = () => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      return newExpanded;
    });
  }, []);

  return {
    expandedFolders,
    toggleFolder
  };
}; 