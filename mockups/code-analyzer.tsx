import React, { useState, useCallback } from 'react';
import { Upload, FileText, Folder, Search, Code, BarChart3, Eye, ChevronRight, ChevronDown } from 'lucide-react';

const CodeAnalyzer = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const uploadedFiles = Array.from(event.target.files);
    const processedFiles = uploadedFiles.map(file => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      type: getFileType(file.name),
      lastModified: new Date(file.lastModified),
      file: file
    }));
    setFiles(processedFiles);
  }, []);

  // Get file type based on extension
  const getFileType = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const typeMap = {
      'js': 'JavaScript',
      'jsx': 'React JSX',
      'ts': 'TypeScript',
      'tsx': 'React TSX',
      'css': 'CSS',
      'scss': 'SCSS',
      'html': 'HTML',
      'json': 'JSON',
      'md': 'Markdown',
      'py': 'Python',
      'php': 'PHP'
    };
    return typeMap[ext] || 'Unknown';
  };

  // Build file tree structure
  const buildFileTree = () => {
    const tree = {};
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = file;
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });
    return tree;
  };

  // Render file tree
  const renderFileTree = (node, path = '') => {
    return Object.entries(node).map(([key, value]) => {
      const currentPath = path ? `${path}/${key}` : key;
      const isFile = value.file;
      
      if (isFile) {
        return (
          <div
            key={currentPath}
            className={`flex items-center py-1 px-2 cursor-pointer hover:bg-blue-50 rounded ${
              selectedFile?.path === value.path ? 'bg-blue-100' : ''
            }`}
            onClick={() => setSelectedFile(value)}
          >
            <FileText size={16} className="mr-2 text-gray-600" />
            <span className="text-sm">{key}</span>
            <span className="ml-auto text-xs text-gray-500">{value.type}</span>
          </div>
        );
      } else {
        const isExpanded = expandedFolders.has(currentPath);
        return (
          <div key={currentPath}>
            <div
              className="flex items-center py-1 px-2 cursor-pointer hover:bg-gray-50 rounded"
              onClick={() => {
                const newExpanded = new Set(expandedFolders);
                if (isExpanded) {
                  newExpanded.delete(currentPath);
                } else {
                  newExpanded.add(currentPath);
                }
                setExpandedFolders(newExpanded);
              }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <Folder size={16} className="mr-2 text-blue-600" />
              <span className="text-sm font-medium">{key}</span>
            </div>
            {isExpanded && (
              <div className="ml-4 border-l border-gray-200">
                {renderFileTree(value, currentPath)}
              </div>
            )}
          </div>
        );
      }
    });
  };

  // Get file statistics
  const getStats = () => {
    const typeCount = {};
    let totalSize = 0;
    
    files.forEach(file => {
      typeCount[file.type] = (typeCount[file.type] || 0) + 1;
      totalSize += file.size;
    });

    return {
      totalFiles: files.length,
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      typeCount
    };
  };

  // Read file content
  const readFileContent = async (file) => {
    try {
      const content = await file.file.text();
      return content;
    } catch (error) {
      return 'Error reading file content';
    }
  };

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getStats();
  const fileTree = buildFileTree();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Code Analyzer</h1>
          
          {files.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Codebase</h3>
              <p className="text-gray-500 mb-4">
                Select your project folder or zip file to start analyzing your code
              </p>
              <input
                type="file"
                webkitdirectory=""
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="folder-upload"
              />
              <label
                htmlFor="folder-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                <Upload size={20} className="mr-2" />
                Select Folder
              </label>
              <p className="text-xs text-gray-400 mt-2">
                Or drag and drop your project folder here
              </p>
            </div>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <BarChart3 size={16} className="inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'files' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Folder size={16} className="inline mr-2" />
                Files
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Search size={16} className="inline mr-2" />
                Search
              </button>
            </div>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg shadow p-4">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Project Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Files:</span>
                        <span className="font-medium">{stats.totalFiles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Size:</span>
                        <span className="font-medium">{stats.totalSize}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mt-6 mb-3">File Types</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.typeCount).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-gray-600">{type}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">File Structure</h3>
                    <div className="max-h-96 overflow-y-auto">
                      {renderFileTree(fileTree)}
                    </div>
                  </div>
                )}

                {activeTab === 'search' && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Search Files</h3>
                    <div className="relative mb-4">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search files..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {filteredFiles.map(file => (
                        <div
                          key={file.path}
                          className={`p-2 rounded cursor-pointer hover:bg-blue-50 ${
                            selectedFile?.path === file.path ? 'bg-blue-100' : ''
                          }`}
                          onClick={() => setSelectedFile(file)}
                        >
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="text-xs text-gray-500">{file.path}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-8">
              <div className="bg-white rounded-lg shadow">
                {selectedFile ? (
                  <FileViewer file={selectedFile} readFileContent={readFileContent} />
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Code size={48} className="mx-auto mb-4" />
                    <p>Select a file to view its content and analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// File viewer component
const FileViewer = ({ file, readFileContent }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  React.useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const fileContent = await readFileContent(file);
      setContent(fileContent);
      
      // Basic analysis without APIs
      const lines = fileContent.split('\n');
      const analysis = {
        lines: lines.length,
        characters: fileContent.length,
        functions: (fileContent.match(/function\s+\w+/g) || []).length,
        components: (fileContent.match(/const\s+\w+\s*=.*=>/g) || []).length,
        imports: (fileContent.match(/import.*from/g) || []).length,
        comments: (fileContent.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || []).length
      };
      setAnalysis(analysis);
      setLoading(false);
    };
    
    loadContent();
  }, [file]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading file content...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{file.name}</h3>
          <p className="text-sm text-gray-500">{file.path}</p>
        </div>
        <div className="text-sm text-gray-500">
          {file.type} • {(file.size / 1024).toFixed(2)} KB
        </div>
      </div>

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

      <div className="border rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <span className="text-sm font-medium">Content Preview</span>
        </div>
        <pre className="p-4 text-sm overflow-auto max-h-96 bg-white">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeAnalyzer;