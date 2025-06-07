import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
  delay?: number;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  maxWidth = '300px',
  delay = 500,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  const [dynamicMaxWidth, setDynamicMaxWidth] = useState(maxWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculateTooltipPosition = useCallback((containerRect: DOMRect, tooltipWidth: number = 300, tooltipHeight: number = 100) => {
    const margin = 20;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Use a more generous height estimate for better positioning
    const safeHeight = Math.max(tooltipHeight, 250); // Assume at least 250px for safety
    
    let top = 0;
    let left = 0;
    let finalPosition = position;
    
    // Calculate available space in each direction
    const spaceAbove = containerRect.top - margin;
    const spaceBelow = viewport.height - containerRect.bottom - margin;
    const spaceLeft = containerRect.left - margin;
    const spaceRight = viewport.width - containerRect.right - margin;
    
    // Determine best position based on available space
    if (position === 'top' && spaceAbove >= safeHeight) {
      finalPosition = 'top';
    } else if (position === 'bottom' && spaceBelow >= safeHeight) {
      finalPosition = 'bottom';
    } else if (position === 'left' && spaceLeft >= tooltipWidth) {
      finalPosition = 'left';
    } else if (position === 'right' && spaceRight >= tooltipWidth) {
      finalPosition = 'right';
    } else {
      // Find the best alternative position
      if (spaceBelow >= safeHeight) {
        finalPosition = 'bottom';
      } else if (spaceAbove >= safeHeight) {
        finalPosition = 'top';
      } else if (spaceRight >= tooltipWidth) {
        finalPosition = 'right';
      } else if (spaceLeft >= tooltipWidth) {
        finalPosition = 'left';
      } else {
        // If nothing fits perfectly, use the position with most space
        const maxVertical = Math.max(spaceAbove, spaceBelow);
        const maxHorizontal = Math.max(spaceLeft, spaceRight);
        
        if (maxVertical >= maxHorizontal) {
          finalPosition = spaceAbove > spaceBelow ? 'top' : 'bottom';
        } else {
          finalPosition = spaceLeft > spaceRight ? 'left' : 'right';
        }
      }
    }
    
    // Calculate position coordinates
    switch (finalPosition) {
      case 'top':
        top = containerRect.top - safeHeight - 10;
        left = containerRect.left + containerRect.width / 2 - tooltipWidth / 2;
        break;
      case 'bottom':
        top = containerRect.bottom + 10;
        left = containerRect.left + containerRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = containerRect.top + containerRect.height / 2 - safeHeight / 2;
        left = containerRect.left - tooltipWidth - 10;
        break;
      case 'right':
        top = containerRect.top + containerRect.height / 2 - safeHeight / 2;
        left = containerRect.right + 10;
        break;
    }
    
    // Final boundary checks and adjustments
    if (left < margin) {
      left = margin;
    } else if (left + tooltipWidth > viewport.width - margin) {
      left = viewport.width - tooltipWidth - margin;
    }
    
    // Ensure tooltip never goes below viewport
    if (top + safeHeight > viewport.height - margin) {
      top = viewport.height - safeHeight - margin;
    }
    
    // Ensure tooltip never goes above viewport
    if (top < margin) {
      top = margin;
    }
    
    return { top, left, position: finalPosition };
  }, [position]);

  const showTooltip = () => {
    if (disabled) return;
    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Check available space to determine if we need wider tooltip
        const viewport = { height: window.innerHeight };
        const maxAvailableHeight = Math.max(
          containerRect.top - 40,                          // Space above
          viewport.height - containerRect.bottom - 40      // Space below
        );
        
        // If we have limited vertical space, make tooltip wider to reduce height
        let adjustedMaxWidth = dynamicMaxWidth;
        if (maxAvailableHeight < 250) {
          // Very limited space, make it wider
          adjustedMaxWidth = Math.min(parseInt(maxWidth) * 2, 600) + 'px';
          setDynamicMaxWidth(adjustedMaxWidth);
        }
        
        // Use estimated dimensions - be more generous with height for positioning
        const estimatedWidth = Math.min(parseInt(adjustedMaxWidth) || 300, 600);
        const estimatedHeight = maxAvailableHeight < 250 ? 200 : 300;
        
        const { top, left, position: calculatedPosition } = calculateTooltipPosition(
          containerRect, 
          estimatedWidth, 
          estimatedHeight
        );
        
        setTooltipPosition({ top, left });
        setActualPosition(calculatedPosition);
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setDynamicMaxWidth(maxWidth);
    setActualPosition(position);
  };

  // Create arrow element
  const getArrow = () => {
    const arrowSize = 6;
    let arrowClasses = 'absolute w-0 h-0 ';
    
    switch (actualPosition) {
      case 'top':
        arrowClasses += 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-gray-900';
        break;
      case 'bottom':
        arrowClasses += 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-gray-900';
        break;
      case 'left':
        arrowClasses += 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-gray-900';
        break;
      case 'right':
        arrowClasses += 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-gray-900';
        break;
    }
    
    const borderWidth = `${arrowSize}px`;
    
    return (
      <div 
        className={arrowClasses}
        style={{
          borderWidth: borderWidth,
        }}
      />
    );
  };

  // Portal tooltip content
  const tooltipContent = isVisible ? (
    <div
      className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        maxWidth: dynamicMaxWidth,
        opacity: 1,
      }}
    >
      {content}
      {getArrow()}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="relative inline-block"
      >
        {children}
      </div>
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}; 