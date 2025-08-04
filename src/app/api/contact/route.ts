import { NextRequest, NextResponse } from 'next/server';

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
let submissionsStorage: Submission[] = [];

// Dynamic import for Vercel KV (only available in production)
const getKV = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      const { kv } = await import('@vercel/kv');
      return kv;
    }
  } catch (error) {
    console.log('Vercel KV not available, using fallback storage');
  }
  return null;
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

    // Try to store in Vercel KV first, fallback to in-memory storage
    try {
      const kv = await getKV();
      
      if (kv) {
        // Store the submission with a unique key
        await kv.set(`submission:${submission.id}`, submission);
        
        // Add to a list of all submission IDs for easy retrieval
        await kv.lpush('submissions:list', submission.id);
        
        console.log(`✅ Submission stored in KV! ID: ${submission.id}`);
      } else {
        // Fallback to in-memory storage
        submissionsStorage.push(submission);
        console.log(`✅ Submission stored in memory! ID: ${submission.id}`);
      }
    } catch (error) {
      console.error('Failed to store submission in KV, using memory fallback:', error);
      // Fallback to in-memory storage
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
    const kv = await getKV();
    
    if (kv) {
      // Try to get from Vercel KV
      try {
        // Get all submission IDs
        const submissionIds = await kv.lrange('submissions:list', 0, -1);
        
        if (!submissionIds || submissionIds.length === 0) {
          return NextResponse.json({ submissions: [] });
        }

        // Get all submissions
        const submissions = await kv.mget(submissionIds.map((id: string) => `submission:${id}`));
        
        // Filter out any null values and sort by timestamp
        const validSubmissions = submissions
          .filter((submission): submission is Submission => submission !== null)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return NextResponse.json({ submissions: validSubmissions });
      } catch (error) {
        console.error('Error fetching from KV, using memory fallback:', error);
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

 