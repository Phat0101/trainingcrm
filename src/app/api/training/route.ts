import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const trainingRecords = await prisma.trainingRecord.findMany({
      include: {
        employees: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        trainingIndex: 'asc',
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
    
    console.log('Received training data:', data); // Log for debugging
    
    // Process date fields and numeric fields
    const formattedData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      totalHour: typeof data.totalHour === 'number' ? data.totalHour : 
                 data.totalHour ? parseFloat(data.totalHour) : null
    };
    
    console.log('Formatted training data:', formattedData); // Log for debugging
    
    // Handle the employees relation (if any employee IDs are provided)
    const { employeeIds, ...trainingData } = formattedData;
    
    // Get the maximum trainingIndex and increment by 1
    const maxIndexRecord = await prisma.trainingRecord.findFirst({
      orderBy: {
        trainingIndex: 'desc',
      },
    });
    
    const nextIndex = maxIndexRecord ? maxIndexRecord.trainingIndex + 1 : 1;
    
    try {
      const trainingRecord = await prisma.trainingRecord.create({
        data: {
          ...trainingData,
          trainingIndex: nextIndex,
          employees: employeeIds && employeeIds.length > 0 
            ? { 
                connect: employeeIds.map((id: string) => ({ id })) 
              } 
            : undefined,
        },
        include: {
          employees: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });
      
      return NextResponse.json(trainingRecord, { status: 201 });
    } catch (prismaError) {
      console.error('Prisma error creating training record:', prismaError);
      return NextResponse.json({ 
        error: 'Failed to create training record in database', 
        details: prismaError instanceof Error ? prismaError.message : String(prismaError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing training record data:', error);
    return NextResponse.json({ 
      error: 'Failed to process training record data', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 