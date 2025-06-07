import { NextRequest, NextResponse } from 'next/server';
import { analyzeEntryPoints } from '../../../lib/claude';

export async function POST(request: NextRequest) {
  try {
    const { files, projectType } = await request.json();
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    const analysis = await analyzeEntryPoints({ files, projectType });
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Entry points analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze entry points' },
      { status: 500 }
    );
  }
}