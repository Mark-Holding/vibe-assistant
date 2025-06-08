import { analyzeIndividualFile, FileWithContent } from '../claude';
import { codeAnalysisService } from '../database/codeAnalysis';
import { fileService } from '../database/files';
import { designSystemService } from '../database/designSystem';
import { analyzeDesignSystem } from './designSystemExtractor';

export interface AnalysisProgress {
  totalFiles: number;
  completedFiles: number;
  currentFile: string | null;
  isComplete: boolean;
  errors: string[];
}

export class AsyncAnalysisService {
  private static instance: AsyncAnalysisService;
  private analysisProgress: Map<string, AnalysisProgress> = new Map();

  static getInstance(): AsyncAnalysisService {
    if (!AsyncAnalysisService.instance) {
      AsyncAnalysisService.instance = new AsyncAnalysisService();
    }
    return AsyncAnalysisService.instance;
  }

  // Start comprehensive analysis of all project files
  async startProjectAnalysis(projectId: string): Promise<void> {
    console.log(`🚀 Starting comprehensive analysis for project ${projectId}`);
    
    try {
      // Get all files for the project
      const projectFiles = await fileService.getProjectFiles(projectId);
      console.log(`📂 Found ${projectFiles.length} files to analyze`);

      // Filter to only source files that can be analyzed
      const sourceFiles = projectFiles.filter(file => 
        this.isAnalyzableFile(file.relative_path, file.extension)
      );

      console.log(`🎯 ${sourceFiles.length} files selected for Claude analysis`);

      // Initialize progress tracking
      this.analysisProgress.set(projectId, {
        totalFiles: sourceFiles.length,
        completedFiles: 0,
        currentFile: null,
        isComplete: false,
        errors: []
      });

      // Clear existing analysis for fresh start
      await codeAnalysisService.clearProjectAnalysis(projectId);

      // Process files one by one to avoid rate limits
      let completedCount = 0;
      const errors: string[] = [];

      for (const file of sourceFiles) {
        try {
          // Update progress
          this.updateProgress(projectId, {
            currentFile: file.relative_path,
            completedFiles: completedCount
          });

          console.log(`📄 Analyzing file ${completedCount + 1}/${sourceFiles.length}: ${file.relative_path}`);

          // Get file content from database
          const fileContent = await fileService.getFileContent(file.id);
          if (!fileContent) {
            console.warn(`⚠️ No content found for file ${file.relative_path}`);
            continue;
          }

          // Prepare file for Claude analysis
          const fileForAnalysis: FileWithContent = {
            name: file.name,
            path: file.relative_path,
            type: file.file_type,
            size: file.size_bytes,
            content: fileContent
          };

          // Analyze with Claude
          const analysis = await analyzeIndividualFile(fileForAnalysis);

          // Store results in database
          await this.saveAnalysisResults(projectId, file.id, file.relative_path, analysis);

          completedCount++;

          // Add delay to respect rate limits (adjust as needed)
          await this.delay(1000); // 1 second between requests

        } catch (error) {
          const errorMsg = `Failed to analyze ${file.relative_path}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
          completedCount++; // Still count as completed to maintain progress
        }
      }

      // After code analysis, analyze design system files
      console.log(`🎨 Starting design system analysis...`);
      await this.analyzeDesignSystemFiles(projectId, projectFiles);

      // Mark analysis as complete
      this.updateProgress(projectId, {
        completedFiles: completedCount,
        currentFile: null,
        isComplete: true,
        errors
      });

      console.log(`✅ Analysis complete for project ${projectId}. ${completedCount}/${sourceFiles.length} files processed`);
      if (errors.length > 0) {
        console.warn(`⚠️ ${errors.length} files had analysis errors`);
      }

    } catch (error) {
      console.error(`❌ Failed to start analysis for project ${projectId}:`, error);
      this.updateProgress(projectId, {
        isComplete: true,
        errors: [`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    }
  }

  // Save analysis results to database
  private async saveAnalysisResults(
    projectId: string, 
    fileId: string, 
    filePath: string, 
    analysis: any
  ): Promise<void> {
    try {
      // Save functions analysis
      if (analysis.functions && analysis.functions.length > 0) {
        const functionAnalysis = analysis.functions.map((func: any) => ({
          file_id: fileId,
          project_id: projectId,
          name: func.name,
          line_number: func.line || 1, // Fallback to 1 if line is null/undefined
          purpose: func.purpose,
          function_type: func.type,
          complexity: func.complexity
        }));
        await codeAnalysisService.saveFunctionAnalysis(functionAnalysis);
      }

      // Save components analysis
      if (analysis.components && analysis.components.length > 0) {
        const componentAnalysis = analysis.components.map((comp: any) => ({
          file_id: fileId,
          project_id: projectId,
          name: comp.name,
          purpose: comp.purpose,
          props: comp.props || [],
          dependencies: comp.dependencies || [],
          used_by: comp.usedBy || []
        }));
        await codeAnalysisService.saveComponentAnalysis(componentAnalysis);
      }

      // Save algorithms analysis
      if (analysis.algorithms && analysis.algorithms.length > 0) {
        const algorithmAnalysis = analysis.algorithms.map((algo: any) => ({
          file_id: fileId,
          project_id: projectId,
          name: algo.name,
          line_number: algo.line || 1, // Fallback to 1 if line is null/undefined
          purpose: algo.purpose,
          complexity: algo.complexity,
          implementation: algo.implementation
        }));
        await codeAnalysisService.saveAlgorithmAnalysis(algorithmAnalysis);
      }

      // Save entry point analysis
      if (analysis.isEntryPoint && analysis.entryPointInfo) {
        const entryPointAnalysis = [{
          file_id: fileId,
          project_id: projectId,
          entry_type: analysis.entryPointInfo.type,
          purpose: analysis.entryPointInfo.purpose,
          importance: analysis.entryPointInfo.importance
        }];
        await codeAnalysisService.saveEntryPointAnalysis(entryPointAnalysis);
      }

      // Save data flow analysis
      if (analysis.dataFlows && analysis.dataFlows.length > 0) {
        const dataFlowAnalysis = analysis.dataFlows.map((flow: any) => ({
          project_id: projectId,
          from_component: flow.from,
          to_component: flow.to,
          flow_type: flow.type,
          description: flow.description
        }));
        await codeAnalysisService.saveDataFlowAnalysis(dataFlowAnalysis);
      }

      console.log(`💾 Saved analysis results for ${filePath}`);

    } catch (error) {
      console.error(`❌ Failed to save analysis for ${filePath}:`, error);
      throw error;
    }
  }

  // Analyze design system files (CSS, SCSS, etc.)
  private async analyzeDesignSystemFiles(projectId: string, allFiles: any[]): Promise<void> {
    try {
      // Filter for design system files
      const designFiles = allFiles.filter(file => {
        const extension = file.extension?.toLowerCase() || '';
        const path = file.relative_path?.toLowerCase() || '';
        
        // Include CSS/styling files
        const isStyleFile = ['css', 'scss', 'sass', 'less', 'styl', 'stylus'].includes(extension);
        
        // Include JS/TS files that might contain CSS-in-JS or styled components
        const isJSWithStyles = ['js', 'jsx', 'ts', 'tsx'].includes(extension) && 
                              (path.includes('style') || path.includes('theme') || path.includes('global'));
        
        return (isStyleFile || isJSWithStyles) &&
               !file.relative_path.includes('node_modules') &&
               !file.relative_path.includes('.git') &&
               !file.relative_path.includes('.next') &&
               !file.relative_path.includes('dist');
      });

      console.log(`🎨 Found ${designFiles.length} design system files to analyze`);
      
      if (designFiles.length > 0) {
        console.log(`📁 Design files found:`, designFiles.map(f => f.relative_path));
      } else {
        console.log(`⚠️ No design files found. All files:`, allFiles.slice(0, 10).map(f => ({
          name: f.name,
          extension: f.extension,
          path: f.relative_path
        })));
      }
      
      if (designFiles.length > 0) {
        console.log(`📁 Design files found:`, designFiles.map(f => f.relative_path));
      } else {
        console.log(`⚠️ No design files found. All files:`, allFiles.slice(0, 10).map(f => ({
          name: f.name,
          extension: f.extension,
          path: f.relative_path
        })));
      }

      if (designFiles.length === 0) {
        console.log(`ℹ️ No design system files found to analyze`);
        return;
      }

      // Collect all design system data
      const allColors: any[] = [];
      const allTypography: any[] = [];
      const allSpacing: any[] = [];
      const allComponentStyles: any[] = [];

      for (const file of designFiles) {
        console.log(`🎨 Analyzing design file: ${file.relative_path}`);

        // Get file content
        const fileContent = await fileService.getFileContent(file.id);
        if (!fileContent) {
          console.warn(`⚠️ No content found for design file ${file.relative_path}`);
          continue;
        }

        console.log(`📝 File content length: ${fileContent.length} characters`);

        // Extract design system data
        const designSystemData = analyzeDesignSystem(projectId, file.relative_path, fileContent);
        
        console.log(`✨ Extracted from ${file.relative_path}:`, {
          colors: designSystemData.colors.length,
          typography: designSystemData.typography.length,
          spacing: designSystemData.spacing.length,
          componentStyles: designSystemData.componentStyles.length
        });
        
        allColors.push(...designSystemData.colors);
        allTypography.push(...designSystemData.typography);
        allSpacing.push(...designSystemData.spacing);
        allComponentStyles.push(...designSystemData.componentStyles);
      }

      console.log(`🎯 Total extracted across all files:`, {
        colors: allColors.length,
        typography: allTypography.length,
        spacing: allSpacing.length,
        componentStyles: allComponentStyles.length
      });

      // Save to database
      if (allColors.length > 0) {
        console.log(`💾 Saving ${allColors.length} colors to database`);
        await designSystemService.saveColors(allColors);
      }

      if (allTypography.length > 0) {
        console.log(`💾 Saving ${allTypography.length} typography entries to database`);
        await designSystemService.saveTypography(allTypography);
      }

      if (allSpacing.length > 0) {
        console.log(`💾 Saving ${allSpacing.length} spacing values to database`);
        await designSystemService.saveSpacing(allSpacing);
      }

      if (allComponentStyles.length > 0) {
        console.log(`💾 Saving ${allComponentStyles.length} component styles to database`);
        await designSystemService.saveComponentStyles(allComponentStyles);
      }

      console.log(`✅ Design system analysis complete`);

    } catch (error) {
      console.error(`❌ Failed to analyze design system files:`, error);
      // Don't throw here - we don't want design system errors to fail the entire analysis
    }
  }

  // Check if file should be analyzed
  private isAnalyzableFile(filePath: string, extension: string): boolean {
    // Skip non-source files
    if (filePath.includes('node_modules') || 
        filePath.includes('.git') ||
        filePath.includes('dist/') ||
        filePath.includes('build/') ||
        filePath.includes('.next/')) {
      return false;
    }

    // Only analyze source code files
    const analyzableExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'vue', 'py', 'java', 'php', 'rb', 'go', 'rs', 'cpp', 'c', 'cs'
    ];

    return analyzableExtensions.includes(extension.toLowerCase());
  }

  // Get analysis progress for a project
  getAnalysisProgress(projectId: string): AnalysisProgress | null {
    return this.analysisProgress.get(projectId) || null;
  }

  // Update progress tracking
  private updateProgress(projectId: string, updates: Partial<AnalysisProgress>): void {
    const current = this.analysisProgress.get(projectId);
    if (current) {
      this.analysisProgress.set(projectId, { ...current, ...updates });
    }
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear progress tracking (cleanup)
  clearProgress(projectId: string): void {
    this.analysisProgress.delete(projectId);
  }
}

// Export singleton instance
export const asyncAnalysisService = AsyncAnalysisService.getInstance(); 