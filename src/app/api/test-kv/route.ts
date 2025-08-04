import { NextResponse } from 'next/server';
import { createClient } from 'redis';

export async function GET() {
  try {
    // Test Redis connection
    const redis = createClient({
      url: process.env.REDIS_URL
    });
    
    await redis.connect();
    
    // Test write
    await redis.set('test-key', 'test-value');
    
    // Test read
    const value = await redis.get('test-key');
    
    await redis.disconnect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Redis connection working',
      testValue: value 
    });
  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Redis connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 