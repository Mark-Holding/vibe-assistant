import React, { useState, useEffect } from 'react';
import EntryPointsSection from './EntryPointsSection';
import FunctionsAnalysisSection from './FunctionsAnalysisSection';
import ComponentsAnalysisSection from './ComponentsAnalysisSection';
import AlgorithmsSection from './AlgorithmsSection';
import DataFlowSection from './DataFlowSection';
import { Code, Loader2, RefreshCw, Zap } from 'lucide-react';
import {
  FunctionInfo,
  ComponentInfo,
  AlgorithmInfo,
  DataFlowInfo,
  EntryPointInfo,
  CodeAnalysisTabProps
} from '../../../types/code-analysis';
import { codeAnalysisService } from '../../../lib/database/codeAnalysis';

interface AnalysisProgress {
  totalFiles: number;
  completedFiles: number;
  currentFile: string | null;
  isComplete: boolean;
  errors: string[];
}

const CodeAnalysisTab: React.FC<CodeAnalysisTabProps & { projectId: string }> = ({ files, projectId }) => {
  const [functions, setFunctions] = useState<FunctionInfo[]>([]);
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([]);
  const [dataFlow, setDataFlow] = useState<DataFlowInfo[]>([]);
  const [entryPoints, setEntryPoints] = useState<EntryPointInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Load analysis data from database
  const loadAnalysisData = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setLoadingError(null);
    
    try {
      console.log('📊 Loading analysis data from database...');
      
      // Load all analysis data in parallel
      const [
        functionsData,
        componentsData,
        algorithmsData,
        dataFlowData,
        entryPointsData
      ] = await Promise.all([
        codeAnalysisService.getFunctionAnalysis(projectId),
        codeAnalysisService.getComponentAnalysis(projectId),
        codeAnalysisService.getAlgorithmAnalysis(projectId),
        codeAnalysisService.getDataFlowAnalysis(projectId),
        codeAnalysisService.getEntryPointAnalysis(projectId)
      ]);

      // Transform database data to UI format
      const transformedFunctions: FunctionInfo[] = functionsData.map(func => ({
        name: func.name,
        file: (func as any).files?.relative_path || func.file_id, // Use joined file path if available
        line: func.line_number,
        purpose: func.purpose,
        type: func.function_type,
        complexity: func.complexity
      }));

      const transformedComponents: ComponentInfo[] = componentsData.map(comp => ({
        name: comp.name,
        file: (comp as any).files?.relative_path || comp.file_id, // Use joined file path if available
        purpose: comp.purpose,
        props: comp.props,
        dependencies: comp.dependencies,
        usedBy: comp.used_by
      }));

      const transformedAlgorithms: AlgorithmInfo[] = algorithmsData.map(algo => ({
        name: algo.name,
        file: (algo as any).files?.relative_path || algo.file_id, // Use joined file path if available
        line: algo.line_number,
        purpose: algo.purpose,
        complexity: algo.complexity,
        implementation: algo.implementation
      }));

      const transformedDataFlow: DataFlowInfo[] = dataFlowData.map(flow => ({
        from: flow.from_component,
        to: flow.to_component,
        type: flow.flow_type,
        description: flow.description
      }));

      const transformedEntryPoints: EntryPointInfo[] = entryPointsData.map(entry => ({
        file: (entry as any).files?.relative_path || entry.file_id, // Use joined file path if available
        type: entry.entry_type,
        purpose: entry.purpose,
        importance: entry.importance
      }));

      setFunctions(transformedFunctions);
      setComponents(transformedComponents);
      setAlgorithms(transformedAlgorithms);
      setDataFlow(transformedDataFlow);
      setEntryPoints(transformedEntryPoints);

      console.log('✅ Analysis data loaded:', {
        functions: transformedFunctions.length,
        components: transformedComponents.length,
        algorithms: transformedAlgorithms.length,
        dataFlow: transformedDataFlow.length,
        entryPoints: transformedEntryPoints.length
      });

    } catch (error) {
      console.error('❌ Error loading analysis data:', error);
      setLoadingError('Failed to load analysis data');
    } finally {
      setIsLoading(false);
    }
  };

  // Check analysis progress
  const checkAnalysisProgress = async () => {
    if (!projectId) return;
    
    try {
      const response = await fetch(`/api/start-analysis?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysisProgress(data.progress);
        
        // If analysis is complete, reload data
        if (data.progress?.isComplete && !isLoading) {
          loadAnalysisData();
        }
      }
    } catch (error) {
      console.error('Error checking analysis progress:', error);
    }
  };

  useEffect(() => {
    if (files.length === 0 || !projectId) {
      setFunctions([]);
      setComponents([]);
      setAlgorithms([]);
      setDataFlow([]);
      setEntryPoints([]);
      setAnalysisProgress(null);
      return;
    }

    // Load existing analysis data
    loadAnalysisData();
    
    // Check if analysis is currently running (on initial load)
    checkAnalysisProgress();
  }, [files, projectId]);

  // Separate effect for polling - only when analysis is actually in progress
  useEffect(() => {
    if (!analysisProgress || analysisProgress.isComplete) {
      return;
    }

    // Poll for progress updates every 5 seconds only if analysis is ongoing
    const progressInterval = setInterval(() => {
      checkAnalysisProgress();
    }, 5000);

    return () => {
      clearInterval(progressInterval);
    };
  }, [analysisProgress]);

  // Manual refresh
  const handleRefresh = () => {
    loadAnalysisData();
    checkAnalysisProgress();
  };

  // Start new analysis
  const handleStartAnalysis = async () => {
    try {
      const response = await fetch('/api/start-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId
        }),
      });

      if (response.ok) {
        // Start checking progress immediately
        checkAnalysisProgress();
      } else {
        setLoadingError('Failed to start analysis');
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      setLoadingError('Failed to start analysis');
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Code size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Upload files to see code analysis</p>
        </div>
      </div>
    );
  }

  // Show analysis progress if analysis is ongoing
  const showProgress = Boolean(analysisProgress && !analysisProgress.isComplete);

  return (
    <div className="space-y-6">
      {/* Analysis Progress Banner */}
      {showProgress && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Loader2 size={24} className="animate-spin text-blue-600 mr-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-900 mb-1">
                  🤖 Claude AI Analysis in Progress
                </h4>
                <p className="text-blue-700 mb-2">
                  Processing your codebase to identify functions, components, algorithms, and patterns...
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-blue-600 font-medium">
                    📁 Current: {analysisProgress?.currentFile ? 
                      analysisProgress.currentFile.split('/').pop() : 
                      'Preparing files...'
                    }
                  </span>
                  <span className="text-blue-600">
                    📊 Progress: {analysisProgress?.completedFiles || 0}/{analysisProgress?.totalFiles || 0} files
                  </span>
                  <span className="text-blue-600">
                    ⏱️ ETA: ~{Math.max(1, Math.ceil(((analysisProgress?.totalFiles || 0) - (analysisProgress?.completedFiles || 0)) * 1.5))} min
                  </span>
                </div>
              </div>
            </div>
                          <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {Math.round(((analysisProgress?.completedFiles || 0) / (analysisProgress?.totalFiles || 1)) * 100)}%
                </div>
                <div className="w-40 bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${((analysisProgress?.completedFiles || 0) / (analysisProgress?.totalFiles || 1)) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-blue-500 mt-1">Claude API Processing</p>
              </div>
            </div>
            
            {/* Error display if any */}
            {analysisProgress?.errors && analysisProgress.errors.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-700">
                  ⚠️ {analysisProgress.errors.length} file(s) had analysis issues (analysis continuing...)
                </p>
              </div>
            )}
        </div>
      )}

      {/* Error Banner */}
      {loadingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{loadingError}</p>
            <button 
              onClick={handleRefresh}
              className="flex items-center text-red-600 hover:text-red-800"
            >
              <RefreshCw size={16} className="mr-1" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Analysis Sections */}
      <EntryPointsSection 
        entryPoints={entryPoints} 
        isLoading={isLoading}
        error={loadingError}
      />
      <FunctionsAnalysisSection functions={functions} isLoading={isLoading} />
      <ComponentsAnalysisSection components={components} />
      <AlgorithmsSection algorithms={algorithms} />
      <DataFlowSection dataFlow={dataFlow} />

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleRefresh}
          disabled={isLoading || showProgress}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </button>
        
        {!showProgress && (
          <button
            onClick={handleStartAnalysis}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Zap size={16} className="mr-2" />
            Start New Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeAnalysisTab; 