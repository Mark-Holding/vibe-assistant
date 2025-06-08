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
    complexity: 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)' | 'O(n!)';
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
      model: 'claude-3-5-haiku-20241022',
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
      "line": 42, // REQUIRED: line number where function is defined (never null, estimate if needed)
      "purpose": "what this function does",
      "type": "function_type", // Use EXACT classification criteria below
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
      "complexity": "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n²)" | "O(n³)" | "O(2^n)" | "O(n!)",
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
      "from": "actual_component_name_or_FileName > functionName", // USE REAL NAMES from code, not "Parent Component"
      "to": "actual_component_name_or_FileName > functionName", // USE REAL NAMES from code, not "Child Component"
      "type": "Props" | "State" | "API Call" | "Event" | "Function Call" | "Configuration" | "Data" | "Hook" | "Ref" | "Route" | "Storage",
      "description": "description of data flow"
    }
  ]
}

CRITICAL: Use EXACT function type classification based on these criteria:

**"API Handler"** - ONLY for server-side functions that process HTTP requests:
- Functions in /api routes (Next.js API routes)
- Express route handlers (app.get, app.post, etc.)
- Functions with (req, res) parameters
- Server-side request processing functions

**"Event Handler"** - Client-side functions that respond to user interactions:
- onClick, onSubmit, onChange handlers
- ANY function starting with "handle" prefix (handleClick, handleSubmit, handleRemove, etc.) - ALWAYS classify as Event Handler
- React event handling functions
- User interaction response functions
- Remove/delete handlers, form handlers, UI state changers

**"React Component"** - Components that render JSX:
- Functions returning JSX elements
- Functional components with props
- Components using hooks

**"Hook"** - React hooks:
- Functions starting with "use" prefix
- Custom React hooks
- State and effect management functions

**"Utility Function"** - General helper functions:
- Pure functions with calculations
- Data transformation functions
- Helper utilities without UI or events

**"Class Method"** - Methods inside classes:
- Methods defined within class definitions
- Instance or static methods

**"Async Function"** - For complex async operations:
- Database operations, API calls as main purpose
- File system operations
- Complex asynchronous workflows

EXAMPLES:
- "const handleCreateProject = async () => { ... }" → "Event Handler" (handles user action)
- "const handleRemove = (item: string) => { ... }" → "Event Handler" (ANY handle* function)
- "const handleSubmit = () => { ... }" → "Event Handler" (handle* prefix = Event Handler)
- "export default function GET(req, res) { ... }" → "API Handler" (processes HTTP request)
- "function validateEmail(email) { ... }" → "Utility Function" (pure helper)
- "const useAuth = () => { ... }" → "Hook" (custom React hook)

CRITICAL RULES:
1. If function name starts with "handle", it is ALWAYS "Event Handler" regardless of content.
2. ALWAYS provide a valid line number - never use null. If line number is unclear, provide best estimate (e.g., 1, 10, 20).

COMPLEXITY CLASSIFICATION:
- **"Low"**: Simple functions with 1-5 lines, basic conditionals, straightforward logic
- **"Medium"**: Functions with 6-20 lines, multiple conditionals, loops, moderate logic  
- **"High"**: Functions with 20+ lines, nested loops, complex conditionals, multiple responsibilities

ALGORITHMS - Only include if function contains actual algorithmic logic:
- Sorting/filtering algorithms (not simple array.filter)
- Mathematical calculations or formulas
- Complex data transformations with multiple steps
- Search algorithms, tree/graph traversal
- Recursive functions with complex logic
- EXCLUDE: Simple loops, basic array operations, basic conditionals

ALGORITHM COMPLEXITY - Use Big O notation based on actual algorithmic analysis:
- **O(1)**: Constant time - direct access, simple calculations
- **O(log n)**: Logarithmic - binary search, balanced tree operations
- **O(n)**: Linear - single loop through data, linear search
- **O(n log n)**: Log-linear - efficient sorting (merge sort, quick sort average case)
- **O(n²)**: Quadratic - nested loops, bubble sort, simple graph algorithms
- **O(n³)**: Cubic - triple nested loops, matrix multiplication
- **O(2^n)**: Exponential - recursive algorithms with overlapping subproblems
- **O(n!)**: Factorial - permutation generation, traveling salesman brute force

COMPONENTS - React components that render UI:
- Must return JSX/React elements
- Include functional components, class components
- Include HOCs (Higher Order Components) that return components
- EXCLUDE: Utility functions that happen to return JSX

DATA FLOWS - Only include clear, meaningful data movements:
- Props passed between parent/child components
- State updates that affect other functions/components
- API calls that populate component state
- Event data passed to handlers
- EXCLUDE: Internal variable assignments, basic function calls

CRITICAL DATA FLOW NAMING RULES:
- Use ACTUAL component/function names from the code, not generic names
- If actual name isn't clear, use descriptive format: "FileName > ComponentName" or "FileName > functionName"
- NEVER use generic names like "Parent Component", "Child Component", "Main Component"
- Examples of GOOD naming:
  * "UserProfile > handleSubmit" → "AuthForm > validateUser"
  * "route.ts > POST" → "route.ts > GET"
  * "LoginForm" → "UserService > authenticate"
  * "Dashboard > UserCard" → "Header > Navigation"
- Examples of BAD naming (DO NOT USE):
  * "Parent Component" → "Child Component"
  * "Main Component" → "Sub Component"
  * "Container" → "Content"
- Use the ">" symbol to clearly show something is INSIDE a file
- Include file path context when component names alone aren't descriptive enough

ENTRY POINTS - Files that serve as application entry points:
- Next.js pages (pages/*.tsx, app/*.tsx)
- API routes (pages/api/*, app/api/*)
- Main application files (_app.tsx, layout.tsx, main.tsx)
- Root components or configuration files
- EXCLUDE: Regular components, utility files, types

Analysis Guidelines:
- For FUNCTIONS: Focus on HOW the function is USED, not just what it contains
- For COMPONENTS: Must return JSX - if it doesn't render UI, it's not a component
- For ALGORITHMS: Be selective - only include genuine algorithmic logic, not basic operations
- For ENTRY POINTS: Only files that are actual application entry points
- For DATA FLOWS: Only include flows that cross function/component boundaries
- For COMPLEXITY: Use line count + logic complexity as primary indicators

CRITICAL: Return ONLY the JSON response, no other text. No explanations, no markdown, no code blocks, no additional text before or after the JSON. Start your response with { and end with }.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
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

    // Log raw response for debugging
    console.log(`📄 Raw Claude response for ${file.path}:`, content.text.substring(0, 200) + '...');

    // Robust JSON parsing with fallback
    let analysisResult;
    try {
      // Try to extract JSON from response (in case Claude adds extra text)
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content.text;
      
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error(`❌ JSON parse error for ${file.path}:`, parseError);
      console.error(`📄 Full Claude response:`, content.text);
      
      // Return empty analysis instead of throwing
      return {
        functions: [],
        components: [],
        algorithms: [],
        isEntryPoint: false,
        dataFlows: []
      };
    }
    
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