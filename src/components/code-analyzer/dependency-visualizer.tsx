import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network, Share2, Download, Settings, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

// Types
interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'component' | 'utility' | 'hook' | 'page' | 'config' | 'style' | 'other';
  size: number;
  dependencies: string[];
  dependents: string[];
}

interface DependencyEdge {
  source: string;
  target: string;
  type: 'import' | 'export' | 'dynamic';
  weight: number;
}

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
  file: FileNode;
  radius: number;
  color: string;
}

interface GraphEdge {
  source: GraphNode;
  target: GraphNode;
  dependency: DependencyEdge;
}

interface DependencyVisualizerProps {
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
  }>;
}

// File type descriptions for tooltips and documentation
export const FILE_TYPE_DESCRIPTIONS: Record<string, string> = {
  'Page': 'A page file represents a route or screen in your application. These are typically top-level components that users navigate to, containing the main content and layout for specific URLs.',
  
  'Service': 'A service file contains business logic, API calls, and data management functions. These files handle external communications, data processing, and core application functionality.',
  
  'Component': 'A component file defines reusable UI elements and interactive pieces of your interface. These are the building blocks of your user interface that can be composed together.',
  
  'Utility': 'A utility file contains helper functions, hooks, and reusable logic that supports other parts of your application. These files provide common functionality used across multiple components.',
  
  'Types': 'A types file defines TypeScript interfaces, type definitions, and data structures. These files ensure type safety and provide clear contracts for your application\'s data.',
  
  'Styles': 'A styles file contains CSS, SCSS, or styling-related code that defines the visual appearance of your application. This includes stylesheets, styled-components, and design system files.',
  
  'Config': 'A config file contains configuration settings, environment setup, and build tool configurations. These files control how your application behaves in different environments.',
  
  'Dependencies': 'Dependencies are external libraries and packages that your project relies on. These files are typically managed by package managers and provide third-party functionality.',
  
  'Tests': 'A test file contains unit tests, integration tests, and test utilities that verify your application works correctly. These files ensure code quality and catch bugs early.',
  
  'Documentation': 'A documentation file contains project information, setup instructions, and explanations. These files help developers understand and contribute to your project.',
  
  'HTML': 'An HTML file contains markup structure and static content. These files define the basic structure of web pages and provide semantic meaning to your content.',
  
  'Middleware': 'A middleware file contains interceptor logic that runs between requests and responses. These files handle authentication, logging, routing, and request/response modification.',
  
  'Database/Model': 'A database or model file defines data structures, database schemas, and ORM configurations. These files manage how your application stores and retrieves data.',
  
  'State Management': 'A state management file contains global application state, reducers, and state logic. These files manage data flow and state updates across your application.',
  
  'Environment': 'An environment file contains environment variables and configuration that changes between development, staging, and production. These files store sensitive data and environment-specific settings.',
  
  'Other': 'Other files include miscellaneous assets, build outputs, and files that don\'t fit into specific categories. These might include images, fonts, or generated files.'
};

// Helper function to get description by file type
export const getFileTypeDescription = (fileType: string): string => {
  return FILE_TYPE_DESCRIPTIONS[fileType] || FILE_TYPE_DESCRIPTIONS['Other'];
};

// Helper function to get all file types with descriptions
export const getAllFileTypeDescriptions = (): Array<{ type: string; description: string }> => {
  return Object.entries(FILE_TYPE_DESCRIPTIONS).map(([type, description]) => ({
    type,
    description
  }));
};

// File type detection and categorization
const categorizeFile = (path: string, content: string): FileNode['type'] => {
  const filename = path.toLowerCase();
  
  if (filename.includes('component') || filename.includes('jsx') || filename.includes('tsx')) {
    return 'component';
  }
  if (filename.includes('hook') || filename.includes('use')) {
    return 'hook';
  }
  if (filename.includes('page') || filename.includes('route')) {
    return 'page';
  }
  if (filename.includes('util') || filename.includes('helper')) {
    return 'utility';
  }
  if (filename.includes('config') || filename.includes('setting')) {
    return 'config';
  }
  if (filename.includes('.css') || filename.includes('.scss')) {
    return 'style';
  }
  
  return 'other';
};

