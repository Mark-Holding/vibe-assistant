import { supabase } from '../supabase'

export interface Project {
  id: string
  name: string
  description?: string
  repository_url?: string
  main_branch?: string
  last_analyzed_at?: string
  total_files: number
  total_loc: number
  total_functions: number
  total_components: number
  created_at: string
  updated_at: string
}

export interface DatabaseFile {
  id: string
  project_id: string
  name: string
  path: string
  relative_path: string
  size_bytes: number
  file_type: string
  extension: string
  content_hash: string
  last_modified: string
  category?: string
  importance_score: number
  lines_of_code: number
  function_count: number
  component_count: number
  import_count: number
  export_count: number
  comment_count: number
  is_entry_point: boolean
  is_test_file: boolean
  is_config_file: boolean
  created_at: string
  updated_at: string
}

export const projectService = {
  // Create a new project
  async createProject(projectData: {
    name: string
    description?: string
    repository_url?: string
  }): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all projects
  async getProjects(): Promise<Project[]> {
    console.log('🔍 Querying projects table...');
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ Database error in getProjects:', error);
      throw error;
    }
    
    console.log('✅ Projects query successful, found:', data?.length || 0, 'projects');
    return data || []
  },

  // Get project by ID
  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  // Update project stats after analysis
  async updateProjectStats(projectId: string, stats: {
    total_files: number
    total_loc: number
    total_functions: number
    total_components: number
  }): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({
        ...stats,
        last_analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) throw error
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 