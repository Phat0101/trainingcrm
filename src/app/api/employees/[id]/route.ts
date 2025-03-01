import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const employee = await prisma.employee.findUnique({
      where: {
        id: id,
      },
      include: {
        trainingRecords: {
          select: {
            id: true,
            trainingType: true,
            content: true,
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    
    // Remove any fields that shouldn't be directly updated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { trainingRecords, createdAt, updatedAt, ...updateData } = data;
    
    const employee = await prisma.employee.update({
      where: {
        id: (await params).id,
      },
      data: updateData,
    });
    
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.employee.delete({
      where: {
        id: (await params).id,
      },
    });
    
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
} 