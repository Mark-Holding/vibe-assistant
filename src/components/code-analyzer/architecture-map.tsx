"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Package } from 'lucide-react';
import { Settings } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Folder } from 'lucide-react';
import { Download } from 'lucide-react';
import { Eye } from 'lucide-react';
import { EyeOff } from 'lucide-react';
import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import type { FileData } from '../../types/code-analyzer';
import { FileTypeUtils } from './file-structure/utils';
import { analyzeEnhancedMetrics } from '../../utils/enhancedMetricsAnalyzer';
import { EnhancedMetricTooltip } from '../ui/EnhancedMetricTooltip';

// Types
interface ArchitectureNode {
  id: string;
  name: string;
  type: 'service' | 'component' | 'page' | 'utility' | 'config' | 'group' | 'middleware' | 'model' | 'state' | 'environment';
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
  const actualFilename = path.split('/').pop()?.toLowerCase() || '';
  const pathParts = path.split('/');
  
  // NEXT.JS SPECIFIC PATTERNS
  // Next.js App Router special files (highest priority)
  const nextjsAppRouterFiles = [
    'page.tsx', 'page.jsx', 'page.js', 'page.ts',
    'layout.tsx', 'layout.jsx', 'layout.js', 'layout.ts',
    'error.tsx', 'error.jsx', 'error.js', 'error.ts',
    'loading.tsx', 'loading.jsx', 'loading.js', 'loading.ts',
    'not-found.tsx', 'not-found.jsx', 'not-found.js', 'not-found.ts',
    'global-error.tsx', 'global-error.jsx', 'global-error.js', 'global-error.ts',
    'template.tsx', 'template.jsx', 'template.js', 'template.ts'
  ];
  
  if (nextjsAppRouterFiles.includes(actualFilename)) {
    // Check if it's in app directory structure
    if (path.includes('/app/') || path.includes('/src/app/')) {
      return { category: 'page', importance: 9 };
    }
  }
  
  // Next.js API Routes (App Router: route.ts/js in /app/ directory)
  if ((actualFilename === 'route.ts' || actualFilename === 'route.js') && 
      (path.includes('/app/') || path.includes('/src/app/'))) {
    return { category: 'service', importance: 8 };
  }
  
  // Next.js Pages Router API routes
  if (path.includes('/pages/api/') || path.includes('/src/pages/api/')) {
    return { category: 'service', importance: 8 };
  }
  
  // Next.js middleware (root level)
  if ((actualFilename === 'middleware.ts' || actualFilename === 'middleware.js') && 
      (path === `middleware.ts` || path === `middleware.js` || 
       path === `src/middleware.ts` || path === `src/middleware.js` || 
       path.endsWith('/middleware.ts') || path.endsWith('/middleware.js'))) {
    return { category: 'middleware', importance: 8 };
  }
  
  // Next.js special files
  const nextjsSpecialFiles = [
    '_app.tsx', '_app.jsx', '_app.js',  // App component
    '_document.tsx', '_document.jsx', '_document.js',  // Document component
    '404.tsx', '404.jsx', '404.js',  // 404 page
    '500.tsx', '500.jsx', '500.js',  // 500 page
    '_error.tsx', '_error.jsx', '_error.js'  // Error page
  ];
  
  if (nextjsSpecialFiles.includes(actualFilename)) {
    return { category: 'page', importance: 9 };
  }
  
  // Next.js config files
  const nextjsConfigFiles = [
    'next.config.js', 'next.config.mjs', 'next.config.ts',
    'next-env.d.ts'
  ];
  
  if (nextjsConfigFiles.includes(actualFilename)) {
    return { category: 'config', importance: 3 };
  }
  
  // GENERAL PATTERNS (existing logic with enhancements)
  // MIDDLEWARE: Next.js middleware files, auth logic, interceptors
  if (filename.includes('middleware') || 
      path.includes('/middleware/') ||
      filename.includes('auth.ts') || 
      filename.includes('auth.js') ||
      filename.includes('interceptor')) {
    return { category: 'middleware', importance: 8 };
  }
  
