import React from 'react';
import { Tooltip } from './Tooltip';
import { getFileTypeDescription, FileTypeDescription } from '../../constants/fileTypeDescriptions';

interface FileTypeTooltipProps {
  fileType: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TooltipContent: React.FC<{ description: FileTypeDescription }> = ({ description }) => (
  <div className="text-left">
    <div className="font-semibold text-white mb-2">{description.title}</div>
    <div className="text-gray-200 mb-3 leading-relaxed">{description.description}</div>
    
    <div className="mb-2">
      <div className="font-medium text-gray-300 mb-1">Examples:</div>
      <div className="text-xs font-mono text-gray-300">
        {description.examples.slice(0, 3).map((example, index) => (
          <div key={index} className="mb-1">• {example}</div>
        ))}
      </div>
    </div>
    
    <div className="pt-2 border-t border-gray-600">
      <div className="text-xs text-gray-400">
        <span className="font-medium">Importance:</span> {description.importance}
      </div>
    </div>
  </div>
);

export const FileTypeTooltip: React.FC<FileTypeTooltipProps> = ({
  fileType,
  children,
  position = 'top'
}) => {
  const description = getFileTypeDescription(fileType);
  
  if (!description) {
    // Fallback for missing descriptions
    const fallbackDescription: FileTypeDescription = {
      category: fileType,
      title: fileType,
      description: `Files categorized as ${fileType} type.`,
      examples: [`Example ${fileType.toLowerCase()} file`],
      importance: 'Varies based on file purpose'
    };
    
    return (
      <Tooltip
        content={<TooltipContent description={fallbackDescription} />}
        position={position}
        maxWidth="400px"
        delay={300}
      >
        {children}
      </Tooltip>
    );
  }

  return (
    <Tooltip
      content={<TooltipContent description={description} />}
      position={position}
      maxWidth="400px"
      delay={300}
    >
      {children}
    </Tooltip>
  );
}; 