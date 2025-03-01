'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FaPlus, FaUpload, FaTrash, FaSave, FaTimes, FaSearch } from 'react-icons/fa';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

type Employee = {
  id: string;
  fullName: string;
  birthDate: string | null;
  gender: string | null;
  position: string | null;
  specialization: string | null;
  department: string | null;
  joinDate: string | null;
  licenseNumber: string | null;
  licenseIssueDate: string | null;
  licenseIssuer: string | null;
  licensePracticeScope: string | null;
  trainingRecords?: {
    id: string;
    trainingType: string;
    content: string | null;
  }[];
};

// Define the field mapping as a constant to avoid duplication
const VIETNAMESE_FIELD_MAPPING: Record<string, keyof Employee> = {
  'Họ và tên': 'fullName',
  'Ngày tháng năm sinh': 'birthDate',
  'Giới tính': 'gender',
  'Chức danh': 'position',
  'Trình độ chuyên môn': 'specialization',
  'Khoa/Phòng': 'department',
  'Ngày tham gia công tác': 'joinDate',
  'Số chứng chỉ hành nghề/ Giấy phép hành nghề': 'licenseNumber',
  'Ngày cấp': 'licenseIssueDate',
  'Nơi cấp': 'licenseIssuer',
  'Phạm vi hành nghề': 'licensePracticeScope'
};

