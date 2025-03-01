import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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
    
    const trainingRecord = await prisma.trainingRecord.update({
      where: {
        id: (await params).id,
      },
      data,
      include: {
        employees: true,
      },
    });
    
    return NextResponse.json(trainingRecord);
  } catch (error) {
    console.error('Error updating training record:', error);
    return NextResponse.json({ error: 'Failed to update training record' }, { status: 500 });
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