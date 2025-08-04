import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

// Define types for better type safety
interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp: string;
}

// Redis client setup
let redisClient: ReturnType<typeof createClient> | null = null;

const getRedisClient = async () => {
  if (!redisClient) {
    try {
      redisClient = createClient({
        url: process.env.KV_URL || process.env.REDIS_URL
      });
      await redisClient.connect();
      console.log('✅ Redis client connected');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      return null;
    }
  }
  return redisClient;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Create submission object
    const submission: Submission = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      message,
      timestamp: new Date().toISOString()
    };

    // Log to console
    console.log('Contact form submission:', submission);

    // Try to store in Redis - if it fails, return error
    try {
      const redis = await getRedisClient();
      
      if (!redis) {
        console.error('❌ Redis not available - submission failed');
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 500 }
        );
      }

      // Store the submission with a unique key
      await redis.set(`submission:${submission.id}`, JSON.stringify(submission));
      
      // Add to a list of all submission IDs for easy retrieval
      await redis.lpush('submissions:list', submission.id);
      
      console.log(`✅ Submission stored in Redis! ID: ${submission.id}`);
    } catch (error) {
      console.error('❌ Failed to store submission in Redis:', error);
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again later.' },
        { status: 500 }
      );
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message. We will get back to you soon!' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// New endpoint to get all submissions (for admin use)
export async function GET() {
  try {
    const redis = await getRedisClient();
    
    if (!redis) {
      console.error('❌ Redis not available - cannot fetch submissions');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Try to get from Redis
    try {
      // Get all submission IDs
      const submissionIds = await redis.lrange('submissions:list', 0, -1);
      
      if (!submissionIds || (Array.isArray(submissionIds) && submissionIds.length === 0)) {
        return NextResponse.json({ submissions: [] });
      }

      // Get all submissions
      const submissionIdsArray = Array.isArray(submissionIds) ? submissionIds as string[] : [];
      const submissions = await Promise.all(
        submissionIdsArray.map(async (id: string) => {
          const data = await redis.get(`submission:${id}`);
          return data ? JSON.parse(data) : null;
        })
      );
      
      // Filter out any null values and sort by timestamp
      const validSubmissions = submissions
        .filter((submission): submission is Submission => submission !== null)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return NextResponse.json({ submissions: validSubmissions });
    } catch (error) {
      console.error('❌ Error fetching from Redis:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

 