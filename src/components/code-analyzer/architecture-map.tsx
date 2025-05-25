import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Package } from 'lucide-react';
import { Settings } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Folder } from 'lucide-react';
import { Download } from 'lucide-react';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';

// Types
interface ArchitectureNode {
  id: string;
  name: string;
  type: 'service' | 'component' | 'page' | 'utility' | 'config' | 'group';
  children?: ArchitectureNode[];
  connections: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  fileCount?: number;
  files?: string[];
}

interface Connection {
  from: string;
  to: string;
  type: 'import' | 'export' | 'dependency';
}

interface ArchitectureMapProps {
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
  }>;
}

// File categorization rules
const categorizeFile = (path: string): { category: string; importance: number } => {
  const filename = path.toLowerCase();
  const pathParts = path.split('/');
  
  // PAGE: in /pages/ or /app/ or filename includes page/route
  if (path.match(/\/(pages|app)\//) || filename.includes('page') || filename.includes('route')) {
    return { category: 'page', importance: 9 };
  }
  
  // SERVICE: in /services/ or filename includes service/api
  if (path.match(/\/(services)\//) || filename.includes('service') || filename.includes('api')) {
    return { category: 'service', importance: 8 };
  }
  
  // COMPONENT: any .tsx/.jsx file not already categorized as page/service
  if ((filename.endsWith('.tsx') || filename.endsWith('.jsx')) &&
      !filename.includes('test') &&
      !filename.includes('spec')) {
    return { category: 'component', importance: 8 };
  }
  
  // UTILITY
  if (filename.includes('hook') || filename.includes('use') || filename.includes('util') || filename.includes('helper') || filename.includes('lib')) {
    return { category: 'utility', importance: 7 };
  }
  
  // TYPES
  if (filename.includes('type') || filename.includes('interface') || filename.includes('.d.ts')) {
    return { category: 'types', importance: 5 };
  }
  
  // STYLES
  if (filename.includes('.css') || filename.includes('.scss') || filename.includes('style')) {
    return { category: 'styles', importance: 4 };
  }
  
  // CONFIG
  if (filename.includes('config') || filename.includes('setting') || filename.includes('.json')) {
    return { category: 'config', importance: 2 };
  }
  
  // DEPENDENCIES
  if (pathParts.includes('node_modules') || pathParts.includes('.git')) {
    return { category: 'dependencies', importance: 1 };
  }
  
  // TESTS
  if (filename.includes('test') || filename.includes('spec') || filename.includes('.test.')) {
    return { category: 'tests', importance: 3 };
  }
  
  // OTHER
  return { category: 'other', importance: 3 };
};

// Extract dependencies between files
const extractConnections = async (files: Array<{ name: string; path: string; file: File }>): Promise<Connection[]> => {
  const connections: Connection[] = [];
  const exts = ['.js', '.jsx', '.ts', '.tsx'];
  const projectRootPrefix = files[0]?.path.split('src/')[0] || '';
  for (const file of files) {
    try {
      const content = await file.file.text();
      const imports = extractImports(content);
      imports.forEach(importPath => {
        let normalizedImportPath = importPath;
        // Handle @/ alias (replace with src/)
        if (importPath.startsWith('@/')) {
          normalizedImportPath = 'src/' + importPath.slice(2);
        }
        if (
          normalizedImportPath.startsWith('.') ||
          normalizedImportPath.startsWith('/') ||
          normalizedImportPath.startsWith('src/') ||
          normalizedImportPath.startsWith('app/') ||
          normalizedImportPath.startsWith('pages/')
        ) {
          const resolvedPath = resolvePath(file.path, normalizedImportPath);
          const candidates = [resolvedPath];
          if (projectRootPrefix && !resolvedPath.startsWith(projectRootPrefix)) {
            candidates.push(projectRootPrefix + resolvedPath);
          }
          let targetFile: typeof files[0] | undefined;
          outer: for (const candidate of candidates) {
            targetFile = files.find(f => f.path === candidate);
            if (targetFile) break;
            for (const ext of exts) {
              targetFile = files.find(f => f.path === candidate + ext);
              if (targetFile) break outer;
            }
            for (const ext of exts) {
              targetFile = files.find(f => f.path === candidate + '/index' + ext);
              if (targetFile) break outer;
            }
          }
          if (!targetFile) {
            for (const candidate of candidates) {
              targetFile = files.find(f => f.path.includes(candidate));
              if (targetFile) break;
            }
          }
          if (targetFile) {
            connections.push({
              from: file.path,
              to: targetFile.path,
              type: 'import'
            });
          }
        }
      });
    } catch (error) {
      console.error(`Error processing ${file.path}:`, error);
    }
  }
  return connections;
};

const extractImports = (content: string): string[] => {
  const imports: string[] = [];
  // Old regex (for backward compatibility)
  const importRegex1 = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)?\s*from\s+['"`]([^'"`]+)['"`]/g;
  let match1;
  while ((match1 = importRegex1.exec(content)) !== null) {
    imports.push(match1[1]);
  }
  // New, more flexible regex
  const importRegex2 = /import\s+[^'"\n]+['"]([^'"\n]+)['"]/g;
  let match2;
  while ((match2 = importRegex2.exec(content)) !== null) {
    imports.push(match2[1]);
  }
  // Deduplicate
  return Array.from(new Set(imports));
};

const resolvePath = (currentPath: string, importPath: string): string => {
  // If importPath is project-root relative, return as-is (with or without leading slash)
  if (
    importPath.startsWith('src/') ||
    importPath.startsWith('app/') ||
    importPath.startsWith('pages/') ||
    importPath.startsWith('/')
  ) {
    // Remove leading slash if present
    return importPath.replace(/^\//, '');
  }
  // Otherwise, resolve relative to currentPath
  const currentDir = currentPath.split('/').slice(0, -1);
  const importParts = importPath.split('/');
  importParts.forEach(part => {
    if (part === '..') {
      currentDir.pop();
    } else if (part !== '.') {
      currentDir.push(part);
    }
  });
  return currentDir.join('/');
};

// Build simplified architecture tree
const buildArchitectureTree = (files: Array<{ name: string; path: string; type: string; size: number; file: File }>): ArchitectureNode[] => {
  const categorizedFiles = new Map<string, Array<{ name: string; path: string; importance: number }>>();
  
  // Categorize all files
  files.forEach(file => {
    const { category, importance } = categorizeFile(file.path);
    
    if (!categorizedFiles.has(category)) {
      categorizedFiles.set(category, []);
    }
    
    categorizedFiles.get(category)!.push({
      name: file.name,
      path: file.path,
      importance
    });
  });
  
  // DEBUG: Log category counts
  const catCounts: Record<string, number> = {};
  categorizedFiles.forEach((arr, cat) => { catCounts[cat] = arr.length; });
  console.log('[buildArchitectureTree] Category counts:', catCounts);
  
  const nodes: ArchitectureNode[] = [];
  let nodeId = 0;
  
  // Create nodes for each category
  categorizedFiles.forEach((categoryFiles, category) => {
    const sortedFiles = categoryFiles.sort((a, b) => b.importance - a.importance);
    const before = nodes.length;
    if (category === 'page' || category === 'service') {
      // Show high-importance files individually
      sortedFiles.slice(0, 10).forEach(file => {
        nodes.push({
          id: `node_${nodeId++}`,
          name: file.name.replace(/\.(tsx|jsx|ts|js)$/, ''),
          type: category as ArchitectureNode['type'],
          connections: [],
          x: 0,
          y: 0,
          width: 120,
          height: 60,
          level: 1,
          files: [file.path]
        });
      });
      
      // Group remaining files
      if (sortedFiles.length > 10) {
        nodes.push({
          id: `node_${nodeId++}`,
          name: `Other ${category}s`,
          type: 'group',
          connections: [],
          x: 0,
          y: 0,
          width: 120,
          height: 60,
          level: 1,
          fileCount: sortedFiles.length - 10,
          files: sortedFiles.slice(10).map(f => f.path)
        });
      }
    } else if (category === 'component') {
      // Show top components individually, group the rest
      sortedFiles.slice(0, 8).forEach(file => {
        nodes.push({
          id: `node_${nodeId++}`,
          name: file.name.replace(/\.(tsx|jsx|ts|js)$/, ''),
          type: 'component',
          connections: [],
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          level: 2,
          files: [file.path]
        });
      });
      
      if (sortedFiles.length > 8) {
        nodes.push({
          id: `node_${nodeId++}`,
          name: `Components (${sortedFiles.length - 8})`,
          type: 'group',
          connections: [],
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          level: 2,
          fileCount: sortedFiles.length - 8,
          files: sortedFiles.slice(8).map(f => f.path)
        });
      }
    } else {
      // Group all other categories
      const displayName = category.charAt(0).toUpperCase() + category.slice(1);
      nodes.push({
        id: `node_${nodeId++}`,
        name: `${displayName} (${sortedFiles.length})`,
        type: 'group',
        connections: [],
        x: 0,
        y: 0,
        width: 100,
        height: 40,
        level: 3,
        fileCount: sortedFiles.length,
        files: sortedFiles.map(f => f.path)
      });
    }
    // DEBUG: Log nodes created for this category
    const after = nodes.length;
    if (after > before) {
      console.log(`[buildArchitectureTree] Nodes created for category '${category}':`, after - before);
    }
  });
  
  // DEBUG: Log total nodes
  console.log('[buildArchitectureTree] Total nodes:', nodes.length);
  
  return nodes;
};

// Layout algorithm for positioning nodes
const layoutNodes = (nodes: ArchitectureNode[], width: number, height: number): ArchitectureNode[] => {
  const centerX = width / 2;
  const centerY = height / 2;
  const padding = 60; // px, space from edge
  // Find the largest node width/height
  const maxNodeWidth = Math.max(...nodes.map(n => n.width));
  const maxNodeHeight = Math.max(...nodes.map(n => n.height));
  // Calculate the maximum radius so nodes fit within the view
  const maxRadius = Math.min(
    (width - maxNodeWidth) / 2 - padding,
    (height - maxNodeHeight) / 2 - padding
  );
  // Group nodes by level
  const levels = new Map<number, ArchitectureNode[]>();
  nodes.forEach(node => {
    if (!levels.has(node.level)) {
      levels.set(node.level, []);
    }
    levels.get(node.level)!.push(node);
  });
  // Position nodes in concentric circles, scaling radius to fit
  const maxLevel = Math.max(...Array.from(levels.keys()));
  levels.forEach((levelNodes, level) => {
    // Distribute available radius among levels
    const radius = maxLevel > 1
      ? (maxRadius * (level - 1) / (maxLevel - 1)) + padding
      : padding;
    const angleStep = (2 * Math.PI) / levelNodes.length;
    levelNodes.forEach((node, index) => {
      const angle = index * angleStep;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });
  });
  return nodes;
};

// Get node color based on type
const getNodeColor = (type: string): { bg: string; border: string; text: string } => {
  const colors = {
    service: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
    component: { bg: '#dcfce7', border: '#10b981', text: '#047857' },
    page: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    utility: { bg: '#e9d5ff', border: '#8b5cf6', text: '#6b21a8' },
    config: { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' },
    group: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' }
  };
  
  return colors[type as keyof typeof colors] || colors.group;
};

const ArchitectureMap: React.FC<ArchitectureMapProps> = ({ files }) => {
  const [nodes, setNodes] = useState<ArchitectureNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConnections, setShowConnections] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Drag state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Process files and build architecture
  const processArchitecture = useCallback(async () => {
    if (!files.length) return;
    
    setIsLoading(true);
    
    try {
      // Build simplified architecture tree
      const architectureNodes = buildArchitectureTree(files);
      
      // Lower importance threshold to 5
      const importantFiles = files.filter(file => {
        const { importance } = categorizeFile(file.path);
        return importance >= 5;
      });
      
      const fileConnections = await extractConnections(importantFiles);
      
      // Map file connections to node connections
      const nodeConnections: Connection[] = [];
      fileConnections.forEach(conn => {
        const fromNode = architectureNodes.find(node => 
          node.files?.includes(conn.from)
        );
        const toNode = architectureNodes.find(node => 
          node.files?.includes(conn.to)
        );
        
        if (fromNode && toNode && fromNode.id !== toNode.id) {
          // Avoid duplicate connections
          const existing = nodeConnections.find(nc => 
            nc.from === fromNode.id && nc.to === toNode.id
          );
          
          if (!existing) {
            nodeConnections.push({
              from: fromNode.id,
              to: toNode.id,
              type: conn.type
            });
            
            fromNode.connections.push(toNode.id);
          }
        }
      });
      
      // Layout nodes
      const layoutedNodes = layoutNodes(architectureNodes, dimensions.width, dimensions.height);
      
      setNodes(layoutedNodes);
      setConnections(nodeConnections);
    } catch (error) {
      console.error('Error processing architecture:', error);
    } finally {
      setIsLoading(false);
    }
  }, [files, dimensions]);
  
  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Process files when they change
  useEffect(() => {
    processArchitecture();
  }, [processArchitecture]);
  
  // Export architecture data
  const exportArchitecture = () => {
    const data = {
      nodes,
      connections,
      timestamp: new Date().toISOString(),
      stats: {
        totalFiles: files.length,
        shownNodes: nodes.length,
        connections: connections.length
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-map.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Mouse event handlers for drag
  const handleNodeMouseDown = (e: React.MouseEvent, node: ArchitectureNode) => {
    e.stopPropagation();
    // Calculate offset between mouse and node top-left
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    setDraggingNodeId(node.id);
    setDragOffset({ x: mouseX - node.x, y: mouseY - node.y });
    // Disable text selection
    document.body.style.userSelect = 'none';
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === draggingNodeId
          ? { ...node, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y }
          : node
      )
    );
  };

  const handleSvgMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      // Re-enable text selection
      document.body.style.userSelect = '';
    }
  };
  
  if (!files.length) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-gray-500">
          <MapIcon size={48} className="mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Architecture Map</h3>
          <p>Upload your codebase to see a simplified architecture overview</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapIcon size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold">Architecture Map</h3>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`flex items-center px-3 py-1 rounded text-sm ${
                showConnections ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {showConnections ? <Eye size={14} className="mr-1" /> : <EyeOff size={14} className="mr-1" />}
              Connections
            </button>
            <button
              onClick={exportArchitecture}
              className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              <Download size={14} className="mr-1" />
              Export
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Showing {nodes.length} key components from {files.length} total files
        </div>
      </div>
      {/* Map Container */}
      <div className="flex">
        <div ref={containerRef} className="flex-1" style={{ height: '700px' }}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="border-r"
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
          >
            {/* Connections */}
            {showConnections && (
              <g>
                {connections.map((conn, index) => {
                  const fromNode = nodes.find(n => n.id === conn.from);
                  const toNode = nodes.find(n => n.id === conn.to);
                  
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <line
                      key={index}
                      x1={fromNode.x + fromNode.width / 2}
                      y1={fromNode.y + fromNode.height / 2}
                      x2={toNode.x + toNode.width / 2}
                      y2={toNode.y + toNode.height / 2}
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                      opacity="0.6"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
              </g>
            )}
            
            {/* Arrow marker */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#cbd5e1"
                />
              </marker>
            </defs>
            
            {/* Nodes */}
            <g>
              {nodes.map((node) => {
                const colors = getNodeColor(node.type);
                return (
                  <g key={node.id}>
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      fill={colors.bg}
                      stroke={colors.border}
                      strokeWidth="2"
                      rx="8"
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedNode(node)}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                    />
                    
                    {/* Node icon */}
                    <foreignObject
                      x={node.x + 8}
                      y={node.y + 8}
                      width="16"
                      height="16"
                    >
                      {node.type === 'service' && <Package size={16} color={colors.text} />}
                      {node.type === 'component' && <FileText size={16} color={colors.text} />}
                      {node.type === 'page' && <FileText size={16} color={colors.text} />}
                      {node.type === 'utility' && <Settings size={16} color={colors.text} />}
                      {node.type === 'group' && <Folder size={16} color={colors.text} />}
                    </foreignObject>
                    
                    {/* Node text */}
                    <text
                      x={node.x + 28}
                      y={node.y + 18}
                      fontSize="12"
                      fontWeight="500"
                      fill={colors.text}
                      className="pointer-events-none"
                    >
                      {node.name.length > 12 ? `${node.name.substring(0, 12)}...` : node.name}
                    </text>
                    
                    {/* File count for groups */}
                    {node.fileCount && (
                      <text
                        x={node.x + 28}
                        y={node.y + 35}
                        fontSize="10"
                        fill={colors.text}
                        opacity="0.7"
                        className="pointer-events-none"
                      >
                        {node.fileCount} files
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        
        {/* Details Panel */}
        <div className="w-80 border-l bg-gray-50 p-4">
          {selectedNode ? (
            <div>
              <h4 className="font-semibold mb-3">{selectedNode.name}</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 capitalize">{selectedNode.type}</span>
                </div>
                
                {selectedNode.fileCount && (
                  <div>
                    <span className="text-gray-600">Files:</span>
                    <span className="ml-2">{selectedNode.fileCount}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-600">Connections:</span>
                  <span className="ml-2">{selectedNode.connections.length}</span>
                </div>
                
                {selectedNode.files && selectedNode.files.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">
                      Files ({selectedNode.files.length})
                    </h5>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {selectedNode.files.slice(0, 10).map((file, index) => (
                        <div key={index} className="text-xs font-mono bg-white p-1 rounded">
                          {file.split('/').pop()}
                        </div>
                      ))}
                      {selectedNode.files.length > 10 && (
                        <div className="text-xs text-gray-500">
                          ...and {selectedNode.files.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="mb-4">Click on a node to see details</p>
              
              <div className="space-y-3 text-sm">
                <h5 className="font-medium text-gray-700">Legend</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Package size={14} className="mr-2 text-blue-600" />
                    <span>Services/APIs</span>
                  </div>
                  <div className="flex items-center">
                    <FileText size={14} className="mr-2 text-green-600" />
                    <span>Components</span>
                  </div>
                  <div className="flex items-center">
                    <FileText size={14} className="mr-2 text-orange-600" />
                    <span>Pages</span>
                  </div>
                  <div className="flex items-center">
                    <Settings size={14} className="mr-2 text-purple-600" />
                    <span>Utilities</span>
                  </div>
                  <div className="flex items-center">
                    <Folder size={14} className="mr-2 text-gray-600" />
                    <span>Grouped Files</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {nodes.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h5 className="font-medium text-gray-700 mb-2">Summary</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Files:</span>
                  <span>{files.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Key Nodes:</span>
                  <span>{nodes.filter(n => n.type !== 'group').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Grouped Files:</span>
                  <span>{nodes.filter(n => n.type === 'group').reduce((sum, n) => sum + (n.fileCount || 0), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connections:</span>
                  <span>{connections.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureMap;