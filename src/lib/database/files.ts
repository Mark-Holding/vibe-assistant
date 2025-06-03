import { supabase } from '../supabase'
import { FileData } from '../../types/code-analyzer'
import { categorizeByAST } from '../../components/code-analyzer/architecture-map'
import { analyzeEnhancedMetrics, EnhancedMetrics } from '../../utils/enhancedMetricsAnalyzer'
import * as babel from '@babel/parser'
import traverse from '@babel/traverse'

// Create a simple hash function for browser environment
function createHash(content: string): string {
  let hash = 0;
  if (content.length === 0) return hash.toString();
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export const fileService = {
  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .limit(1)

      if (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection error:', error);
      return false;
    }
  },

  // Check if file has changed (by hash)
  async hasFileChanged(projectId: string, relativePath: string, contentHash: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking file changes for: ${relativePath}`);
      console.log(`   Project ID: ${projectId}`);
      console.log(`   Content Hash: ${contentHash}`);
      
      // Normalize the path to ensure consistent comparison
      const normalizedPath = relativePath.replace(/\\/g, '/');
      
      const { data, error } = await supabase
        .from('files')
        .select('content_hash')
        .eq('project_id', projectId)
        .eq('relative_path', normalizedPath)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no rows found

      if (error) {
        console.log(`   Database error code: ${error.code}`);
        console.log(`   Database error message: ${error.message}`);
        console.log(`   Database error details:`, error.details);
        console.log(`   Database error hint:`, error.hint);
        
        console.warn(`❌ Database query failed for ${relativePath}:`, error);
        // Return true to process the file anyway
        return true;
      }
      
      if (!data) {
        console.log(`   File not found in database, treating as changed`);
        return true; // File doesn't exist, so it's "changed"
      }
      
      const hasChanged = data.content_hash !== contentHash;
      console.log(`   File ${hasChanged ? 'has changed' : 'unchanged'} (DB: ${data.content_hash}, New: ${contentHash})`);
      return hasChanged;
    } catch (error) {
      console.warn(`💥 Error checking file changes for ${relativePath}:`, error);
      // Return true to process the file anyway
      return true;
    }
  },

  // Analyze and save files to database
  async analyzeAndSaveFiles(projectId: string, files: FileData[]): Promise<void> {
    console.log(`🔍 Starting analysis of ${files.length} files for project ${projectId}`);
    
    const filesToProcess: any[] = []
    const fileContents: any[] = []

    for (const file of files) {
      try {
        const content = await file.file.text()
        const contentHash = createHash(content)
        
        // Normalize paths to ensure consistency
        const normalizedPath = file.path.replace(/\\/g, '/');
        
        // Check if file has changed (with error handling)
        const hasChanged = await this.hasFileChanged(projectId, normalizedPath, contentHash)
        if (!hasChanged) {
          console.log(`⏭️ Skipping unchanged file: ${normalizedPath}`)
          continue
        }

        console.log(`📝 Processing file: ${normalizedPath}`)
        // Analyze file content
        const analysis = await this.analyzeFileContent(content, normalizedPath)
        
        const fileData = {
          project_id: projectId,
          name: file.name,
          path: normalizedPath,
          relative_path: normalizedPath,
          size_bytes: file.size,
          file_type: file.type,
          extension: file.name.split('.').pop() || '',
          content_hash: contentHash,
          last_modified: file.lastModified ? file.lastModified.toISOString() : new Date().toISOString(),
          category: analysis.category,
          importance_score: analysis.importance,
          lines_of_code: analysis.linesOfCode,
          function_count: analysis.functionCount,
          component_count: analysis.componentCount,
          import_count: analysis.importCount,
          export_count: analysis.exportCount,
          comment_count: analysis.commentCount,
          is_entry_point: analysis.isEntryPoint,
          is_test_file: analysis.isTestFile,
          is_config_file: analysis.isConfigFile,
          // Enhanced metrics - Performance indicators
          has_heavy_dependencies: analysis.enhancedMetrics.bundleImpact.hasHeavyDependencies,
          uses_tree_shaking: analysis.enhancedMetrics.bundleImpact.usesTreeShaking,
          has_barrel_exports: analysis.enhancedMetrics.bundleImpact.hasBarrelExports,
          // Enhanced metrics - Code quality
          cyclomatic_complexity: analysis.enhancedMetrics.complexity.cyclomaticComplexity,
          cognitive_complexity: analysis.enhancedMetrics.complexity.cognitiveComplexity,
          nesting_depth: analysis.enhancedMetrics.complexity.nestingDepth,
          // Enhanced metrics - Next.js features
          uses_server_components: analysis.enhancedMetrics.nextjsFeatures.usesServerComponents,
          uses_client_components: analysis.enhancedMetrics.nextjsFeatures.usesClientComponents,
          uses_server_actions: analysis.enhancedMetrics.nextjsFeatures.usesServerActions,
          uses_image_optimization: analysis.enhancedMetrics.nextjsFeatures.usesImageOptimization,
          uses_dynamic_imports: analysis.enhancedMetrics.nextjsFeatures.usesDynamicImports,
          // Enhanced metrics - Dependencies (stored as JSONB)
          internal_dependencies: JSON.stringify(analysis.enhancedMetrics.dependencies.internal),
          external_dependencies: JSON.stringify(analysis.enhancedMetrics.dependencies.external),
          circular_dependencies: JSON.stringify(analysis.enhancedMetrics.dependencies.circular),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        filesToProcess.push(fileData)
        fileContents.push({
          content: content,
          relative_path: normalizedPath
        })

      } catch (error) {
        console.error(`Error processing file ${file.path}:`, error)
      }
    }

    if (filesToProcess.length === 0) {
      console.log('No files to process')
      return
    }

    // Insert/update files in batches
    console.log(`💾 Upserting ${filesToProcess.length} files to database...`);
    console.log('Sample file data:', JSON.stringify(filesToProcess[0], null, 2));
    
    const { data: insertedFiles, error: filesError } = await supabase
      .from('files')
      .upsert(filesToProcess, { 
        onConflict: 'project_id,relative_path',
        ignoreDuplicates: false 
      })
      .select('id, relative_path')

    if (filesError) {
      console.error('❌ Files upsert error:', filesError);
      console.error('   Error code:', filesError.code);
      console.error('   Error message:', filesError.message);
      console.error('   Error details:', filesError.details);
      console.error('   Error hint:', filesError.hint);
      throw filesError;
    }

    console.log(`✅ Successfully upserted ${insertedFiles?.length || 0} files`);

    // Insert file contents
    const contentInserts = insertedFiles?.map((file, index) => ({
      file_id: file.id,
      content: fileContents.find(fc => fc.relative_path === file.relative_path)?.content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) || []

    if (contentInserts.length > 0) {
      console.log(`💾 Upserting ${contentInserts.length} file contents...`);
      console.log('Sample content data:', {
        file_id: contentInserts[0].file_id,
        content_length: contentInserts[0].content.length,
        created_at: contentInserts[0].created_at
      });
      
      const { error: contentError } = await supabase
        .from('file_contents')
        .upsert(contentInserts, { onConflict: 'file_id' })

      if (contentError) {
        console.error('❌ File contents upsert error:', contentError);
        console.error('   Error code:', contentError.code);
        console.error('   Error message:', contentError.message);
        console.error('   Error details:', contentError.details);
        console.error('   Error hint:', contentError.hint);
        throw contentError;
      }
      
      console.log(`✅ Successfully upserted ${contentInserts.length} file contents`);
    }

    console.log(`Successfully processed ${filesToProcess.length} files`)
  },

  // Analyze individual file content
  async analyzeFileContent(content: string, filePath: string): Promise<{
    category: string
    importance: number
    linesOfCode: number
    functionCount: number
    componentCount: number
    importCount: number
    exportCount: number
    commentCount: number
    isEntryPoint: boolean
    isTestFile: boolean
    isConfigFile: boolean
    // Enhanced metrics
    enhancedMetrics: EnhancedMetrics
  }> {
    const { category, importance } = categorizeByAST(content, filePath)
    
    // Run enhanced metrics analysis
    const enhancedMetrics = analyzeEnhancedMetrics(content, filePath)
    
    let functionCount = 0
    let componentCount = 0
    let importCount = 0
    let exportCount = 0
    let commentCount = 0

    // Count lines of code (excluding empty lines and comments)
    const lines = content.split('\n')
    const linesOfCode = lines.filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*')
    }).length

    // Count comments
    commentCount = lines.filter(line => {
      const trimmed = line.trim()
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.includes('*/')
    }).length

    // Skip Babel parsing for non-JavaScript files
    const filename = filePath.toLowerCase()
    const actualFilename = filePath.split('/').pop()?.toLowerCase() || '';
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
      actualFilename === '.gitattributes' ||
      actualFilename.endsWith('.json'); // JSON files shouldn't be parsed with Babel

    // Parse with Babel for detailed analysis (only for JS/TS files)
    if (!shouldSkipBabelParsing) {
      try {
        const ast = babel.parse(content, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx', 'decorators-legacy']
        })

        traverse(ast, {
          // Count functions
          FunctionDeclaration() { functionCount++ },
          ArrowFunctionExpression() { functionCount++ },
          FunctionExpression() { functionCount++ },
          ClassMethod() { functionCount++ },
          ObjectMethod() { functionCount++ },

          // Count React components
          JSXElement() { componentCount++ },

          // Count imports
          ImportDeclaration() { importCount++ },

          // Count exports
          ExportDefaultDeclaration() { exportCount++ },
          ExportNamedDeclaration() { exportCount++ }
        })
      } catch (error) {
        console.warn(`Could not parse ${filePath} with Babel:`, error)
      }
    } else {
      console.log('Skipping Babel parsing for non-JS file:', filePath)
    }

    // Determine file characteristics
    const fileName = filePath.toLowerCase()
    const isEntryPoint = fileName.includes('index') || fileName.includes('main') || fileName.includes('app')
    const isTestFile = fileName.includes('test') || fileName.includes('spec') || fileName.includes('.test.') || fileName.includes('.spec.')
    const isConfigFile = fileName.includes('config') || fileName.endsWith('.json') || fileName.includes('setting')

    return {
      category,
      importance,
      linesOfCode,
      functionCount,
      componentCount,
      importCount,
      exportCount,
      commentCount,
      isEntryPoint,
      isTestFile,
      isConfigFile,
      enhancedMetrics
    }
  },

  // Get files for a project
  async getProjectFiles(projectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .order('relative_path')

    if (error) throw error
    return data || []
  },

  // Get file content
  async getFileContent(fileId: string): Promise<string> {
    const { data, error } = await supabase
      .from('file_contents')
      .select('content')
      .eq('file_id', fileId)
      .single()

    if (error) throw error
    return data?.content || ''
  }
} 