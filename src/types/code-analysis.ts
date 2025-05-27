export interface FunctionInfo {
  name: string;
  file: string;
  line: number;
  purpose: string;
  type: string;
  complexity: string;
}

export interface ComponentInfo {
  name: string;
  file: string;
  purpose: string;
  props: string[];
  dependencies: string[];
  usedBy: string[];
}

export interface AlgorithmInfo {
  name: string;
  file: string;
  line: number;
  purpose: string;
  complexity: string;
  implementation: string;
}

export interface DataFlowInfo {
  from: string;
  to: string;
  type: string;
  description: string;
}

export interface EntryPointInfo {
  file: string;
  type: string;
  purpose: string;
  importance: string;
}

export interface CodeAnalysisTabProps {
  files: Array<{
    name: string;
    path: string;
    type: string;
    size: number;
    file: File;
  }>;
} 