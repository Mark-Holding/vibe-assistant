import { NextRequest, NextResponse } from 'next/server';
import { codeAnalysisService } from '../../../lib/database/codeAnalysis';
import { designSystemService } from '../../../lib/database/designSystem';
import { fileService } from '../../../lib/database/files';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Debug: Checking analysis data for project ${projectId}`);

    // Try to fetch data from each table
    const results = {
      projectId,
      tables: {} as any,
      errors: [] as string[],
      designSystem: {} as any,
      files: {} as any
    };

    try {
      const functions = await codeAnalysisService.getFunctionAnalysis(projectId);
      results.tables.functions = { count: functions.length, sample: functions[0] || null };
    } catch (error) {
      results.errors.push(`Functions table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const components = await codeAnalysisService.getComponentAnalysis(projectId);
      results.tables.components = { count: components.length, sample: components[0] || null };
    } catch (error) {
      results.errors.push(`Components table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const algorithms = await codeAnalysisService.getAlgorithmAnalysis(projectId);
      results.tables.algorithms = { count: algorithms.length, sample: algorithms[0] || null };
    } catch (error) {
      results.errors.push(`Algorithms table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const dataFlow = await codeAnalysisService.getDataFlowAnalysis(projectId);
      results.tables.dataFlow = { count: dataFlow.length, sample: dataFlow[0] || null };
    } catch (error) {
      results.errors.push(`Data flow table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const entryPoints = await codeAnalysisService.getEntryPointAnalysis(projectId);
      results.tables.entryPoints = { count: entryPoints.length, sample: entryPoints[0] || null };
    } catch (error) {
      results.errors.push(`Entry points table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Debug design system data
    try {
      const colors = await designSystemService.getColors(projectId);
      results.designSystem.colors = { count: colors.length, sample: colors[0] || null };
    } catch (error) {
      results.errors.push(`Design System Colors error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const typography = await designSystemService.getTypography(projectId);
      results.designSystem.typography = { count: typography.length, sample: typography[0] || null };
    } catch (error) {
      results.errors.push(`Design System Typography error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const spacing = await designSystemService.getSpacing(projectId);
      results.designSystem.spacing = { count: spacing.length, sample: spacing[0] || null };
    } catch (error) {
      results.errors.push(`Design System Spacing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const componentStyles = await designSystemService.getComponentStyles(projectId);
      results.designSystem.componentStyles = { count: componentStyles.length, sample: componentStyles[0] || null };
    } catch (error) {
      results.errors.push(`Design System Component Styles error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Debug file information
    try {
      const allFiles = await fileService.getProjectFiles(projectId);
      const designFiles = allFiles.filter(file => {
        const extension = file.extension?.toLowerCase() || '';
        return ['css', 'scss', 'sass', 'less'].includes(extension) &&
               !file.relative_path.includes('node_modules') &&
               !file.relative_path.includes('.git');
      });
      
      results.files = {
        totalFiles: allFiles.length,
        designFiles: designFiles.length,
        designFileList: designFiles.slice(0, 10).map(f => ({
          name: f.name,
          path: f.relative_path,
          extension: f.extension,
          size: f.size_bytes
        }))
      };
    } catch (error) {
      results.errors.push(`Files debug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 