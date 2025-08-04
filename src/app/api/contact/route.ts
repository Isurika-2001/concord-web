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

// Dynamic import for Vercel KV (only available in production)
const getKV = async () => {
  if (process.env.NODE_ENV === 'production') {
    const { kv } = await import('@vercel/kv');
    return kv;
  }
  // Fallback for development - you can implement a local storage solution
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

    // Store in Vercel KV (production) or log (development)
    try {
      const kv = await getKV();
      
      if (kv) {
        // Store the submission with a unique key
        await kv.set(`submission:${submission.id}`, submission);
        
        // Add to a list of all submission IDs for easy retrieval
        await kv.lpush('submissions:list', submission.id);
        
        console.log(`✅ Submission stored in KV! ID: ${submission.id}`);
      } else {
        // Development fallback - just log the submission
        console.log(`✅ Submission logged (development mode): ${submission.id}`);
      }
    } catch (error) {
      console.error('Failed to store submission:', error);
      return NextResponse.json(
        { error: 'Failed to store submission' },
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
    const kv = await getKV();
    
    if (!kv) {
      return NextResponse.json({ submissions: [] });
    }

    // Get all submission IDs
    const submissionIds = await kv.lrange('submissions:list', 0, -1);
    
    if (!submissionIds || submissionIds.length === 0) {
      return NextResponse.json({ submissions: [] });
    }

    // Get all submissions
    const submissions = await kv.mget(submissionIds.map((id: string) => `submission:${id}`));
    
    // Filter out any null values and sort by timestamp
    const validSubmissions = submissions
      .filter((submission: any) => submission !== null)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ submissions: validSubmissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

 