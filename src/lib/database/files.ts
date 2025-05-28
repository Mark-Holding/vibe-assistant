import { supabase } from '../supabase'
import { FileData } from '../../types/code-analyzer'
import { categorizeByAST } from '../../components/code-analyzer/architecture-map'
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
  // Check if file has changed (by hash)
  async hasFileChanged(projectId: string, relativePath: string, contentHash: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('files')
      .select('content_hash')
      .eq('project_id', projectId)
      .eq('relative_path', relativePath)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return true // File doesn't exist, so it's "changed"
    
    return data.content_hash !== contentHash
  },

  // Analyze and save files to database
  async analyzeAndSaveFiles(projectId: string, files: FileData[]): Promise<void> {
    const filesToProcess: any[] = []
    const fileContents: any[] = []

    for (const file of files) {
      try {
        const content = await file.file.text()
        const contentHash = createHash(content)
        
        // Check if file has changed
        const hasChanged = await this.hasFileChanged(projectId, file.path, contentHash)
        if (!hasChanged) {
          console.log(`Skipping unchanged file: ${file.path}`)
          continue
        }

        // Analyze file content
        const analysis = await this.analyzeFileContent(content, file.path)
        
        const fileData = {
          project_id: projectId,
          name: file.name,
          path: file.path,
          relative_path: file.path,
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        filesToProcess.push(fileData)
        fileContents.push({
          content: content,
          relative_path: file.path
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
    const { data: insertedFiles, error: filesError } = await supabase
      .from('files')
      .upsert(filesToProcess, { 
        onConflict: 'project_id,relative_path',
        ignoreDuplicates: false 
      })
      .select('id, relative_path')

    if (filesError) throw filesError

    // Insert file contents
    const contentInserts = insertedFiles?.map((file, index) => ({
      file_id: file.id,
      content: fileContents.find(fc => fc.relative_path === file.relative_path)?.content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) || []

    if (contentInserts.length > 0) {
      const { error: contentError } = await supabase
        .from('file_contents')
        .upsert(contentInserts, { onConflict: 'file_id' })

      if (contentError) throw contentError
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
  }> {
    const { category, importance } = categorizeByAST(content, filePath)
    
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

    // Parse with Babel for detailed analysis
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
      isConfigFile
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