import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// File to read submissions from
const SUBMISSIONS_FILE = join(process.cwd(), 'data', 'submissions.json');

export async function GET() {
  try {
    const existingData = await readFile(SUBMISSIONS_FILE, 'utf-8');
    const submissions = JSON.parse(existingData);
    
    return NextResponse.json({
      submissions,
      count: submissions.length
    });
  } catch {
    // If file doesn't exist or can't be read, return empty array
    return NextResponse.json({
      submissions: [],
      count: 0
    });
  }
} 