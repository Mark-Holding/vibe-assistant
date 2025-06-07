import { NextRequest, NextResponse } from 'next/server';
import { asyncAnalysisService } from '../../../lib/analysis/asyncAnalysisService';

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Start analysis asynchronously (don't await - let it run in background)
    asyncAnalysisService.startProjectAnalysis(projectId).catch(error => {
      console.error('Background analysis failed:', error);
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Analysis started in background' 
    });
  } catch (error) {
    console.error('Error starting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}

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

    const progress = asyncAnalysisService.getAnalysisProgress(projectId);
    
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error getting analysis progress:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis progress' },
      { status: 500 }
    );
  }
} 