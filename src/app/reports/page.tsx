'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaFileExcel } from 'react-icons/fa';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { utils } from 'xlsx';

type TrainingRecord = {
  id: string;
  trainingType: string;
  content: string | null;
  organizer: string | null;
  totalHour: number | null;
  startDate: string | null;
  endDate: string | null;
};

type Employee = {
  id: string;
  fullName: string;
  birthDate: string | null;
  position: string | null;
  department: string | null;
  trainingRecords: TrainingRecord[];
};

const Reports = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
      return data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast({
        title: 'Error',
        description: 'Start date cannot be after end date',
        variant: 'destructive',
      });
      return;
    }

    const employeesData = employees.length > 0 ? employees : await fetchEmployees();
    
    // Filter employees who have training records within the date range
    const filtered = employeesData.filter((employee: Employee) => {
      // Filter training records within date range
      const filteredRecords = employee.trainingRecords.filter((record: TrainingRecord) => {
        if (!record.startDate || !record.endDate) return false;
        
        const recordStartDate = new Date(record.startDate);
        const recordEndDate = new Date(record.endDate);
        
        // Check if any part of the training period overlaps with the selected date range
        return (
          (recordStartDate >= start && recordStartDate <= end) || // Start date in range
          (recordEndDate >= start && recordEndDate <= end) || // End date in range
          (recordStartDate <= start && recordEndDate >= end) // Training spans the entire range
        );
      });
      
      // Add the filtered records to the employee and only include employees with matching records
      if (filteredRecords.length > 0) {
        employee.trainingRecords = filteredRecords;
        return true;
      }
      return false;
    });
    
    setFilteredEmployees(filtered);
    setIsGenerated(true);
    
    if (filtered.length === 0) {
      toast({
        title: 'No Results',
        description: 'No training records found for the selected date range',
      });
    }
  };

  const exportToExcel = () => {
    if (filteredEmployees.length === 0) {
      toast({
        title: 'Error',
        description: 'No data to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create workbook and worksheet
      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet([]);
      utils.book_append_sheet(wb, ws, 'Training Report');

      // Add table headers (simplified)
      utils.sheet_add_aoa(ws, [
        ['STT', 'Họ tên', 'Ngày tháng năm sinh', 'Chức danh', 'Khoa/phòng', 'Hình thức tham gia', 'Tổng số giờ tín chỉ']
      ], { origin: 'A1' });


      // Add data rows (simplified)
      let rowIndex = 2;
      filteredEmployees.forEach((employee: Employee, index: number) => {
        // Calculate total hours for this employee
        const totalHours = employee.trainingRecords.reduce((total: number, record: TrainingRecord) => {
          return total + (record.totalHour || 0);
        }, 0);
        
        // Get unique training types
        const trainingTypes = [...new Set(employee.trainingRecords.map((r: TrainingRecord) => r.trainingType))].join(', ');

        utils.sheet_add_aoa(ws, [
          [
            index + 1,
            employee.fullName,
            employee.birthDate || '',
            employee.position || '',
            employee.department || '',
            trainingTypes,
            totalHours
          ]
        ], { origin: `A${rowIndex}` });
        rowIndex++;
      });


      // Convert to binary and trigger download
      const fileName = `bao_cao_dao_tao_tu${startDate}_den_${endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: 'Success',
        description: 'Report exported successfully',
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report to Excel',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo Đào tạo</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">Từ ngày</Label>
              <Input 
                id="start-date" 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="end-date">Đến ngày</Label>
              <Input 
                id="end-date" 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={isLoading} className="w-full">
                {isLoading ? 'Đang tải...' : 'Tạo báo cáo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isGenerated && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={exportToExcel} variant="outline" disabled={filteredEmployees.length === 0}>
              <FaFileExcel className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-center">STT</th>
                  <th className="border border-gray-300 p-2">Họ tên</th>
                  <th className="border border-gray-300 p-2">Ngày sinh</th>
                  <th className="border border-gray-300 p-2">Chức danh</th>
                  <th className="border border-gray-300 p-2">Khoa/phòng</th>
                  <th className="border border-gray-300 p-2">Hình thức tham gia</th>
                  <th className="border border-gray-300 p-2 text-center">Tổng số giờ</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-gray-300 p-4 text-center text-gray-500">
                      Không có dữ liệu cho khoảng thời gian đã chọn
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee, index) => {
                    // Calculate total hours for this employee
                    const totalHours = employee.trainingRecords.reduce((total, record) => {
                      return total + (record.totalHour || 0);
                    }, 0);
                    
                    // Get unique training types
                    const trainingTypes = [...new Set(employee.trainingRecords.map(r => r.trainingType))].join(', ');
                    
                    return (
                      <tr key={employee.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-2">{employee.fullName}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          {employee.birthDate || ''}
                        </td>
                        <td className="border border-gray-300 p-2">{employee.position || ''}</td>
                        <td className="border border-gray-300 p-2">{employee.department || ''}</td>
                        <td className="border border-gray-300 p-2">{trainingTypes}</td>
                        <td className="border border-gray-300 p-2 text-center">{totalHours}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Reports;