import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface DataToUpdate {
  trainingType?: string;
  content?: string | null;
  organizer?: string | null;
  totalHour?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  employees?: {
    set: [];
    connect: { id: string }[];
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainingRecord = await prisma.trainingRecord.findUnique({
      where: {
        id: (await params).id,
      },
      include: {
        employees: true,
      },
    });

    if (!trainingRecord) {
      return NextResponse.json({ error: 'Training record not found' }, { status: 404 });
    }

    return NextResponse.json(trainingRecord);
  } catch (error) {
    console.error('Error fetching training record:', error);
    return NextResponse.json({ error: 'Failed to fetch training record' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    
    console.log('Received update data:', data); // Log for debugging
    
    // Process date fields and numeric fields
    const formattedData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      totalHour: typeof data.totalHour === 'number' ? data.totalHour : 
                 data.totalHour ? parseFloat(data.totalHour) : null
    };
    
    // Remove any fields that shouldn't be directly updated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { employees, employeeIds, createdAt, updatedAt, trainingIndex, ...updateData } = formattedData;
    
    // Create the data object for the update
    const dataToUpdate: DataToUpdate = { ...updateData };
    
    // Handle employee connections/disconnections if employeeIds is provided
    if (employeeIds) {
      dataToUpdate.employees = {
        set: [], // First disconnect all existing connections
        connect: employeeIds.map((id: string) => ({ id }))
      };
    }
    
    try {
      const trainingRecord = await prisma.trainingRecord.update({
        where: {
          id: (await params).id,
        },
        data: dataToUpdate,
        include: {
          employees: true,
        },
      });
      
      return NextResponse.json(trainingRecord);
    } catch (prismaError) {
      console.error('Prisma error updating training record:', prismaError);
      return NextResponse.json({ 
        error: 'Failed to update training record in database', 
        details: prismaError instanceof Error ? prismaError.message : String(prismaError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing update data:', error);
    return NextResponse.json({ 
      error: 'Failed to process update data', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.trainingRecord.delete({
      where: {
        id: (await params).id,
      },
    });
    return NextResponse.json({ message: 'Training record deleted successfully' });
  } catch (error) {
    console.error('Error deleting training record:', error);
    return NextResponse.json({ error: 'Failed to delete training record' }, { status: 500 });
  }
} 