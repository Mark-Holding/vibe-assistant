import { NextRequest, NextResponse } from 'next/server';
import { codeAnalysisService } from '../../../lib/database/codeAnalysis';

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
      errors: [] as string[]
    };

    try {
      const functions = await codeAnalysisService.getFunctionAnalysis(projectId);
      results.tables.functions = { count: functions.length, sample: functions[0] || null };
    } catch (error) {
      results.errors.push(`Functions table error: ${error.message}`);
    }

    try {
      const components = await codeAnalysisService.getComponentAnalysis(projectId);
      results.tables.components = { count: components.length, sample: components[0] || null };
    } catch (error) {
      results.errors.push(`Components table error: ${error.message}`);
    }

    try {
      const algorithms = await codeAnalysisService.getAlgorithmAnalysis(projectId);
      results.tables.algorithms = { count: algorithms.length, sample: algorithms[0] || null };
    } catch (error) {
      results.errors.push(`Algorithms table error: ${error.message}`);
    }

    try {
      const dataFlow = await codeAnalysisService.getDataFlowAnalysis(projectId);
      results.tables.dataFlow = { count: dataFlow.length, sample: dataFlow[0] || null };
    } catch (error) {
      results.errors.push(`Data flow table error: ${error.message}`);
    }

    try {
      const entryPoints = await codeAnalysisService.getEntryPointAnalysis(projectId);
      results.tables.entryPoints = { count: entryPoints.length, sample: entryPoints[0] || null };
    } catch (error) {
      results.errors.push(`Entry points table error: ${error.message}`);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
} 