import React, { useState, useEffect } from 'react';
import EntryPointsSection from './EntryPointsSection';
import FunctionsAnalysisSection from './FunctionsAnalysisSection';
import ComponentsAnalysisSection from './ComponentsAnalysisSection';
import AlgorithmsSection from './AlgorithmsSection';
import DataFlowSection from './DataFlowSection';
import { Code } from 'lucide-react';
import {
  FunctionInfo,
  ComponentInfo,
  AlgorithmInfo,
  DataFlowInfo,
  EntryPointInfo,
  CodeAnalysisTabProps
} from '../../../types/code-analysis';

const CodeAnalysisTab: React.FC<CodeAnalysisTabProps> = ({ files }) => {
  const [functions, setFunctions] = useState<FunctionInfo[]>([]);
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([]);
  const [dataFlow, setDataFlow] = useState<DataFlowInfo[]>([]);
  const [entryPoints, setEntryPoints] = useState<EntryPointInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dummy extraction logic (keep for now)
  useEffect(() => {
    if (files.length === 0) {
      setFunctions([]);
      setComponents([]);
      setAlgorithms([]);
      setDataFlow([]);
      setEntryPoints([]);
      return;
    }
    setIsLoading(true);
    // Dummy data for now
    setTimeout(() => {
      setFunctions([
        {
          name: 'handleSubmit', file: 'src/components/Form.tsx', line: 42, purpose: 'Handles form submission', type: 'Async Function', complexity: 'Medium'
        },
        {
          name: 'fetchData', file: 'src/utils/api.ts', line: 10, purpose: 'Fetches data from API', type: 'Async Function', complexity: 'Low'
        },
        {
          name: 'validateEmail', file: 'src/utils/validation.ts', line: 5, purpose: 'Validates email input', type: 'Function Declaration', complexity: 'Low'
        },
        {
          name: 'updateProfile', file: 'src/services/userService.ts', line: 27, purpose: 'Updates user profile data', type: 'Async Function', complexity: 'High'
        }
      ]);
      setComponents([
        {
          name: 'Header', file: 'src/components/Header.tsx', purpose: 'Navigation header with menu items', props: ['title', 'onLogout'], dependencies: ['Logo', 'NavMenu'], usedBy: ['App']
        },
        {
          name: 'Footer', file: 'src/components/Footer.tsx', purpose: 'Page footer with links', props: ['year'], dependencies: [], usedBy: ['App']
        },
        {
          name: 'UserCard', file: 'src/components/UserCard.tsx', purpose: 'Displays user profile information', props: ['user'], dependencies: ['Avatar'], usedBy: ['Dashboard']
        }
      ]);
      setAlgorithms([
        {
          name: 'Search Algorithm', file: 'src/utils/search.ts', line: 15, purpose: 'Implements efficient search', complexity: 'O(n log n)', implementation: 'Uses binary search'
        },
        {
          name: 'Sort Algorithm', file: 'src/utils/sort.ts', line: 8, purpose: 'Sorts data for display', complexity: 'O(n^2)', implementation: 'Implements bubble sort for demonstration'
        },
        {
          name: 'Debounce Function', file: 'src/utils/debounce.ts', line: 3, purpose: 'Limits function execution rate', complexity: 'O(1)', implementation: 'Uses setTimeout and clearTimeout'
        }
      ]);
      setDataFlow([
        {
          from: 'User Input', to: 'Form Handler', type: 'Event Flow', description: 'User interactions trigger form validation'
        },
        {
          from: 'API Service', to: 'Component State', type: 'Data Flow', description: 'External data updates component display state'
        },
        {
          from: 'Auth Service', to: 'User Context', type: 'Context Flow', description: 'Authentication state updates user context'
        },
        {
          from: 'Database', to: 'API Service', type: 'Backend Flow', description: 'Database changes propagate to API responses'
        }
      ]);
      setEntryPoints([
        {
          file: 'src/pages/_app.tsx', type: 'Application Root', purpose: 'Main application wrapper', importance: 'Critical'
        },
        {
          file: 'src/pages/index.tsx', type: 'Landing Page', purpose: 'Homepage entry point', importance: 'High'
        },
        {
          file: 'src/pages/api/auth.ts', type: 'API Endpoint', purpose: 'Handles authentication requests', importance: 'High'
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, [files]);

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

  return (
    <div className="space-y-6">
      <EntryPointsSection entryPoints={entryPoints} />
      <FunctionsAnalysisSection functions={functions} isLoading={isLoading} />
      <ComponentsAnalysisSection components={components} />
      <AlgorithmsSection algorithms={algorithms} />
      <DataFlowSection dataFlow={dataFlow} />
    </div>
  );
};

export default CodeAnalysisTab; 