import React from 'react';
import { Tooltip } from './Tooltip';
import { ENHANCED_METRICS_DESCRIPTIONS, MetricDescription } from '../../constants/enhancedMetricsDescriptions';

interface EnhancedMetricTooltipProps {
  metricKey: string;
  value: number | boolean;
  children: React.ReactNode;
}

function getInterpretationLevel(description: MetricDescription, value: number | boolean): 'good' | 'warning' | 'bad' {
  if (typeof value === 'boolean') {
    if (description.thresholds.good === value) return 'good';
    if (description.thresholds.warning === value) return 'warning';
    return 'bad';
  }
  
  if (typeof value === 'number') {
    // For numeric values, check thresholds
    const numericValue = value as number;
    const goodThreshold = description.thresholds.good as number;
    const warningThreshold = description.thresholds.warning as number;
    const badThreshold = description.thresholds.bad as number;
    
    // Handle different threshold patterns
    if (goodThreshold < warningThreshold) {
      // Ascending pattern (lower is better)
      if (numericValue <= goodThreshold) return 'good';
      if (numericValue <= warningThreshold) return 'warning';
      return 'bad';
    } else {
      // Descending pattern (higher is better)
      if (numericValue >= goodThreshold) return 'good';
      if (numericValue >= warningThreshold) return 'warning';
      return 'bad';
    }
  }
  
  return 'warning';
}

function getLevelColor(level: 'good' | 'warning' | 'bad'): string {
  switch (level) {
    case 'good': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'bad': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

function getLevelIcon(level: 'good' | 'warning' | 'bad'): string {
  switch (level) {
    case 'good': return '✅';
    case 'warning': return '⚠️';
    case 'bad': return '❌';
    default: return 'ℹ️';
  }
}

export const EnhancedMetricTooltip: React.FC<EnhancedMetricTooltipProps> = ({
  metricKey,
  value,
  children
}) => {
  const description = ENHANCED_METRICS_DESCRIPTIONS[metricKey];
  
  if (!description) {
    return <>{children}</>;
  }
  
  const level = getInterpretationLevel(description, value);
  const levelColor = getLevelColor(level);
  const levelIcon = getLevelIcon(level);
  
  const content = (
    <div className="max-w-xs">
      {/* Header */}
      <div className="flex items-center mb-2">
        <span className="mr-2">{levelIcon}</span>
        <h4 className="font-semibold text-gray-900">{description.title}</h4>
      </div>
      
      {/* Current Value */}
      <div className="mb-3 p-2 bg-gray-50 rounded">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Value:</span>
          <span className={`font-mono font-semibold ${levelColor}`}>
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
          </span>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
        {description.description}
      </p>
      
      {/* Current Interpretation */}
      <div className="mb-3 p-2 rounded" style={{ backgroundColor: level === 'good' ? '#f0fdf4' : level === 'warning' ? '#fffbeb' : '#fef2f2' }}>
        <div className={`text-sm font-medium ${levelColor}`}>
          {description.interpretation[level]}
        </div>
      </div>
      
      {/* Thresholds */}
      {typeof value === 'number' && (
        <div className="mb-3">
          <div className="text-xs font-medium text-gray-600 mb-1">Thresholds:</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-green-600">Good:</span>
              <span className="font-mono">≤ {description.thresholds.good}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">Warning:</span>
              <span className="font-mono">≤ {description.thresholds.warning}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Bad:</span>
              <span className="font-mono">&gt; {description.thresholds.warning}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Examples */}
      {description.examples && description.examples.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">Examples:</div>
          <ul className="text-xs text-gray-600 space-y-1">
            {description.examples.map((example, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1 text-gray-400">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  
  return (
    <Tooltip content={content}>
      {children}
    </Tooltip>
  );
}; 