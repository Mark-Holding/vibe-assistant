import { supabase } from '../supabase';

export interface FunctionAnalysis {
  id?: string;
  file_id: string;
  project_id: string;
  name: string;
  line_number: number;
  purpose: string;
  function_type: string;
  complexity: 'Low' | 'Medium' | 'High';
  created_at?: string;
}

export interface ComponentAnalysis {
  id?: string;
  file_id: string;
  project_id: string;
  name: string;
  purpose: string;
  props: string[];
  dependencies: string[];
  used_by: string[];
  created_at?: string;
}

export interface AlgorithmAnalysis {
  id?: string;
  file_id: string;
  project_id: string;
  name: string;
  line_number: number;
  purpose: string;
  complexity: 'Low' | 'Medium' | 'High';
  implementation: string;
  created_at?: string;
}

export interface DataFlowAnalysis {
  id?: string;
  project_id: string;
  from_component: string;
  to_component: string;
  flow_type: string;
  description: string;
  created_at?: string;
}

export interface EntryPointAnalysis {
  id?: string;
  file_id: string;
  project_id: string;
  entry_type: string;
  purpose: string;
  importance: 'Low' | 'Medium' | 'High' | 'Critical';
  created_at?: string;
}

export const codeAnalysisService = {
  // Functions Analysis
  async saveFunctionAnalysis(functions: FunctionAnalysis[]): Promise<void> {
    if (functions.length === 0) return;
    
    const { error } = await supabase
      .from('function_analysis')
      .upsert(functions, { 
        onConflict: 'file_id,name,line_number',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving function analysis:', error);
      throw error;
    }
  },

  async getFunctionAnalysis(projectId: string): Promise<FunctionAnalysis[]> {
    const { data, error } = await supabase
      .from('function_analysis')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    
    if (error) {
      console.error('Error fetching function analysis:', error);
      throw error;
    }
    
    return data || [];
  },

  // Components Analysis
  async saveComponentAnalysis(components: ComponentAnalysis[]): Promise<void> {
    if (components.length === 0) return;
    
    const { error } = await supabase
      .from('component_analysis')
      .upsert(components, { 
        onConflict: 'file_id,name',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving component analysis:', error);
      throw error;
    }
  },

  async getComponentAnalysis(projectId: string): Promise<ComponentAnalysis[]> {
    const { data, error } = await supabase
      .from('component_analysis')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    
    if (error) {
      console.error('Error fetching component analysis:', error);
      throw error;
    }
    
    return data || [];
  },

  // Algorithms Analysis
  async saveAlgorithmAnalysis(algorithms: AlgorithmAnalysis[]): Promise<void> {
    if (algorithms.length === 0) return;
    
    const { error } = await supabase
      .from('algorithm_analysis')
      .upsert(algorithms, { 
        onConflict: 'file_id,name,line_number',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving algorithm analysis:', error);
      throw error;
    }
  },

  async getAlgorithmAnalysis(projectId: string): Promise<AlgorithmAnalysis[]> {
    const { data, error } = await supabase
      .from('algorithm_analysis')
      .select('*')
      .eq('project_id', projectId)
      .order('name');
    
    if (error) {
      console.error('Error fetching algorithm analysis:', error);
      throw error;
    }
    
    return data || [];
  },

  // Data Flow Analysis
  async saveDataFlowAnalysis(dataFlows: DataFlowAnalysis[]): Promise<void> {
    if (dataFlows.length === 0) return;
    
    const { error } = await supabase
      .from('data_flow_analysis')
      .upsert(dataFlows, { 
        onConflict: 'project_id,from_component,to_component',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving data flow analysis:', error);
      throw error;
    }
  },

  async getDataFlowAnalysis(projectId: string): Promise<DataFlowAnalysis[]> {
    const { data, error } = await supabase
      .from('data_flow_analysis')
      .select('*')
      .eq('project_id', projectId)
      .order('from_component');
    
    if (error) {
      console.error('Error fetching data flow analysis:', error);
      throw error;
    }
    
    return data || [];
  },

  // Entry Points Analysis
  async saveEntryPointAnalysis(entryPoints: EntryPointAnalysis[]): Promise<void> {
    if (entryPoints.length === 0) return;
    
    const { error } = await supabase
      .from('entry_point_analysis')
      .upsert(entryPoints, { 
        onConflict: 'file_id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error('Error saving entry point analysis:', error);
      throw error;
    }
  },

  async getEntryPointAnalysis(projectId: string): Promise<EntryPointAnalysis[]> {
    const { data, error } = await supabase
      .from('entry_point_analysis')
      .select(`
        *,
        files!inner(name, relative_path)
      `)
      .eq('project_id', projectId)
      .order('importance', { ascending: false });
    
    if (error) {
      console.error('Error fetching entry point analysis:', error);
      throw error;
    }
    
    return data || [];
  },

  // Clear all analysis for a project (useful for re-analysis)
  async clearProjectAnalysis(projectId: string): Promise<void> {
    const tables = [
      'function_analysis',
      'component_analysis', 
      'algorithm_analysis',
      'data_flow_analysis',
      'entry_point_analysis'
    ];

    await Promise.all(
      tables.map(table => 
        supabase.from(table).delete().eq('project_id', projectId)
      )
    );
  }
}; 