// Define column information
const COLUMNS = [
  { key: 'Họ và tên', width: 'w-48', minWidth: 'w-20' },
  { key: 'Ngày tháng năm sinh', width: 'w-32', minWidth: 'w-8' },
  { key: 'Giới tính', width: 'w-24', minWidth: 'w-8' },
  { key: 'Chức danh', width: 'w-28', minWidth: 'w-8' },
  { key: 'Trình độ chuyên môn', width: 'w-48', minWidth: 'w-12' },
  { key: 'Khoa/Phòng', width: 'w-40', minWidth: 'w-12' },
  { key: 'Ngày tham gia công tác', width: 'w-32', minWidth: 'w-8' },
  { key: 'Số chứng chỉ hành nghề/ Giấy phép hành nghề', width: 'w-64', minWidth: 'w-12' },
  { key: 'Ngày cấp', width: 'w-32', minWidth: 'w-8' },
  { key: 'Nơi cấp', width: 'w-40', minWidth: 'w-12' },
  { key: 'Phạm vi hành nghề', width: 'w-48', minWidth: 'w-12' },
  { key: 'Lịch sử đào tạo', width: 'w-64', minWidth: 'w-20' },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof Employee } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = employees.filter(employee => 
        employee.fullName?.toLowerCase().includes(lowercasedSearch) || false
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setCurrentEmployee({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });

      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'destructive',
      });
    }
  };

  const toggleColumnCollapse = (columnKey: string) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const employeeData: Record<string, string | null> = {};
    formData.forEach((value, key) => {
      employeeData[key] = value === '' ? null : String(value);
    });

    try {
      const url = isEditing ? `/api/employees/${currentEmployee?.id}` : '/api/employees';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} employee`);
      }

      toast({
        title: 'Success',
        description: `Employee ${isEditing ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} employee:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} employee`,
        variant: 'destructive',
      });
    }
  };

  const handleCellClick = (employee: Employee, field: keyof Employee | string) => {
    if (field === 'id' || field === 'Lịch sử đào tạo') return; // Don't allow editing the ID or training records
    
    // Convert Vietnamese field name to Employee key if needed
    const employeeField = typeof field === 'string' && VIETNAMESE_FIELD_MAPPING[field] 
      ? VIETNAMESE_FIELD_MAPPING[field] 
      : field as keyof Employee;
    
    // Only handle string values for editing
    const value = employee[employeeField];
    if (typeof value !== 'string' && value !== null) return;
    
    setEditingCell({ id: employee.id, field: employeeField });
    setEditValue(value || '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    try {
      const employee = employees.find(e => e.id === editingCell.id);
      if (!employee) return;
      
      // Create a new object with only the fields we want to update
      const updateData: Record<string, string | null> = {
        [editingCell.field]: editValue === '' ? null : editValue
      };
      
      const response = await fetch(`/api/employees/${editingCell.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });

      // Update local state with type assertion to handle the string | null type
      setEmployees(employees.map(e => 
        e.id === editingCell.id ? { 
          ...e, 
          [editingCell.field]: editValue === '' ? null : editValue 
        } as Employee : e
      ));
      
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employee',
        variant: 'destructive',
      });
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let employees: Record<string, string | number | null>[] = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const result = Papa.parse<Record<string, string>>(text, { header: true });
        employees = result.data;
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        employees = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(worksheet);
      } else {
        throw new Error('Unsupported file format');
      }

      // Map CSV/Excel column names to our model
      const mappedEmployees = employees.map((emp) => {
        const mappedEmp: Record<string, string | null> = {};
        
        // Map the fields based on the CSV file
        mappedEmp.fullName = emp['Họ và tên'] ? String(emp['Họ và tên']) : (emp.fullName ? String(emp.fullName) : '');
        mappedEmp.birthDate = emp['Ngày tháng năm sinh'] ? String(emp['Ngày tháng năm sinh']) : null;
        mappedEmp.gender = emp['Giới tính'] ? String(emp['Giới tính']) : (emp.gender ? String(emp.gender) : null);
        mappedEmp.position = emp['Chức danh'] ? String(emp['Chức danh']) : (emp.position ? String(emp.position) : null);
        mappedEmp.specialization = emp['Trình độ chuyên môn'] ? String(emp['Trình độ chuyên môn']) : (emp.specialization ? String(emp.specialization) : null);
        mappedEmp.department = emp['Khoa/Phòng'] ? String(emp['Khoa/Phòng']) : (emp.department ? String(emp.department) : null);
        mappedEmp.joinDate = emp['Ngày tham gia công tác'] ? String(emp['Ngày tham gia công tác']) : null;
        mappedEmp.licenseNumber = emp['Số chứng chỉ hành nghề/ Giấy phép hành nghề'] ? String(emp['Số chứng chỉ hành nghề/ Giấy phép hành nghề']) : (emp.licenseNumber ? String(emp.licenseNumber) : null);
        mappedEmp.licenseIssueDate = emp['Ngày cấp'] ? String(emp['Ngày cấp']) : null;
        mappedEmp.licenseIssuer = emp['Nơi cấp'] ? String(emp['Nơi cấp']) : (emp.licenseIssuer ? String(emp.licenseIssuer) : null);
        mappedEmp.licensePracticeScope = emp['Phạm vi hành nghề'] ? String(emp['Phạm vi hành nghề']) : (emp.licensePracticeScope ? String(emp.licensePracticeScope) : null);
        
        return mappedEmp;
      });

      console.log(mappedEmployees);

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employees: mappedEmployees }),
      });

      if (!response.ok) {
        throw new Error('Failed to import employees');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: result.message,
      });

      setIsImportDialogOpen(false);
      fetchEmployees();
    } catch (err: unknown) {
      console.error('Error importing employees:', err);
      toast({
        title: 'Error',
        description: 'Failed to import employees',
        variant: 'destructive',
      });
    }
  };

  const renderCell = (employee: Employee, field: keyof Employee | string) => {
    // Special case for training records column
    if (field === 'Lịch sử đào tạo') {
      const trainingRecords = employee.trainingRecords || [];
      return (
        <div className="m-1 rounded min-h-[28px] max-h-[80px] overflow-y-auto">
          {trainingRecords.length === 0 ? (
            <span className="text-gray-400 text-xs italic px-1">Không có đào tạo</span>
          ) : (
            <ul className="list-disc pl-4 text-sm">
              {trainingRecords.map(record => (
                <li key={record.id} className="truncate" title={`${record.trainingType}${record.content ? `: ${record.content}` : ''}`}>
                  - {record.trainingType}{record.content ? `: ${record.content}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    // Convert Vietnamese field name to Employee key if needed
    const employeeField = typeof field === 'string' && VIETNAMESE_FIELD_MAPPING[field] 
      ? VIETNAMESE_FIELD_MAPPING[field] 
      : field as keyof Employee;

    if (editingCell && editingCell.id === employee.id && editingCell.field === employeeField) {
      return (
        <div className="flex items-center">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 mr-2"
            autoFocus
          />
          <Button variant="ghost" size="sm" onClick={handleCellSave} className="h-8 w-8 p-0">
            <FaSave className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCellCancel} className="h-8 w-8 p-0">
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    
    const value = employee[employeeField];
    // Handle only string or null values for display
    const displayValue = typeof value === 'string' ? value : null;
    const isEmpty = displayValue === null || displayValue === '';
    
    return (
      <div 
        className={`cursor-pointer hover:bg-gray-100 m-1 rounded truncate min-h-[28px] ${isEmpty ? 'border border-dashed border-gray-200' : ''}`}
        onClick={() => handleCellClick(employee, employeeField)}
        title={isEmpty ? 'Click to add data' : (displayValue || '')}
      >
        {isEmpty ? (
          <span className="text-gray-400 text-xs italic px-1">Click to edit</span>
        ) : (
          displayValue
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nhân viên</h1>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FaUpload className="mr-2 h-4 w-4" />
                File dữ liệu (CSV/Excel)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Employees</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="file">Upload CSV or Excel file</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleAddEmployee}>
            <FaPlus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Input
            placeholder="Tìm kiếm nhân viên theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FaSearch className="h-4 w-4" />
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setSearchTerm('')}
            >
              <FaTimes className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'} matching &quot;{searchTerm}&quot;
          </p>
        )}
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>{searchTerm ? 'No employees found matching your search.' : 'No employees found. Add some employees to get started.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto h-[77vh]">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    {COLUMNS.map((column) => (
                      <TableHead 
                        key={column.key} 
                        className={`${collapsedColumns[column.key] ? column.minWidth : column.width} cursor-pointer transition-all duration-200 p-0 h-16`}
                        onClick={() => toggleColumnCollapse(column.key)}
                      >
                        <div className="flex items-center justify-start">
                          {collapsedColumns[column.key] ? (
                            <span className="text-gray-400 mr-1">{column.key.slice(0, 4)}...</span>
                          ) : (
                            <span className="mr-1">{column.key}</span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-20">
                      <span className="mx-1">Xoá</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      {COLUMNS.map((column) => (
                        <TableCell 
                          key={`${employee.id}-${column.key}`} 
                          className={`${collapsedColumns[column.key] ? column.minWidth : column.width} transition-all duration-200 p-0`}
                        >
                          {collapsedColumns[column.key] ? (
                            <div className="w-full flex justify-center m-1">
                              <span className="text-gray-400">•••</span>
                            </div>
                          ) : (
                            renderCell(employee, column.key)
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="w-20 p-0">
                        <div className="flex justify-center m-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <FaTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={currentEmployee?.fullName || ''}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Ngày tháng năm sinh</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  defaultValue={currentEmployee?.birthDate || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Input
                  id="gender"
                  name="gender"
                  defaultValue={currentEmployee?.gender || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="position">Chức danh</Label>
                <Input
                  id="position"
                  name="position"
                  defaultValue={currentEmployee?.position || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialization">Trình độ chuyên môn</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  defaultValue={currentEmployee?.specialization || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Khoa/Phòng</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={currentEmployee?.department || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="joinDate">Ngày tham gia công tác</Label>
                <Input
                  id="joinDate"
                  name="joinDate"
                  defaultValue={currentEmployee?.joinDate || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licenseNumber">Số chứng chỉ hành nghề/ Giấy phép hành nghề</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  defaultValue={currentEmployee?.licenseNumber || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licenseIssueDate">Ngày cấp</Label>
                <Input
                  id="licenseIssueDate"
                  name="licenseIssueDate"
                  defaultValue={currentEmployee?.licenseIssueDate || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licenseIssuer">Nơi cấp</Label>
                <Input
                  id="licenseIssuer"
                  name="licenseIssuer"
                  defaultValue={currentEmployee?.licenseIssuer || ''}
                />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="licensePracticeScope">Phạm vi hành nghề</Label>
                <Input
                  id="licensePracticeScope"
                  name="licensePracticeScope"
                  defaultValue={currentEmployee?.licensePracticeScope || ''}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 