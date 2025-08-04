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

// Simple in-memory storage for development
const submissionsStorage: Submission[] = [];

// Redis client setup
let redisClient: ReturnType<typeof createClient> | null = null;

const getRedisClient = async () => {
  // In development, use in-memory storage
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode - using in-memory storage');
    return null;
  }

  console.log('🔍 getRedisClient called');
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  
  if (!redisClient) {
    try {
      console.log('🔍 Attempting Redis connection...');
      console.log('🔍 REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Not set');
      
      if (!process.env.REDIS_URL) {
        console.error('❌ REDIS_URL environment variable is not set');
        return null;
      }
      
      console.log('🔍 Creating Redis client...');
      redisClient = createClient({
        url: process.env.REDIS_URL
      });
      
      console.log('🔍 Connecting to Redis...');
      await redisClient.connect();
      console.log('✅ Redis client connected');
      
      // Test the connection
      console.log('🔍 Testing Redis connection...');
      await redisClient.set('test', 'test');
      await redisClient.get('test');
      await redisClient.del('test');
      console.log('✅ Redis connection tested successfully');
      
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: error instanceof Error && 'code' in error ? (error as { code?: string }).code : undefined,
        stack: error instanceof Error ? error.stack : undefined
      });
      redisClient = null;
      return null;
    }
  } else {
    console.log('🔍 Using existing Redis client');
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

    // Try to store in Redis (production) or memory (development)
    try {
      const redis = await getRedisClient();

      console.log('🔍 Redis client status:', redis ? 'Connected' : 'Not available');
      
      if (redis) {
        // Check if Redis client has the required methods
        const hasSet = typeof redis.set === 'function';
        const hasLpush = typeof redis.lpush === 'function';
        const hasLrange = typeof redis.lrange === 'function';
        const hasGet = typeof redis.get === 'function';
        
        console.log('🔍 Redis method availability:', {
          set: hasSet,
          lpush: hasLpush,
          lrange: hasLrange,
          get: hasGet
        });
        
        if (hasSet && hasLpush && hasLrange && hasGet) {
          // Production: Store in Redis
          console.log('🔍 Attempting to store in Redis...');
          await redis.set(`submission:${submission.id}`, JSON.stringify(submission));
          console.log('✅ Set operation completed');

          await redis.lpush('submissions:list', submission.id);
          console.log('✅ LPush operation completed');

          console.log(`✅ Submission stored in Redis! ID: ${submission.id}`);
        } else {
          // Redis methods not available: Store in memory
          console.log('🔍 Redis methods not available, storing in memory');
          submissionsStorage.push(submission);
          console.log(`✅ Submission stored in memory! ID: ${submission.id}`);
        }
      } else {
        // Development or Redis failed: Store in memory
        console.log('🔍 Storing in memory (development or Redis unavailable)');
        submissionsStorage.push(submission);
        console.log(`✅ Submission stored in memory! ID: ${submission.id}`);
      }
    } catch (error) {
      console.error('❌ Failed to store submission:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // Fallback to memory storage
      submissionsStorage.push(submission);
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
              // Check if Redis client has the required methods
              const hasLrange = typeof redis.lrange === 'function';
              const hasGet = typeof redis.get === 'function';
              
              console.log('🔍 Redis method availability for GET:', {
                lrange: hasLrange,
                get: hasGet
              });
              
              if (hasLrange && hasGet) {
                // Production: Get from Redis
                try {
                  const submissionIds = await redis.lrange('submissions:list', 0, -1);

                  if (!submissionIds || (Array.isArray(submissionIds) && submissionIds.length === 0)) {
                    return NextResponse.json({ submissions: [] });
                  }

                  const submissionIdsArray = Array.isArray(submissionIds) ? submissionIds as string[] : [];
                  const submissions = await Promise.all(
                    submissionIdsArray.map(async (id: string) => {
                      const data = await redis.get(`submission:${id}`);
                      return data ? JSON.parse(data) : null;
                    })
                  );

                  const validSubmissions = submissions
                    .filter((submission): submission is Submission => submission !== null)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                  return NextResponse.json({ submissions: validSubmissions });
                } catch (error) {
                  console.error('❌ Error fetching from Redis:', error);
                  // Fallback to memory
                  const sortedSubmissions = [...submissionsStorage].sort(
                    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  );
                  return NextResponse.json({ submissions: sortedSubmissions });
                }
              } else {
                // Redis methods not available: Get from memory
                console.log('🔍 Redis methods not available, getting from memory');
                const sortedSubmissions = [...submissionsStorage].sort(
                  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                return NextResponse.json({ submissions: sortedSubmissions });
              }
            } else {
              // Development: Get from memory
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

 