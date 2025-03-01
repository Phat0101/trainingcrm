import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        trainingRecords: {
          select: {
            id: true,
            trainingType: true,
            content: true,
            totalHour: true,
            startDate: true,
            endDate: true,
            organizer: true,
          }
        }
      },
      orderBy: {
        fullName: 'asc',
      },
    });
    
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const employee = await prisma.employee.create({
      data,
    });
    
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
} 