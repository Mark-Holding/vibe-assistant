import Anthropic from '@anthropic-ai/sdk';
import { EntryPointInfo } from '../types/code-analysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface FileWithContent {
  name: string;
  path: string;
  type: string;
  size: number;
  content: string;
}

export interface ClaudeAnalysisRequest {
  files: FileWithContent[];
  projectType?: string;
}

export interface ClaudeAnalysisResponse {
  entryPoints: EntryPointInfo[];
  summary: string;
  confidence: number;
}

// Individual file analysis result
export interface IndividualFileAnalysis {
  functions: {
    name: string;
    line: number;
    purpose: string;
    type: string;
    complexity: 'Low' | 'Medium' | 'High';
  }[];
  components: {
    name: string;
    purpose: string;
    props: string[];
    dependencies: string[];
    usedBy: string[];
  }[];
  algorithms: {
    name: string;
    line: number;
    purpose: string;
    complexity: 'Low' | 'Medium' | 'High';
    implementation: string;
  }[];
  isEntryPoint: boolean;
  entryPointInfo?: {
    type: string;
    purpose: string;
    importance: 'Low' | 'Medium' | 'High' | 'Critical';
  };
  dataFlows: {
    from: string;
    to: string;
    type: string;
    description: string;
  }[];
}

export const analyzeEntryPoints = async (
  request: ClaudeAnalysisRequest
): Promise<ClaudeAnalysisResponse> => {
  try {
    // Filter and prepare file contents for Claude
    const sourceFiles = request.files
      .filter(file => file.path && !file.path.includes('node_modules'))
      .slice(0, 50); // Limit for token management

    console.log(`🔍 Analyzing ${sourceFiles.length} files with Claude...`);

    const prompt = `You are a senior software architect analyzing a codebase. Please analyze these files and identify the key entry points and important modules.

PROJECT FILES:
${sourceFiles.map(file => `
FILE: ${file.path}
TYPE: ${file.type}
SIZE: ${file.size} bytes
CONTENT:
${file.content}
---
`).join('\n')}

Please analyze this codebase and return a JSON response with the following structure:

{
  "entryPoints": [
    {
      "file": "file_path",
      "type": "entry_point_type", // e.g., "Application Root", "API Endpoint", "Landing Page", "Main Component", "Service Entry"
      "purpose": "clear_description_of_purpose",
      "importance": "Critical" | "High" | "Medium" // Based on impact to application
    }
  ],
  "summary": "brief_overview_of_architecture",
  "confidence": 0.85 // 0-1 confidence in analysis
}

Entry point types to consider:
- Application Root: Main app entry points (_app.tsx, main.tsx, index.tsx)
- Landing Page: Homepage or main user entry points  
- API Endpoint: REST/GraphQL endpoints
- Main Component: Core UI components users interact with
- Service Entry: Key business logic or service files
- Configuration: Important config files affecting app behavior
- Database Entry: Database connection or ORM setup files

Focus on files that:
1. Are application entry points (where execution begins)
2. Handle core business logic
3. Manage application state
4. Define main user interfaces
5. Configure critical app behavior
6. Handle external integrations

Return ONLY the JSON response, no other text.`;

    console.log('🤖 Sending request to Claude...');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    console.log('📄 Raw Claude response:', content.text);

    // Parse Claude's JSON response
    const analysisResult = JSON.parse(content.text);
    
    console.log('✅ Parsed Claude analysis:', analysisResult);
    
    return {
      entryPoints: analysisResult.entryPoints || [],
      summary: analysisResult.summary || 'Analysis completed',
      confidence: analysisResult.confidence || 0.7
    };

  } catch (error) {
    console.error('❌ Error analyzing entry points with Claude:', error);
    throw new Error(`Failed to analyze entry points: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// New function for analyzing individual files
export const analyzeIndividualFile = async (
  file: FileWithContent
): Promise<IndividualFileAnalysis> => {
  try {
    console.log(`🔍 Analyzing individual file: ${file.path}`);

    const prompt = `You are a senior software engineer analyzing a single source code file. Please provide a comprehensive analysis of this file.

FILE TO ANALYZE:
Path: ${file.path}
Name: ${file.name}
Type: ${file.type}
Size: ${file.size} bytes

CONTENT:
${file.content}

Please analyze this file and return a JSON response with the following structure:

{
  "functions": [
    {
      "name": "function_name",
      "line": 42, // line number where function is defined
      "purpose": "what this function does",
      "type": "function_type", // e.g., "React Component", "API Handler", "Utility Function", "Hook", "Class Method"
      "complexity": "Low" | "Medium" | "High" // based on cyclomatic complexity and logic
    }
  ],
  "components": [
    {
      "name": "ComponentName",
      "purpose": "what this component does",
      "props": ["prop1", "prop2"], // array of prop names
      "dependencies": ["dependency1", "dependency2"], // imported dependencies
      "usedBy": [] // will be filled by cross-referencing later
    }
  ],
  "algorithms": [
    {
      "name": "algorithm_or_logic_name",
      "line": 15,
      "purpose": "description of the algorithm or complex logic",
      "complexity": "Low" | "Medium" | "High",
      "implementation": "brief description of how it works"
    }
  ],
  "isEntryPoint": true | false, // is this file an entry point?
  "entryPointInfo": { // only if isEntryPoint is true
    "type": "Application Root" | "Landing Page" | "API Endpoint" | "Main Component" | "Service Entry" | "Configuration" | "Database Entry",
    "purpose": "description of what this entry point does",
    "importance": "Critical" | "High" | "Medium" | "Low"
  },
  "dataFlows": [
    {
      "from": "source_component_or_function",
      "to": "destination_component_or_function", 
      "type": "Props" | "State" | "API Call" | "Event" | "Function Call",
      "description": "description of data flow"
    }
  ]
}

Analysis Guidelines:
- For FUNCTIONS: Identify all functions, methods, hooks, and components
- For COMPONENTS: Focus on React components, their props, and what they render
- For ALGORITHMS: Look for complex logic, sorting, searching, data processing, calculations
- For ENTRY POINTS: Determine if this file is a main entry point (pages, API routes, main app files)
- For DATA FLOWS: Identify how data moves within this file (props passing, state updates, API calls)

Return ONLY the JSON response, no other text.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse Claude's JSON response
    const analysisResult = JSON.parse(content.text);
    
    return {
      functions: analysisResult.functions || [],
      components: analysisResult.components || [],
      algorithms: analysisResult.algorithms || [],
      isEntryPoint: analysisResult.isEntryPoint || false,
      entryPointInfo: analysisResult.entryPointInfo,
      dataFlows: analysisResult.dataFlows || []
    };

  } catch (error) {
    console.error(`❌ Error analyzing file ${file.path}:`, error);
    // Return empty analysis rather than throwing - we want to continue with other files
    return {
      functions: [],
      components: [],
      algorithms: [],
      isEntryPoint: false,
      dataFlows: []
    };
  }
};