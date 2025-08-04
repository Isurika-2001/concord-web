import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test KV connection
    const { kv } = await import('@vercel/kv');
    
    // Test write
    await kv.set('test-key', 'test-value');
    
    // Test read
    const value = await kv.get('test-key');
    
    return NextResponse.json({ 
      success: true, 
      message: 'KV connection working',
      testValue: value 
    });
  } catch (error) {
    console.error('KV test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'KV connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 