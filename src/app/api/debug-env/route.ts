import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    redisUrl: process.env.REDIS_URL ? 'Set' : 'Not set',
    nodeEnv: process.env.NODE_ENV,
    hasRedisUrl: !!process.env.REDIS_URL
  });
} 