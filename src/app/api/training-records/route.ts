import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const trainingRecords = await prisma.trainingRecord.findMany({
      include: {
        employees: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    return NextResponse.json(trainingRecords);
  } catch (error) {
    console.error('Error fetching training records:', error);
    return NextResponse.json({ error: 'Failed to fetch training records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const trainingRecord = await prisma.trainingRecord.create({
      data,
      include: {
        employees: true,
      },
    });
    
    return NextResponse.json(trainingRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating training record:', error);
    return NextResponse.json({ error: 'Failed to create training record' }, { status: 500 });
  }
} 