import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { employees } = data;
    
    if (!employees || !Array.isArray(employees)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    
    // Use createMany to bulk insert all employees in a single operation
    const result = await prisma.employee.createMany({
      data: employees,
      skipDuplicates: false, // Set to true if you want to skip duplicates
    });
    
    return NextResponse.json({ 
      message: `Successfully imported ${result.count} employees`,
      count: result.count 
    }, { status: 201 });
  } catch (error) {
    console.error('Error importing employees:', error);
    return NextResponse.json({ error: 'Failed to import employees' }, { status: 500 });
  }
} 