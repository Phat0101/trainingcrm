import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Fetch data from all tables
    // Include training records directly with employees
    const employeesWithTraining = await prisma.employee.findMany({
      include: {
        trainingRecords: {
          select: { trainingType: true, content: true, totalHour: true }
        }
      }
    });
    const trainingRecords = await prisma.trainingRecord.findMany({
      include: { employees: { select: { id: true, fullName: true } } }
    });
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true }
    });

    // --- Process data for the new 'Employee Training Summary' sheet ---
    const employeeTrainingSummary = employeesWithTraining.map(employee => {
      const totalTrainingHours = employee.trainingRecords.reduce(
        (sum, record) => sum + (record.totalHour ?? 0), // Sum hours, treat null as 0
        0
      );
      const trainingList = employee.trainingRecords
        .map(record => record.trainingType + ' - ' + record.content || 'N/A') // Use type and content
        .join('; '); // Join training names with a semicolon

      // Return an object for the sheet row, only including name and training details
      return {
        fullName: employee.fullName, // Only include fullName
        totalTrainingHours,
        trainingList,
      };
    });
    // --- End processing for new sheet ---


    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert data to worksheets
    // Original Employees sheet (without nested training data)
    const wsEmployees = XLSX.utils.json_to_sheet(
       employeesWithTraining.map(emp => {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { trainingRecords: _, ...employeeData } = emp;
         return employeeData;
       })
    );
    // Original Training Records sheet (flattening employee relation)
    const wsTrainingRecords = XLSX.utils.json_to_sheet(
      trainingRecords.map(record => ({
        ...record,
        employees: record.employees.map(e => e.fullName).join(', ') // Flatten employee relation
      }))
    );
    // Admins sheet
    const wsAdmins = XLSX.utils.json_to_sheet(admins);
    // New Employee Training Summary sheet
    const wsEmployeeTrainingSummary = XLSX.utils.json_to_sheet(employeeTrainingSummary);


    // Add worksheets to the workbook
    XLSX.utils.book_append_sheet(wb, wsEmployees, 'Nhân viên');
    XLSX.utils.book_append_sheet(wb, wsTrainingRecords, 'Lịch sử đào tạo');
    XLSX.utils.book_append_sheet(wb, wsEmployeeTrainingSummary, 'Tổng kết đào tạo');
    XLSX.utils.book_append_sheet(wb, wsAdmins, 'Admin');

    // Generate the XLSX file buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Return the buffer as a response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="backup_${new Date().toISOString()}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error('Backup API Error:', error);
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
  }
} 