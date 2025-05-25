import React, { useEffect, useState } from 'react';
import { FileViewerProps } from '../../types/code-analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Eye } from 'lucide-react';

interface FileAnalysis {
  lines: number;
  characters: number;
  functions: number;
  components: number;
  imports: number;
  comments: number;
}

export const FileViewer: React.FC<FileViewerProps> = ({ file, readFileContent }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!file || !file.file) {
        setContent('');
        setError(null);
        setAnalysis(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const fileContent = await readFileContent(file);
        setContent(fileContent);
        
        // Perform basic analysis
        const lines = fileContent.split('\n');
        const analysis: FileAnalysis = {
          lines: lines.length,
          characters: fileContent.length,
          functions: (fileContent.match(/function\s+\w+/g) || []).length,
          components: (fileContent.match(/const\s+\w+\s*=.*=>/g) || []).length,
          imports: (fileContent.match(/import.*from/g) || []).length,
          comments: (fileContent.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length
        };
        setAnalysis(analysis);
      } catch (err) {
        console.error('Error reading file:', err);
        setError('Error reading file content');
        setContent('');
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [file, readFileContent]);

  if (!file) {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Select a file to view its contents
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{file.name}</CardTitle>
          <div className="text-sm text-gray-500">
            {file.type} • {(file.size / 1024).toFixed(2)} KB
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading file content...</span>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">
            {error}
          </div>
        ) : (
          <>
            {analysis && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium mb-3">Quick Analysis</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Lines:</span>
                    <span className="ml-2 font-medium">{analysis.lines}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Functions:</span>
                    <span className="ml-2 font-medium">{analysis.functions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Imports:</span>
                    <span className="ml-2 font-medium">{analysis.imports}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Components:</span>
                    <span className="ml-2 font-medium">{analysis.components}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Comments:</span>
                    <span className="ml-2 font-medium">{analysis.comments}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Characters:</span>
                    <span className="ml-2 font-medium">{analysis.characters}</span>
                  </div>
                </div>
              </div>
            )}
            
            {content ? (
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
                <code>{content}</code>
              </pre>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No content available
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 