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

// Simple in-memory storage as fallback
const submissionsStorage: Submission[] = [];

// Helper function to add submission to storage
const addSubmission = (submission: Submission) => {
  submissionsStorage.push(submission);
};

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

    // Try to store in Redis first, fallback to in-memory storage
    try {
      const redis = await getRedisClient();
      
      if (redis) {
        // Store the submission with a unique key
        await redis.set(`submission:${submission.id}`, JSON.stringify(submission));
        
        // Add to a list of all submission IDs for easy retrieval
        await redis.lpush('submissions:list', submission.id);
        
        console.log(`✅ Submission stored in Redis! ID: ${submission.id}`);
      } else {
        // Fallback to in-memory storage
        addSubmission(submission);
        console.log(`✅ Submission stored in memory! ID: ${submission.id}`);
      }
    } catch (error) {
      console.error('Failed to store submission in Redis, using memory fallback:', error);
      // Fallback to in-memory storage
      addSubmission(submission);
      console.log(`✅ Submission stored in memory fallback! ID: ${submission.id}`);
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
    
    if (redis) {
      // Try to get from Redis
      try {
        // Get all submission IDs
        const submissionIds = await redis.lrange('submissions:list', 0, -1);
        
        if (!submissionIds || submissionIds.length === 0) {
          return NextResponse.json({ submissions: [] });
        }

        // Get all submissions
        const submissions = await Promise.all(
          submissionIds.map(async (id: string) => {
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
        console.error('Error fetching from Redis, using memory fallback:', error);
        // Fallback to in-memory storage
        const sortedSubmissions = [...submissionsStorage].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        return NextResponse.json({ submissions: sortedSubmissions });
      }
    } else {
      // Use in-memory storage
      const sortedSubmissions = [...submissionsStorage].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return NextResponse.json({ submissions: sortedSubmissions });
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

 