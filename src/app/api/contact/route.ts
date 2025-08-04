import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

// File to store submissions
const SUBMISSIONS_FILE = join(process.cwd(), 'data', 'submissions.json');

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
    const submission = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      message,
      timestamp: new Date().toISOString()
    };

    // Log to console
    console.log('Contact form submission:', submission);

    // Store in JSON file
    try {
      // Ensure data directory exists
      const dataDir = join(process.cwd(), 'data');
      await writeFile(join(dataDir, '.gitkeep'), '').catch(() => {});

      // Read existing submissions
      let submissions = [];
      try {
        const existingData = await readFile(SUBMISSIONS_FILE, 'utf-8');
        submissions = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist, start with empty array
        submissions = [];
      }

      // Add new submission
      submissions.push(submission);

      // Write back to file
      await writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
      
      console.log(`✅ Submission stored! Total submissions: ${submissions.length}`);
    } catch (fileError) {
      console.error('Failed to store submission:', fileError);
      // Continue anyway - at least we logged it
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

 