  // DATABASE/MODEL: ORM definitions, database schemas
  if (path.match(/\/(models|db|prisma|database)\//) || 
      filename.includes('model') || 
      filename.includes('schema') || 
      filename.includes('entity') ||
      filename.includes('prisma') ||
      filename.includes('.prisma')) {
    return { category: 'model', importance: 7 };
  }
  
  // STATE MANAGEMENT: Redux, Zustand, Jotai stores
  if (filename.includes('store') || 
      filename.includes('slice') || 
      filename.includes('atom') ||
      filename.includes('reducer') ||
      path.includes('/store/') ||
      path.includes('/stores/') ||
      path.includes('/state/')) {
    return { category: 'state', importance: 7 };
  }
  
  // ENVIRONMENT: .env files and variants
  if (actualFilename.startsWith('.env') || 
      filename.includes('environment') ||
      actualFilename === 'env.ts' ||
      actualFilename === 'env.js') {
    console.log('Categorized as environment file:', path, 'filename:', actualFilename);
    return { category: 'environment', importance: 6 };
  }
  
  // PAGE: in /pages/ or /app/ or filename includes page/route
  if (path.match(/\/(pages|app)\//) || filename.includes('page') || filename.includes('route')) {
    return { category: 'page', importance: 9 };
  }
  
  // SERVICE: in /services/ or filename includes service/api
  if (path.match(/\/(services)\//) || filename.includes('service') || filename.includes('api')) {
    return { category: 'service', importance: 8 };
  }
  
  // COMPONENT: any .tsx/.jsx file not already categorized as page/service
  if ((actualFilename.endsWith('.tsx') || actualFilename.endsWith('.jsx')) &&
      !filename.includes('test') &&
      !filename.includes('spec')) {
    return { category: 'component', importance: 8 };
  }
  
  // UTILITY
  if (filename.includes('hook') || filename.includes('use') || filename.includes('util') || filename.includes('helper') || filename.includes('lib')) {
    return { category: 'utility', importance: 7 };
  }
  
  // TYPES
  if (filename.includes('type') || filename.includes('interface') || actualFilename.includes('.d.ts')) {
    return { category: 'types', importance: 5 };
  }
  
  // STYLES
  if (actualFilename.endsWith('.css') || actualFilename.endsWith('.scss') || filename.includes('style')) {
    return { category: 'styles', importance: 4 };
  }
  
  // CONFIG
  if (filename.includes('config') || filename.includes('setting') || actualFilename.endsWith('.json') ||
      filename.includes('eslintrc') || filename.includes('postcss') || filename.includes('babel') ||
      filename.includes('prettier') || actualFilename === '.gitignore' || actualFilename === '.gitattributes' ||
      actualFilename === '.editorconfig') {
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

// File categorization rules
export const categorizeByAST = (content: string, path: string): { category: string; importance: number } => {
  // Path-based quick checks for dependencies
  const pathParts = path.split('/');
  if (pathParts.includes('node_modules') || pathParts.includes('.git')) {
    return { category: 'dependencies', importance: 1 };
  }
  
  // NEXT.JS SPECIFIC PATTERNS (same as categorizeFile)
  const filename = path.toLowerCase();
  const actualFilename = path.split('/').pop()?.toLowerCase() || '';
  
  // Next.js App Router special files (highest priority)
  const nextjsAppRouterFiles = [
    'page.tsx', 'page.jsx', 'page.js', 'page.ts',
    'layout.tsx', 'layout.jsx', 'layout.js', 'layout.ts',
    'error.tsx', 'error.jsx', 'error.js', 'error.ts',
    'loading.tsx', 'loading.jsx', 'loading.js', 'loading.ts',
    'not-found.tsx', 'not-found.jsx', 'not-found.js', 'not-found.ts',
    'global-error.tsx', 'global-error.jsx', 'global-error.js', 'global-error.ts',
    'template.tsx', 'template.jsx', 'template.js', 'template.ts'
  ];
  
  if (nextjsAppRouterFiles.includes(actualFilename)) {
    // Check if it's in app directory structure
    if (path.includes('/app/') || path.includes('/src/app/')) {
      console.log('AST categorized as Next.js App Router page:', path);
      return { category: 'page', importance: 9 };
    }
  }
  
  // Next.js API Routes (App Router: route.ts/js in /app/ directory)
  if ((actualFilename === 'route.ts' || actualFilename === 'route.js') && 
      (path.includes('/app/') || path.includes('/src/app/'))) {
    console.log('AST categorized as Next.js App Router API route:', path);
    return { category: 'service', importance: 8 };
  }
  
  // Next.js Pages Router API routes
  if (path.includes('/pages/api/') || path.includes('/src/pages/api/')) {
    console.log('AST categorized as Next.js Pages Router API route:', path);
    return { category: 'service', importance: 8 };
  }
  
  // Next.js special files
  const nextjsSpecialFiles = [
    '_app.tsx', '_app.jsx', '_app.js',  // App component
    '_document.tsx', '_document.jsx', '_document.js',  // Document component
    '404.tsx', '404.jsx', '404.js',  // 404 page
    '500.tsx', '500.jsx', '500.js',  // 500 page
    '_error.tsx', '_error.jsx', '_error.js'  // Error page
  ];
  
  if (nextjsSpecialFiles.includes(actualFilename)) {
    console.log('AST categorized as Next.js special page:', path);
    return { category: 'page', importance: 9 };
  }
  
  // Environment files
  if (actualFilename.startsWith('.env') || 
      filename.includes('environment') ||
      actualFilename === 'env.ts' ||
      actualFilename === 'env.js') {
    console.log('AST categorized as environment file:', path, 'filename:', actualFilename);
    return { category: 'environment', importance: 6 };
  }
  
  // Middleware files
  if (filename.includes('middleware') || 
      path.includes('/middleware/') ||
      filename.includes('auth.ts') || 
      filename.includes('auth.js') ||
      filename.includes('interceptor')) {
    return { category: 'middleware', importance: 8 };
  }
  
  // Database/Model files
  if (path.match(/\/(models|db|prisma|database)\//) || 
      filename.includes('model') || 
      filename.includes('schema') || 
      filename.includes('entity') ||
      filename.includes('prisma') ||
      filename.includes('.prisma')) {
    return { category: 'model', importance: 7 };
  }
  
  if (path.match(/\/(pages|app)\//) || path.toLowerCase().includes('page') || path.toLowerCase().includes('route')) {
    return { category: 'page', importance: 9 };
  }
  if (path.match(/\/(services)\//) || path.toLowerCase().includes('service') || path.toLowerCase().includes('api')) {
    return { category: 'service', importance: 8 };
  }
  if (actualFilename.endsWith('.json')) {
    try {
      const json = JSON.parse(content);
      if (json && typeof json === 'object' && (
        json.config || json.configuration || json.settings || json.env || json.compilerOptions
      )) {
        return { category: 'config', importance: 2 };
      }
    } catch {}
  }
  
  // Skip Babel parsing for non-JavaScript files
  const shouldSkipBabelParsing = 
    actualFilename.startsWith('.env') ||
    actualFilename.endsWith('.env') ||
    actualFilename.endsWith('.local') ||
    actualFilename === '.gitignore' ||
    actualFilename.endsWith('.md') ||
    actualFilename.endsWith('.txt') ||
    actualFilename.endsWith('.yml') ||
    actualFilename.endsWith('.yaml') ||
    actualFilename.endsWith('.css') ||
    actualFilename.endsWith('.scss') ||
    actualFilename.endsWith('.html') ||
    actualFilename.endsWith('.prisma') ||
    filename.includes('eslintrc') ||
    filename.includes('prettier') ||
    filename.includes('babel') ||
    actualFilename === '.editorconfig' ||
    actualFilename === '.gitattributes';
  
  if (shouldSkipBabelParsing) {
    console.log('Skipping Babel parsing for non-JS file:', path);
    return categorizeFile(path);
  }
  
  // Try to parse JS/TS files only
  try {
    const ast = babelParser.parse(content, {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript'],
    });
    let foundJSX = false;
    let foundUseFunction = false;
    let foundService = false;
    let foundType = false;
    let foundTest = false;
    let foundStyle = false;
    let foundStateManagement = false;
    let foundMiddleware = false;
    let foundModel = false;
    let foundComponent = false;
    let foundNextjsAPI = false;
    
    // Enhanced pattern collections
    const serviceImports = ['axios', 'fetch', 'swr', 'react-query', '@tanstack/react-query', 'graphql', 'apollo', '@apollo/client', 'urql', 'relay'];
    const componentImports = ['@mui/material', '@chakra-ui', 'antd', '@headlessui/react', 'shadcn', '@radix-ui', 'framer-motion', 'styled-components', '@emotion'];
    const reactHooks = ['useState', 'useEffect', 'useReducer', 'useContext', 'useMemo', 'useCallback', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue'];
    const nextjsImports = ['next/image', 'next/link', 'next/navigation', 'next/headers', 'next/cookies', 'next/cache', 'next/dynamic', 'next/router'];
    const serviceFunctions = ['fetchData', 'apiCall', 'request', 'query', 'mutation', 'getData', 'postData', 'putData', 'deleteData', 'patchData'];
    const nextjsAPIExports = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    
    traverse(ast, {
      JSXElement() { 
        foundJSX = true; 
        foundComponent = true;
      },
      
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        if (path.node.id && path.node.id.name) {
          const name = path.node.id.name;
          // Custom hooks
          if (name.startsWith('use')) {
            foundUseFunction = true;
          }
          // Service functions
          if (serviceFunctions.some(fn => name.toLowerCase().includes(fn.toLowerCase()))) {
            foundService = true;
          }
        }
      },
      
      ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
        const val = path.node.source.value;
        if (typeof val === 'string') {
          // Enhanced service detection
          if (serviceImports.some(lib => val.includes(lib))) {
            foundService = true;
          }
          
          // Enhanced component detection
          if (componentImports.some(lib => val.includes(lib))) {
            foundComponent = true;
          }
          
          // React hooks detection
          if (val === 'react' && path.node.specifiers) {
            const importedNames = path.node.specifiers
              .filter(spec => spec.type === 'ImportSpecifier')
              .map(spec => (spec as any).imported.name);
            
            if (reactHooks.some(hook => importedNames.includes(hook))) {
              foundComponent = true;
            }
          }
          
          // Next.js specific imports
          if (nextjsImports.some(nextImport => val.includes(nextImport))) {
            foundComponent = true;
          }
          
          // Legacy patterns
          if (val.includes('axios') || val.includes('fetch')) foundService = true;
          if (val.match(/\.css$|\.scss$|style/)) foundStyle = true;
          
          // State management patterns
          if (val.includes('redux') || val.includes('zustand') || val.includes('jotai') || 
              val.includes('@reduxjs/toolkit') || val.includes('recoil')) {
            foundStateManagement = true;
          }
          
          // Middleware patterns
          if (val.includes('next/server') || val.includes('middleware')) {
            foundMiddleware = true;
          }
          
          // Database/ORM patterns
          if (val.includes('prisma') || val.includes('typeorm') || val.includes('sequelize') ||
              val.includes('mongoose') || val.includes('drizzle')) {
            foundModel = true;
          }
        }
      },
      
      CallExpression(path: NodePath<t.CallExpression>) {
        if (path.node.callee.type === 'Identifier') {
          const name = path.node.callee.name;
          // Test patterns
          if (['describe', 'test', 'expect', 'it'].includes(name)) foundTest = true;
          
          // Service patterns
          if (name === 'fetch' || name === 'axios') foundService = true;
          if (serviceFunctions.includes(name)) foundService = true;
          
          // React hooks
          if (reactHooks.includes(name)) foundComponent = true;
          
          // State management function calls
          if (['createStore', 'configureStore', 'createSlice', 'atom', 'useStore'].includes(name)) {
            foundStateManagement = true;
          }
        }
      },
      
      // Detect Next.js API route exports
      ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
        if (path.node.declaration && path.node.declaration.type === 'FunctionDeclaration') {
          const func = path.node.declaration as t.FunctionDeclaration;
          if (func.id && nextjsAPIExports.includes(func.id.name)) {
            foundNextjsAPI = true;
            foundService = true;
          }
        }
        // Also check for variable declarations with HTTP method names
        if (path.node.declaration && path.node.declaration.type === 'VariableDeclaration') {
          const varDecl = path.node.declaration as t.VariableDeclaration;
          varDecl.declarations.forEach(decl => {
            if (decl.id.type === 'Identifier' && nextjsAPIExports.includes(decl.id.name)) {
              foundNextjsAPI = true;
              foundService = true;
            }
          });
        }
      },
      
      // Detect middleware exports
      ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
        if (path.node.declaration && path.node.declaration.type === 'FunctionDeclaration') {
          const func = path.node.declaration as t.FunctionDeclaration;
          if (func.params.length >= 1 && func.params[0].type === 'Identifier') {
            // Check for middleware pattern (request/response parameters)
            foundMiddleware = true;
          }
        }
      },
      
      // Detect 'use client' and 'use server' directives
      StringLiteral(path: NodePath<t.StringLiteral>) {
        if (path.node.value === 'use client' || path.node.value === 'use server') {
          foundComponent = true;
        }
      },
      
      TSInterfaceDeclaration() { foundType = true; },
      TSTypeAliasDeclaration() { foundType = true; },
      
      VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
        if (path.node.id.type === 'Identifier') {
          const name = path.node.id.name;
          if (name.startsWith('use')) {
            foundUseFunction = true;
          }
          // State management variable patterns
          if (name.includes('Store') || name.includes('slice') || name.includes('atom')) {
            foundStateManagement = true;
          }
          // Service variable patterns
          if (serviceFunctions.some(fn => name.toLowerCase().includes(fn.toLowerCase()))) {
            foundService = true;
          }
        }
      },
    });
    
    // Enhanced priority checking with new patterns
    if (foundNextjsAPI) { console.log('AST categorized as Next.js API route:', path); return { category: 'service', importance: 8 }; }
    if (foundMiddleware) { console.log('AST categorized as middleware:', path); return { category: 'middleware', importance: 8 }; }
    if (foundModel) { console.log('AST categorized as model:', path); return { category: 'model', importance: 7 }; }
    if (foundStateManagement) { console.log('AST categorized as state:', path); return { category: 'state', importance: 7 }; }
    if (foundService) { console.log('AST categorized as service:', path); return { category: 'service', importance: 8 }; }
    if (foundComponent || foundJSX) { console.log('AST categorized as component:', path); return { category: 'component', importance: 8 }; }
    if (foundUseFunction) { console.log('AST categorized as utility:', path); return { category: 'utility', importance: 7 }; }
    if (foundType) { console.log('AST categorized as types:', path); return { category: 'types', importance: 5 }; }
    if (foundTest) { console.log('AST categorized as tests:', path); return { category: 'tests', importance: 3 }; }
    if (foundStyle) { console.log('AST categorized as styles:', path); return { category: 'styles', importance: 4 }; }
  } catch (e) {
    console.warn('AST parse failed, falling back:', path, e);
  }
  // Fallback to path-based
  console.log('Fallback to path-based categorization:', path);
  return categorizeFile(path);
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
const buildArchitectureTree = async (files: Array<{ name: string; path: string; type: string; size: number; file: File; category?: string; importance?: number }>): Promise<ArchitectureNode[]> => {
  const categorizedFiles = new Map<string, Array<{ name: string; path: string; importance: number }>>();
  for (const file of files) {
    const category = file.category || 'other';
    const importance = file.importance ?? 3;
    if (!categorizedFiles.has(category)) {
      categorizedFiles.set(category, []);
    }
    categorizedFiles.get(category)!.push({
      name: file.name,
      path: file.path,
      importance
    });
  }
  
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
    if (category === 'page' || category === 'service' || category === 'middleware') {
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
    } else if (category === 'model' || category === 'state') {
      // Show important model/state files individually
      sortedFiles.slice(0, 6).forEach(file => {
        nodes.push({
          id: `node_${nodeId++}`,
          name: file.name.replace(/\.(tsx|jsx|ts|js|prisma)$/, ''),
          type: category as ArchitectureNode['type'],
          connections: [],
          x: 0,
          y: 0,
          width: 110,
          height: 55,
          level: 2,
          files: [file.path]
        });
      });
      
      if (sortedFiles.length > 6) {
        const displayName = category === 'model' ? 'Models' : 'State';
        nodes.push({
          id: `node_${nodeId++}`,
          name: `${displayName} (${sortedFiles.length - 6})`,
          type: 'group',
          connections: [],
          x: 0,
          y: 0,
          width: 110,
          height: 55,
          level: 2,
          fileCount: sortedFiles.length - 6,
          files: sortedFiles.slice(6).map(f => f.path)
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
  // Group nodes by type
  const pages = nodes.filter(n => n.type === 'page');
  const services = nodes.filter(n => n.type === 'service');
  const components = nodes.filter(n => n.type === 'component');
  const utilities = nodes.filter(n => n.type === 'utility');
  const groups = nodes.filter(n => n.type === 'group');

  // --- Pages: Top row ---
  const pageY = 80;
  const pageSpacing = pages.length > 1 ? Math.max(140, (width - 100) / pages.length) : 0;
  pages.forEach((node, i) => {
    node.x = width / 2 - ((pages.length - 1) * pageSpacing) / 2 + i * pageSpacing;
    node.y = pageY;
  });

  // --- Services: Second row ---
  const serviceY = 200;
  const serviceSpacing = services.length > 1 ? Math.max(140, (width - 100) / services.length) : 0;
  services.forEach((node, i) => {
    node.x = width / 2 - ((services.length - 1) * serviceSpacing) / 2 + i * serviceSpacing;
    node.y = serviceY;
  });
  
  // --- Components: Center grid ---
  const compStartY = 320;
  const componentsPerRow = Math.min(6, components.length);
  const compRows = Math.ceil(components.length / componentsPerRow);
  const compSpacingX = componentsPerRow > 1 ? Math.min(180, (width - 100) / componentsPerRow) : 0;
  const compSpacingY = 80;
  components.forEach((node, i) => {
    const row = Math.floor(i / componentsPerRow);
    const col = i % componentsPerRow;
    const rowY = compStartY + row * compSpacingY;
    const rowCount = (row === compRows - 1) ? (components.length - row * componentsPerRow) : componentsPerRow;
    const rowWidth = (rowCount - 1) * compSpacingX;
    node.x = width / 2 - rowWidth / 2 + col * compSpacingX;
    node.y = rowY;
  });

  // --- Utilities: Left and right columns ---
  const utilLeftX = 80;
  const utilRightX = width - 180;
  const utilSpacingY = 60;
  const utilHalf = Math.ceil(utilities.length / 2);
  utilities.forEach((node, i) => {
    if (i < utilHalf) {
      node.x = utilLeftX;
      node.y = compStartY + i * utilSpacingY;
    } else {
      node.x = utilRightX;
      node.y = compStartY + (i - utilHalf) * utilSpacingY;
    }
  });

  // --- Groups: Bottom row ---
  const groupY = height - 120;
  const groupSpacing = groups.length > 1 ? Math.max(140, (width - 100) / groups.length) : 0;
  groups.forEach((node, i) => {
    node.x = width / 2 - ((groups.length - 1) * groupSpacing) / 2 + i * groupSpacing;
    node.y = groupY;
  });
  
  return nodes;
};

// Get node color based on type
const getNodeColor = (type: string): { bg: string; border: string; text: string } => {
  // Use FileTypeUtils.categorizeFile for color
  const { color } = FileTypeUtils.categorizeFile(type);
  // Use color for bg and border, and pick a readable text color
  const textColor = ['#f7df1e', '#f59e42', '#fee2e2', '#fef3c7', '#fff', '#61dafb', '#10b981', '#22c55e', '#1572b6', '#6366f1'].includes(color)
    ? '#222' : '#fff';
  return {
    bg: color,
    border: color,
    text: textColor
  };
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
  // Pan state
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Process files and build architecture
  const processArchitecture = useCallback(async () => {
    if (!files.length) return;
    
    setIsLoading(true);
    
    try {
      // Build simplified architecture tree
      const architectureNodes = await buildArchitectureTree(files);
      
      // Update importantFiles filtering to use file.importance directly
      const importantFiles = (files as FileData[]).filter(file => (file.importance ?? 0) >= 5);
      
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
    setDragOffset({ x: mouseX - node.x - panOffset.x, y: mouseY - node.y - panOffset.y });
    // Disable text selection
    document.body.style.userSelect = 'none';
  };

  // Mouse event handlers for background panning
  const handleSvgMouseDown = (e: React.MouseEvent) => {
    // Only start panning if not clicking on a node
    if (e.target instanceof SVGRectElement) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    document.body.style.userSelect = 'none';
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === draggingNodeId
            ? { ...node, x: mouseX - dragOffset.x - panOffset.x, y: mouseY - dragOffset.y - panOffset.y }
            : node
        )
      );
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleSvgMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      // Re-enable text selection
      document.body.style.userSelect = '';
    }
    if (isPanning) {
      setIsPanning(false);
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
        <div ref={containerRef} className="flex-1" style={{ height: '700px', position: 'relative' }}>
          {/* Legend floating box */}
          <div
            style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}
            className="bg-white rounded-lg shadow-md p-3 w-40 min-w-[10rem] border border-gray-200"
          >
            <h5 className="font-medium text-gray-700 mb-2">Legend</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Package size={14} className="mr-2" style={{ color: FileTypeUtils.categorizeFile('Service').color }} />
                <span>Services/APIs</span>
              </div>
              <div className="flex items-center">
                <FileText size={14} className="mr-2" style={{ color: FileTypeUtils.categorizeFile('Component').color }} />
                <span>Components</span>
              </div>
              <div className="flex items-center">
                <FileText size={14} className="mr-2" style={{ color: FileTypeUtils.categorizeFile('Page').color }} />
                <span>Pages</span>
              </div>
              <div className="flex items-center">
                <Settings size={14} className="mr-2" style={{ color: FileTypeUtils.categorizeFile('Utility').color }} />
                <span>Utilities</span>
              </div>
              <div className="flex items-center">
                <Folder size={14} className="mr-2" style={{ color: FileTypeUtils.categorizeFile('Other').color }} />
                <span>Grouped Files</span>
              </div>
            </div>
          </div>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="border-r"
            onMouseDown={handleSvgMouseDown}
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
                      x1={fromNode.x + fromNode.width / 2 + panOffset.x}
                      y1={fromNode.y + fromNode.height / 2 + panOffset.y}
                      x2={toNode.x + toNode.width / 2 + panOffset.x}
                      y2={toNode.y + toNode.height / 2 + panOffset.y}
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
                const isGroup = node.type === 'group';
                let displayName = node.name;
                if (!isGroup && node.files && node.files.length === 1) {
                  const filePath = node.files[0];
                  const fileName = filePath.split('/').pop() || node.name;
                  if (node.type === 'page') {
                    // Use folder name + file name for pages
                    const parts = filePath.split('/');
                    const folderName = parts.length > 1 ? parts[parts.length - 2] : '';
                    displayName = folderName ? `${folderName} ${fileName}` : fileName;
                  } else {
                    displayName = fileName;
                  }
                }
                // Dynamically calculate width and height based on text
                const charWidth = 7;
                const minWidth = isGroup ? 100 : 60;
                const textWidth = displayName.length * charWidth;
                const boxWidth = Math.max(minWidth, 32 + textWidth + 16); // 32 for icon/padding, 16 for extra space
                const fontSize = 12;
                const verticalPadding = 14;
                const boxHeight = isGroup ? node.height : fontSize + verticalPadding * 2;
                return (
                  <g key={node.id}>
                    <rect
                      x={node.x + panOffset.x}
                      y={node.y + panOffset.y}
                      width={boxWidth}
                      height={boxHeight}
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
                      x={node.x + 8 + panOffset.x}
                      y={node.y + 8 + panOffset.y}
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
                      x={node.x + 28 + panOffset.x}
                      y={node.y + verticalPadding + fontSize + panOffset.y - 4}
                      fontSize={fontSize}
                      fontWeight="500"
                      fill={colors.text}
                      className="pointer-events-none"
                    >
                      {displayName.length > 48 ? `${displayName.substring(0, 45)}...` : displayName}
                    </text>
                    
                    {/* File count for groups */}
                    {node.fileCount && (
                      <text
                        x={node.x + 28 + panOffset.x}
                        y={node.y + 35 + panOffset.y}
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
                
                {/* Enhanced Metrics Section */}
                {selectedNode.files && selectedNode.files.length === 1 && (
                  <div className="border-t pt-3 mt-3">
                    <h5 className="font-medium text-gray-700 mb-2">
                      📊 Enhanced Metrics
                    </h5>
                    <EnhancedMetricsDisplay filePath={selectedNode.files[0]} files={files} />
                  </div>
                )}
                
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

// Enhanced Metrics Display Component
const EnhancedMetricsDisplay: React.FC<{ filePath: string; files: Array<{ name: string; path: string; type: string; size: number; file: File }> }> = ({ filePath, files }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const analyzeFile = async () => {
      setLoading(true);
      try {
        // Find the file in the files array
        const targetFile = files.find((f: { path: string; file: File }) => f.path === filePath);
        if (targetFile && targetFile.file) {
          const content = await targetFile.file.text();
          console.log('🔍 Analyzing enhanced metrics for:', filePath);
          const enhancedMetrics = analyzeEnhancedMetrics(content, filePath);
          console.log('📊 Enhanced metrics result:', enhancedMetrics);
          setMetrics(enhancedMetrics);
        }
      } catch (error) {
        console.error('Error analyzing enhanced metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeFile();
  }, [filePath, files]);
  
  if (loading) {
    return <div className="text-xs text-gray-500">Analyzing...</div>;
  }
  
  if (!metrics) {
    return <div className="text-xs text-gray-500">No metrics available</div>;
  }
  
  return (
    <div className="space-y-2 text-xs">
      {/* Complexity Metrics */}
      <div>
        <div className="font-medium text-gray-600 mb-1">🧠 Complexity</div>
        <div className="ml-2 space-y-1">
          <div className="flex justify-between">
            <EnhancedMetricTooltip 
              metricKey="cyclomaticComplexity" 
              value={metrics.complexity.cyclomaticComplexity}
            >
              <span className="cursor-help underline decoration-dotted">Cyclomatic:</span>
            </EnhancedMetricTooltip>
            <span className={`font-mono ${
              metrics.complexity.cyclomaticComplexity > 10 ? 'text-red-600' :
              metrics.complexity.cyclomaticComplexity > 5 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {metrics.complexity.cyclomaticComplexity}
            </span>
          </div>
          <div className="flex justify-between">
            <EnhancedMetricTooltip 
              metricKey="cognitiveComplexity" 
              value={metrics.complexity.cognitiveComplexity}
            >
              <span className="cursor-help underline decoration-dotted">Cognitive:</span>
            </EnhancedMetricTooltip>
            <span className={`font-mono ${
              metrics.complexity.cognitiveComplexity > 15 ? 'text-red-600' :
              metrics.complexity.cognitiveComplexity > 8 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {metrics.complexity.cognitiveComplexity}
            </span>
          </div>
          <div className="flex justify-between">
            <EnhancedMetricTooltip 
              metricKey="nestingDepth" 
              value={metrics.complexity.nestingDepth}
            >
              <span className="cursor-help underline decoration-dotted">Nesting:</span>
            </EnhancedMetricTooltip>
            <span className={`font-mono ${
              metrics.complexity.nestingDepth > 4 ? 'text-red-600' :
              metrics.complexity.nestingDepth > 2 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {metrics.complexity.nestingDepth}
            </span>
          </div>
        </div>
      </div>
      
      {/* Performance Indicators */}
      <div>
        <div className="font-medium text-gray-600 mb-1">⚡ Performance</div>
        <div className="ml-2 space-y-1">
          <div className="flex items-center justify-between">
            <EnhancedMetricTooltip 
              metricKey="hasHeavyDependencies" 
              value={metrics.bundleImpact.hasHeavyDependencies}
            >
              <span className="cursor-help underline decoration-dotted">Heavy Deps:</span>
            </EnhancedMetricTooltip>
            <span className={`text-xs px-1 rounded ${
              metrics.bundleImpact.hasHeavyDependencies ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {metrics.bundleImpact.hasHeavyDependencies ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <EnhancedMetricTooltip 
              metricKey="usesTreeShaking" 
              value={metrics.bundleImpact.usesTreeShaking}
            >
              <span className="cursor-help underline decoration-dotted">Tree Shaking:</span>
            </EnhancedMetricTooltip>
            <span className={`text-xs px-1 rounded ${
              metrics.bundleImpact.usesTreeShaking ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {metrics.bundleImpact.usesTreeShaking ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <EnhancedMetricTooltip 
              metricKey="hasBarrelExports" 
              value={metrics.bundleImpact.hasBarrelExports}
            >
              <span className="cursor-help underline decoration-dotted">Barrel Exports:</span>
            </EnhancedMetricTooltip>
            <span className={`text-xs px-1 rounded ${
              metrics.bundleImpact.hasBarrelExports ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              {metrics.bundleImpact.hasBarrelExports ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Next.js Features */}
      <div>
        <div className="font-medium text-gray-600 mb-1">⚛️ Next.js</div>
        <div className="ml-2 space-y-1">
          {metrics.nextjsFeatures.usesServerComponents && (
            <EnhancedMetricTooltip 
              metricKey="usesServerComponents" 
              value={metrics.nextjsFeatures.usesServerComponents}
            >
              <div className="text-xs bg-blue-100 text-blue-700 px-1 rounded cursor-help">
                Server Components
              </div>
            </EnhancedMetricTooltip>
          )}
          {metrics.nextjsFeatures.usesClientComponents && (
            <EnhancedMetricTooltip 
              metricKey="usesClientComponents" 
              value={metrics.nextjsFeatures.usesClientComponents}
            >
              <div className="text-xs bg-purple-100 text-purple-700 px-1 rounded cursor-help">
                Client Components
              </div>
            </EnhancedMetricTooltip>
          )}
          {metrics.nextjsFeatures.usesServerActions && (
            <EnhancedMetricTooltip 
              metricKey="usesServerActions" 
              value={metrics.nextjsFeatures.usesServerActions}
            >
              <div className="text-xs bg-indigo-100 text-indigo-700 px-1 rounded cursor-help">
                Server Actions
              </div>
            </EnhancedMetricTooltip>
          )}
          {metrics.nextjsFeatures.usesImageOptimization && (
            <EnhancedMetricTooltip 
              metricKey="usesImageOptimization" 
              value={metrics.nextjsFeatures.usesImageOptimization}
            >
              <div className="text-xs bg-emerald-100 text-emerald-700 px-1 rounded cursor-help">
                Image Optimization
              </div>
            </EnhancedMetricTooltip>
          )}
          {metrics.nextjsFeatures.usesDynamicImports && (
            <EnhancedMetricTooltip 
              metricKey="usesDynamicImports" 
              value={metrics.nextjsFeatures.usesDynamicImports}
            >
              <div className="text-xs bg-orange-100 text-orange-700 px-1 rounded cursor-help">
                Dynamic Imports
              </div>
            </EnhancedMetricTooltip>
          )}
          {!Object.values(metrics.nextjsFeatures).some(feature => feature) && (
            <div className="text-gray-500 text-xs">
              No Next.js features detected
              <EnhancedMetricTooltip 
                metricKey="usesServerComponents" 
                value={false}
              >
                <span className="ml-1 cursor-help text-gray-400">ℹ️</span>
              </EnhancedMetricTooltip>
            </div>
          )}
        </div>
      </div>
      
      {/* Dependencies Summary */}
      <div>
        <div className="font-medium text-gray-600 mb-1">📦 Dependencies</div>
        <div className="ml-2 space-y-1">
          <div className="flex justify-between">
            <EnhancedMetricTooltip 
              metricKey="internalDependencies" 
              value={metrics.dependencies.internal.length}
            >
              <span className="cursor-help underline decoration-dotted">Internal:</span>
            </EnhancedMetricTooltip>
            <span className="font-mono">{metrics.dependencies.internal.length}</span>
          </div>
          <div className="flex justify-between">
            <EnhancedMetricTooltip 
              metricKey="externalDependencies" 
              value={metrics.dependencies.external.length}
            >
              <span className="cursor-help underline decoration-dotted">External:</span>
            </EnhancedMetricTooltip>
            <span className="font-mono">{metrics.dependencies.external.length}</span>
          </div>
          {metrics.dependencies.circular.length > 0 && (
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="circularDependencies" 
                value={metrics.dependencies.circular.length}
              >
                <span className="cursor-help underline decoration-dotted">Circular:</span>
              </EnhancedMetricTooltip>
              <span className="font-mono text-red-600">{metrics.dependencies.circular.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureMap;