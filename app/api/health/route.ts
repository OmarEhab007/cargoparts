import { NextResponse } from 'next/server';
import { isDatabaseConnected } from '@/lib/db/utils';

export async function GET() {
  try {
    const dbConnected = await isDatabaseConnected();
    
    return NextResponse.json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}