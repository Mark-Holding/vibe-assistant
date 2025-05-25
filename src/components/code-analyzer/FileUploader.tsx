import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { FileUploaderProps, FileData } from '../../types/code-analyzer';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { processUploadedFiles } from '../../utils/fileUtils';

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesUploaded }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      console.log('Files selected:', event.target.files.length);
      const files = Array.from(event.target.files);
      console.log('First few files:', files.slice(0, 3).map(f => ({
        name: f.name,
        path: (f as any).webkitRelativePath,
        size: f.size
      })));
      const processedFiles = processUploadedFiles(files);
      onFilesUploaded(processedFiles);
    }
  }, [onFilesUploaded]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer.files) {
      console.log('Files dropped:', event.dataTransfer.files.length);
      const files = Array.from(event.dataTransfer.files);
      console.log('First few files:', files.slice(0, 3).map(f => ({
        name: f.name,
        path: (f as any).webkitRelativePath,
        size: f.size
      })));
      const processedFiles = processUploadedFiles(files);
      onFilesUploaded(processedFiles);
    }
  }, [onFilesUploaded]);

  return (
    <Card>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Your Codebase
          </h3>
          <p className="text-gray-500 mb-4">
            Select your project folder or zip file to start analyzing your code
          </p>
          <div className="relative">
            <input
              type="file"
              {...{
                webkitdirectory: '',
                directory: ''
              } as any}
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="folder-upload"
            />
            <Button
              variant="primary"
              icon={Upload}
              className="relative z-10"
              onClick={() => document.getElementById('folder-upload')?.click()}
            >
              Select Folder
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Or drag and drop your project folder here
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 