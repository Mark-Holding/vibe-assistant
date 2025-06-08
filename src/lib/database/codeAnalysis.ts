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
  complexity: 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)' | 'O(n!)';
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
    
    // Remove duplicates based on the unique constraint (file_id, name, line_number)
    const uniqueFunctions = functions.reduce((acc, func) => {
      const key = `${func.file_id}-${func.name}-${func.line_number}`;
      if (!acc.has(key)) {
        acc.set(key, func);
      } else {
        // If duplicate, keep the one with more detailed purpose
        const existing = acc.get(key)!;
        if (func.purpose.length > existing.purpose.length) {
          acc.set(key, func);
        }
      }
      return acc;
    }, new Map<string, FunctionAnalysis>());
    
    const deduplicatedFunctions = Array.from(uniqueFunctions.values());
    
    if (deduplicatedFunctions.length === 0) return;
    
    console.log(`💾 Saving ${deduplicatedFunctions.length} unique functions (removed ${functions.length - deduplicatedFunctions.length} duplicates)`);
    
    const { error } = await supabase
      .from('function_analysis')
      .upsert(deduplicatedFunctions, { 
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
      .select(`
        *,
        files!inner(name, relative_path)
      `)
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
    
    // Remove duplicates based on the unique constraint (file_id, name)
    const uniqueComponents = components.reduce((acc, comp) => {
      const key = `${comp.file_id}-${comp.name}`;
      if (!acc.has(key)) {
        acc.set(key, comp);
      } else {
        // If duplicate, keep the one with more detailed purpose or more props
        const existing = acc.get(key)!;
        if (comp.purpose.length > existing.purpose.length || comp.props.length > existing.props.length) {
          acc.set(key, comp);
        }
      }
      return acc;
    }, new Map<string, ComponentAnalysis>());
    
    const deduplicatedComponents = Array.from(uniqueComponents.values());
    
    if (deduplicatedComponents.length === 0) return;
    
    console.log(`💾 Saving ${deduplicatedComponents.length} unique components (removed ${components.length - deduplicatedComponents.length} duplicates)`);
    
    const { error } = await supabase
      .from('component_analysis')
      .upsert(deduplicatedComponents, { 
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
      .select(`
        *,
        files!inner(name, relative_path)
      `)
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
    
    // Remove duplicates based on the unique constraint (file_id, name, line_number)
    const uniqueAlgorithms = algorithms.reduce((acc, algo) => {
      const key = `${algo.file_id}-${algo.name}-${algo.line_number}`;
      if (!acc.has(key)) {
        acc.set(key, algo);
      } else {
        // If duplicate, keep the one with more detailed implementation
        const existing = acc.get(key)!;
        if (algo.implementation.length > existing.implementation.length) {
          acc.set(key, algo);
        }
      }
      return acc;
    }, new Map<string, AlgorithmAnalysis>());
    
    const deduplicatedAlgorithms = Array.from(uniqueAlgorithms.values());
    
    if (deduplicatedAlgorithms.length === 0) return;
    
    console.log(`💾 Saving ${deduplicatedAlgorithms.length} unique algorithms (removed ${algorithms.length - deduplicatedAlgorithms.length} duplicates)`);
    
    const { error } = await supabase
      .from('algorithm_analysis')
      .upsert(deduplicatedAlgorithms, { 
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
      .select(`
        *,
        files!inner(name, relative_path)
      `)
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
    
    // Remove duplicates based on the unique constraint (project_id, from_component, to_component)
    const uniqueFlows = dataFlows.reduce((acc, flow) => {
      const key = `${flow.project_id}-${flow.from_component}-${flow.to_component}`;
      if (!acc.has(key)) {
        acc.set(key, flow);
      } else {
        // If duplicate, keep the one with more detailed description
        const existing = acc.get(key)!;
        if (flow.description.length > existing.description.length) {
          acc.set(key, flow);
        }
      }
      return acc;
    }, new Map<string, DataFlowAnalysis>());
    
    const deduplicatedFlows = Array.from(uniqueFlows.values());
    
    if (deduplicatedFlows.length === 0) return;
    
    console.log(`💾 Saving ${deduplicatedFlows.length} unique data flows (removed ${dataFlows.length - deduplicatedFlows.length} duplicates)`);
    
    const { error } = await supabase
      .from('data_flow_analysis')
      .upsert(deduplicatedFlows, { 
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
      'entry_point_analysis',
      // Design system tables
      'colors',
      'typography',
      'spacing',
      'component_styles'
    ];

    console.log(`🗑️ Clearing analysis data for project ${projectId}`);

    await Promise.all(
      tables.map(table => 
        supabase.from(table).delete().eq('project_id', projectId)
      )
    );

    console.log(`✅ Cleared all analysis data for project ${projectId}`);
  }
}; 