// Extract dependencies from file content
const extractDependencies = (content: string, currentPath: string): string[] => {
  const dependencies: string[] = [];
  
  // Match import statements
  const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)?\s*from\s+['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    // Only include relative imports (not node_modules)
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // Convert relative path to absolute path
      const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const absolutePath = resolvePath(currentDir, importPath);
      dependencies.push(absolutePath);
    }
  }
  
  // Match dynamic imports
  const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const absolutePath = resolvePath(currentDir, importPath);
      dependencies.push(absolutePath);
    }
  }
  
  // Match require statements
  const requireRegex = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
      const absolutePath = resolvePath(currentDir, importPath);
      dependencies.push(absolutePath);
    }
  }
  
  return dependencies;
};

// Helper function to resolve relative paths
const resolvePath = (basePath: string, relativePath: string): string => {
  const baseParts = basePath.split('/').filter(Boolean);
  const relativeParts = relativePath.split('/').filter(Boolean);
  
  // Handle parent directory references
  while (relativeParts[0] === '..') {
    baseParts.pop();
    relativeParts.shift();
  }
  
  // Combine paths
  return [...baseParts, ...relativeParts].join('/');
};

// Color scheme for different file types
const getNodeColor = (type: FileNode['type']): string => {
  const colors = {
    component: '#3B82F6', // Blue
    utility: '#10B981',   // Green
    hook: '#8B5CF6',      // Purple
    page: '#F59E0B',      // Orange
    config: '#EF4444',    // Red
    style: '#EC4899',     // Pink
    other: '#6B7280'      // Gray
  };
  return colors[type];
};

