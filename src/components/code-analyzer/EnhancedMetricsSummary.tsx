import React from 'react';
import { EnhancedMetrics } from '../../utils/enhancedMetricsAnalyzer';
import { EnhancedMetricTooltip } from '../ui/EnhancedMetricTooltip';

interface EnhancedMetricsSummaryProps {
  metricsData: Array<{
    filePath: string;
    metrics: EnhancedMetrics;
  }>;
}

export const EnhancedMetricsSummary: React.FC<EnhancedMetricsSummaryProps> = ({ 
  metricsData 
}) => {
  // Calculate summary statistics
  const totalFiles = metricsData.length;
  
  // Complexity statistics
  const complexityStats = {
    avgCyclomatic: metricsData.reduce((sum, item) => sum + item.metrics.complexity.cyclomaticComplexity, 0) / totalFiles,
    avgCognitive: metricsData.reduce((sum, item) => sum + item.metrics.complexity.cognitiveComplexity, 0) / totalFiles,
    avgNesting: metricsData.reduce((sum, item) => sum + item.metrics.complexity.nestingDepth, 0) / totalFiles,
    highComplexityFiles: metricsData.filter(item => 
      item.metrics.complexity.cyclomaticComplexity > 10 || 
      item.metrics.complexity.cognitiveComplexity > 15
    ).length
  };
  
  // Performance indicators
  const performanceStats = {
    heavyDepsCount: metricsData.filter(item => item.metrics.bundleImpact.hasHeavyDependencies).length,
    treeShakingCount: metricsData.filter(item => item.metrics.bundleImpact.usesTreeShaking).length,
    barrelExportsCount: metricsData.filter(item => item.metrics.bundleImpact.hasBarrelExports).length
  };
  
  // Next.js features
  const nextjsStats = {
    serverComponents: metricsData.filter(item => item.metrics.nextjsFeatures.usesServerComponents).length,
    clientComponents: metricsData.filter(item => item.metrics.nextjsFeatures.usesClientComponents).length,
    serverActions: metricsData.filter(item => item.metrics.nextjsFeatures.usesServerActions).length,
    imageOptimization: metricsData.filter(item => item.metrics.nextjsFeatures.usesImageOptimization).length,
    dynamicImports: metricsData.filter(item => item.metrics.nextjsFeatures.usesDynamicImports).length
  };
  
  // Dependencies
  const allExternalDeps = new Set<string>();
  const allInternalDeps = new Set<string>();
  let totalCircularDeps = 0;
  
  metricsData.forEach(item => {
    item.metrics.dependencies.external.forEach(dep => allExternalDeps.add(dep));
    item.metrics.dependencies.internal.forEach(dep => allInternalDeps.add(dep));
    totalCircularDeps += item.metrics.dependencies.circular.length;
  });
  
  // Most common external dependencies
  const depCounts = new Map<string, number>();
  metricsData.forEach(item => {
    item.metrics.dependencies.external.forEach(dep => {
      depCounts.set(dep, (depCounts.get(dep) || 0) + 1);
    });
  });
  
  const topDependencies = Array.from(depCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        📊 Enhanced Metrics Summary
        <span className="ml-2 text-sm text-gray-500">({totalFiles} files analyzed)</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Complexity Overview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            🧠 Code Complexity
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="cyclomaticComplexity" 
                value={complexityStats.avgCyclomatic}
              >
                <span className="cursor-help underline decoration-dotted">Avg Cyclomatic:</span>
              </EnhancedMetricTooltip>
              <span className={`font-mono ${
                complexityStats.avgCyclomatic > 8 ? 'text-red-600' :
                complexityStats.avgCyclomatic > 5 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {complexityStats.avgCyclomatic.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="cognitiveComplexity" 
                value={complexityStats.avgCognitive}
              >
                <span className="cursor-help underline decoration-dotted">Avg Cognitive:</span>
              </EnhancedMetricTooltip>
              <span className={`font-mono ${
                complexityStats.avgCognitive > 12 ? 'text-red-600' :
                complexityStats.avgCognitive > 6 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {complexityStats.avgCognitive.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="nestingDepth" 
                value={complexityStats.avgNesting}
              >
                <span className="cursor-help underline decoration-dotted">Avg Nesting:</span>
              </EnhancedMetricTooltip>
              <span className={`font-mono ${
                complexityStats.avgNesting > 3 ? 'text-red-600' :
                complexityStats.avgNesting > 2 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {complexityStats.avgNesting.toFixed(1)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-red-600 font-medium">
                {complexityStats.highComplexityFiles} high-complexity files
              </span>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            ⚡ Performance Impact
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="hasHeavyDependencies" 
                value={performanceStats.heavyDepsCount > 0}
              >
                <span className="cursor-help underline decoration-dotted">Heavy Dependencies:</span>
              </EnhancedMetricTooltip>
              <span className={`font-mono ${
                performanceStats.heavyDepsCount > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {performanceStats.heavyDepsCount}
              </span>
            </div>
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="usesTreeShaking" 
                value={performanceStats.treeShakingCount > totalFiles * 0.7}
              >
                <span className="cursor-help underline decoration-dotted">Tree Shaking:</span>
              </EnhancedMetricTooltip>
              <span className={`font-mono ${
                performanceStats.treeShakingCount > totalFiles * 0.7 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {performanceStats.treeShakingCount}
              </span>
            </div>
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="hasBarrelExports" 
                value={performanceStats.barrelExportsCount > totalFiles * 0.3}
              >
                <span className="cursor-help underline decoration-dotted">Barrel Exports:</span>
              </EnhancedMetricTooltip>
              <span className={`font-mono ${
                performanceStats.barrelExportsCount > totalFiles * 0.3 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {performanceStats.barrelExportsCount}
              </span>
            </div>
            <div className="pt-2 border-t text-xs text-gray-600">
              {Math.round((performanceStats.treeShakingCount / totalFiles) * 100)}% using tree shaking
            </div>
          </div>
        </div>

        {/* Next.js Features */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            ⚛️ Next.js Features
          </h4>
          <div className="space-y-2 text-sm">
            {nextjsStats.serverComponents > 0 && (
              <div className="flex justify-between">
                <EnhancedMetricTooltip 
                  metricKey="usesServerComponents" 
                  value={true}
                >
                  <span className="cursor-help underline decoration-dotted">Server Components:</span>
                </EnhancedMetricTooltip>
                <span className="font-mono text-blue-600">{nextjsStats.serverComponents}</span>
              </div>
            )}
            {nextjsStats.clientComponents > 0 && (
              <div className="flex justify-between">
                <EnhancedMetricTooltip 
                  metricKey="usesClientComponents" 
                  value={true}
                >
                  <span className="cursor-help underline decoration-dotted">Client Components:</span>
                </EnhancedMetricTooltip>
                <span className="font-mono text-purple-600">{nextjsStats.clientComponents}</span>
              </div>
            )}
            {nextjsStats.serverActions > 0 && (
              <div className="flex justify-between">
                <EnhancedMetricTooltip 
                  metricKey="usesServerActions" 
                  value={true}
                >
                  <span className="cursor-help underline decoration-dotted">Server Actions:</span>
                </EnhancedMetricTooltip>
                <span className="font-mono text-indigo-600">{nextjsStats.serverActions}</span>
              </div>
            )}
            {nextjsStats.imageOptimization > 0 && (
              <div className="flex justify-between">
                <EnhancedMetricTooltip 
                  metricKey="usesImageOptimization" 
                  value={true}
                >
                  <span className="cursor-help underline decoration-dotted">Image Optimization:</span>
                </EnhancedMetricTooltip>
                <span className="font-mono text-emerald-600">{nextjsStats.imageOptimization}</span>
              </div>
            )}
            {nextjsStats.dynamicImports > 0 && (
              <div className="flex justify-between">
                <EnhancedMetricTooltip 
                  metricKey="usesDynamicImports" 
                  value={true}
                >
                  <span className="cursor-help underline decoration-dotted">Dynamic Imports:</span>
                </EnhancedMetricTooltip>
                <span className="font-mono text-orange-600">{nextjsStats.dynamicImports}</span>
              </div>
            )}
            {Object.values(nextjsStats).every(count => count === 0) && (
              <div className="text-gray-500 text-xs">No Next.js features detected</div>
            )}
          </div>
        </div>

        {/* Dependencies Overview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            📦 Dependencies
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="externalDependencies" 
                value={allExternalDeps.size}
              >
                <span className="cursor-help underline decoration-dotted">Unique External:</span>
              </EnhancedMetricTooltip>
              <span className="font-mono">{allExternalDeps.size}</span>
            </div>
            <div className="flex justify-between">
              <EnhancedMetricTooltip 
                metricKey="internalDependencies" 
                value={allInternalDeps.size}
              >
                <span className="cursor-help underline decoration-dotted">Internal Imports:</span>
              </EnhancedMetricTooltip>
              <span className="font-mono">{allInternalDeps.size}</span>
            </div>
            {totalCircularDeps > 0 && (
              <div className="flex justify-between">
                <EnhancedMetricTooltip 
                  metricKey="circularDependencies" 
                  value={totalCircularDeps}
                >
                  <span className="cursor-help underline decoration-dotted">Circular Deps:</span>
                </EnhancedMetricTooltip>
                <span className="font-mono text-red-600">{totalCircularDeps}</span>
              </div>
            )}
            <div className="pt-2 border-t text-xs text-gray-600">
              {Math.round((allInternalDeps.size / (allInternalDeps.size + allExternalDeps.size)) * 100)}% internal
            </div>
          </div>
        </div>

        {/* Top Dependencies */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            🏆 Top Dependencies
          </h4>
          <div className="space-y-1 text-sm">
            {topDependencies.slice(0, 5).map(([dep, count]) => (
              <div key={dep} className="flex justify-between">
                <span className="truncate font-mono text-xs">{dep}</span>
                <span className="text-gray-600 ml-2">{count}</span>
              </div>
            ))}
            {topDependencies.length === 0 && (
              <div className="text-gray-500 text-xs">No external dependencies</div>
            )}
          </div>
        </div>

        {/* Quality Score */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            🏅 Quality Score
          </h4>
          <div className="space-y-2 text-sm">
            {(() => {
              // Calculate a quality score based on various factors
              let score = 100;
              
              // Deduct for high complexity
              score -= complexityStats.highComplexityFiles * 5;
              
              // Deduct for heavy dependencies
              score -= performanceStats.heavyDepsCount * 10;
              
              // Deduct for too many barrel exports
              if (performanceStats.barrelExportsCount > totalFiles * 0.5) {
                score -= 15;
              }
              
              // Add points for tree shaking usage
              score += Math.round((performanceStats.treeShakingCount / totalFiles) * 20);
              
              // Add points for Next.js modern features
              const nextjsFeatureCount = Object.values(nextjsStats).reduce((sum, count) => sum + count, 0);
              score += Math.min(nextjsFeatureCount * 2, 10);
              
              score = Math.max(0, Math.min(100, score));
              
              const getScoreColor = (s: number) => {
                if (s >= 80) return 'text-green-600';
                if (s >= 60) return 'text-yellow-600';
                return 'text-red-600';
              };
              
              const getScoreLabel = (s: number) => {
                if (s >= 80) return 'Excellent';
                if (s >= 60) return 'Good';
                if (s >= 40) return 'Fair';
                return 'Needs Improvement';
              };
              
              return (
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <div className={`text-sm ${getScoreColor(score)}`}>
                    {getScoreLabel(score)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Based on complexity, performance, and modern patterns
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}; 