export const DependencyVisualizer: React.FC<DependencyVisualizerProps> = ({ files }) => {
  const [fileNodes, setFileNodes] = useState<FileNode[]>([]);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Process files and build dependency graph
  useEffect(() => {
    const processFiles = async () => {
      setIsLoading(true);
      const nodes: FileNode[] = [];
      const edges: DependencyEdge[] = [];
      
      console.log('Processing files:', files.length);
      
      // Process only the first 100 files
      const filesToProcess = files.slice(0, 100);
      
      // Create nodes
      for (const file of filesToProcess) {
        try {
          const content = await file.file.text();
          const type = categorizeFile(file.path, content);
          const dependencies = extractDependencies(content, file.path);
          
          console.log(`File: ${file.path}, Dependencies: ${dependencies.length}`);
          
          nodes.push({
            id: file.path,
            name: file.name,
            path: file.path,
            type,
            size: file.size,
            dependencies,
            dependents: []
          });
        } catch (error) {
          console.error(`Error processing file ${file.path}:`, error);
        }
      }
      
      // Create edges
      for (const node of nodes) {
        for (const dep of node.dependencies) {
          // Find the target node by matching the path
          const targetNode = nodes.find(n => {
            // Try exact match first
            if (n.path === dep) return true;
            
            // Try matching without extension
            const depWithoutExt = dep.replace(/\.[^/.]+$/, '');
            const nodePathWithoutExt = n.path.replace(/\.[^/.]+$/, '');
            if (nodePathWithoutExt === depWithoutExt) return true;
            
            // Try matching with different extensions
            const possibleExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
            return possibleExtensions.some(ext => {
              const depWithExt = depWithoutExt + ext;
              return n.path === depWithExt;
            });
          });
          
          if (targetNode) {
            edges.push({
              source: node.id,
              target: targetNode.id,
              type: 'import',
              weight: 1
            });
            targetNode.dependents.push(node.id);
          }
        }
      }
      
      setFileNodes(nodes);
      
      // Create graph nodes with initial positions
      const graphNodes: GraphNode[] = nodes.map(node => ({
        id: node.id,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: 0,
        vy: 0,
        file: node,
        radius: Math.max(8, Math.min(20, Math.sqrt(node.size) / 10)),
        color: getNodeColor(node.type)
      }));
      
      // Create graph edges
      const graphEdges: GraphEdge[] = edges.map(edge => ({
        source: graphNodes.find(n => n.id === edge.source)!,
        target: graphNodes.find(n => n.id === edge.target)!,
        dependency: edge
      }));
      
      setGraphNodes(graphNodes);
      setGraphEdges(graphEdges);
      setIsLoading(false);
    };
    
    if (files.length > 0) {
      processFiles();
    }
  }, [files, dimensions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force simulation
  useEffect(() => {
    if (!graphNodes.length || !dimensions.width || !dimensions.height) return;

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    const simulation = {
      tick: () => {
        // Apply forces
        graphNodes.forEach(node => {
          // Center force
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * 0.001;
          node.vy += dy * 0.001;
          
          // Repulsion between nodes
          graphNodes.forEach(other => {
            if (node !== other) {
              const dx = node.x - other.x;
              const dy = node.y - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 100 && distance > 0) {
                const force = 50 / (distance * distance);
                node.vx += (dx / distance) * force;
                node.vy += (dy / distance) * force;
              }
            }
          });
        });
        
        // Link force
        graphEdges.forEach(edge => {
          const dx = edge.target.x - edge.source.x;
          const dy = edge.target.y - edge.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const targetDistance = 80;
          
          if (distance > 0) {
            const force = (distance - targetDistance) * 0.1;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            edge.source.vx += fx;
            edge.source.vy += fy;
            edge.target.vx -= fx;
            edge.target.vy -= fy;
          }
        });
        
        // Update positions
        graphNodes.forEach(node => {
            node.vx *= 0.9; // Damping
            node.vy *= 0.9;
            node.x += node.vx;
            node.y += node.vy;
            
            // Boundary constraints
          node.x = Math.max(node.radius, Math.min(dimensions.width - node.radius, node.x));
          node.y = Math.max(node.radius, Math.min(dimensions.height - node.radius, node.y));
        });
      }
    };
    
    const animate = () => {
      simulation.tick();
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [graphNodes, graphEdges, dimensions]);

  // Draw the graph on canvas
  useEffect(() => {
    if (!canvasRef.current || !graphNodes.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply zoom to the canvas context
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw edges
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      graphEdges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(edge.source.x, edge.source.y);
        ctx.lineTo(edge.target.x, edge.target.y);
        ctx.stroke();
      });

      // Draw nodes
      graphNodes.forEach(node => {
        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Draw node border if selected
        if (selectedNode?.id === node.id) {
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw node label
        ctx.fillStyle = '#374151';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.file.name, node.x, node.y + node.radius + 12);
      });

      ctx.restore();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [graphNodes, graphEdges, selectedNode, zoom]);
  
  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };
  
  // Export graph data
  const exportGraphData = () => {
    const data = {
      nodes: fileNodes,
      edges: graphEdges.map(edge => ({
        source: edge.source.id,
        target: edge.target.id,
        type: edge.dependency.type
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dependency-graph.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;

    // Undo the transform: translate(-cx, -cy), scale(zoom), translate(cx, cy)
    const x = (rawX - cx) / zoom + cx;
    const y = (rawY - cy) / zoom + cy;

    // Find clicked node
    const clickedNode = graphNodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= node.radius;
    });

    setSelectedNode(clickedNode || null);
  }, [graphNodes, zoom]);
  
  // Add this useEffect for debugging
  useEffect(() => {
    console.log('DependencyVisualizer debug:', {
      fileNodes,
      graphNodes,
      graphEdges,
      files
    });
  }, [fileNodes, graphNodes, graphEdges, files]);
  
  return (
    <div className="relative h-full">
            {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="text-lg">Loading...</div>
        </div>
            )}
      {/* Debug Panel */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-80 rounded shadow p-2 z-50 text-xs">
        <div>Files: {files.length}</div>
        <div>Nodes: {graphNodes.length}</div>
        <div>Edges: {graphEdges.length}</div>
          </div>
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
        >
          <ZoomIn size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(1)}
        >
          <RotateCcw size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
              onClick={exportGraphData}
        >
          <Download size={16} />
        </Button>
      </div>
      
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onClick={handleCanvasClick}
        />
        </div>
        
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-medium">{selectedNode.file.name}</h3>
          <p className="text-sm text-gray-500">{selectedNode.file.path}</p>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Dependencies:</h4>
            <ul className="text-sm text-gray-600">
              {selectedNode.file.dependencies.map(dep => (
                <li key={dep}>{dep}</li>
                      ))}
                    </ul>
                  </div>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Dependents:</h4>
            <ul className="text-sm text-gray-600">
              {selectedNode.file.dependents.map(dep => (
                <li key={dep}>{dep}</li>
                      ))}
                    </ul>
                  </div>
        </div>
      )}
    </div>
  );
};