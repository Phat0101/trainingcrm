'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUsers, FaSearch } from 'react-icons/fa';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

type TrainingRecord = {
  id: string;
  trainingIndex: number;
  trainingType: string;
  content: string | null;
  organizer: string | null;
  totalHour: number | null;
  timeDescription: string | null;
  startDate: string | null;
  endDate: string | null;
  employees?: {
    id: string;
    fullName: string;
  }[];
};

type Employee = {
  id: string;
  fullName: string;
};

export default function TrainingPage() {
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Partial<TrainingRecord> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof TrainingRecord } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrainingRecords();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employeeSearchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const searchTerm = employeeSearchTerm.toLowerCase();
      const filtered = employees.filter(employee => 
        employee.fullName.toLowerCase().includes(searchTerm)
      );
      setFilteredEmployees(filtered);
    }
  }, [employeeSearchTerm, employees]);

  const fetchTrainingRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/training');
      if (!response.ok) {
        throw new Error('Failed to fetch training records');
      }
      const data = await response.json();
      setTrainingRecords(data);
    } catch (error) {
      console.error('Error fetching training records:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch training records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
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
    }
  };

  const handleAddTraining = () => {
    setCurrentRecord({});
    setIsEditing(false);
    setSelectedEmployees([]);
    setEmployeeSearchTerm('');
    setIsDialogOpen(true);
  };

  const handleEditTraining = (record: TrainingRecord) => {
    setCurrentRecord(record);
    setIsEditing(true);
    const employeeIds = record.employees?.map(emp => emp.id) || [];
    setSelectedEmployees(employeeIds);
    setEmployeeSearchTerm('');
    setIsDialogOpen(true);
  };

  const handleDeleteTraining = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/training/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete training record');
      }

      toast({
        title: 'Success',
        description: 'Training record deleted successfully',
      });

      fetchTrainingRecords();
    } catch (error) {
      console.error('Error deleting training record:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete training record',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const trainingData: Record<string, string | string[] | null | number> = {};
    formData.forEach((value, key) => {
      if (key === 'employeeIds') return;
      
      if (key === 'totalHour' && value !== '') {
        // Convert totalHour to a number
        trainingData[key] = parseFloat(value as string);
      } else {
        trainingData[key] = value === '' ? null : String(value);
      }
    });

    // Add selected employees to the data
    if (selectedEmployees.length > 0) {
      trainingData.employeeIds = selectedEmployees;
    }

    console.log('Submitting training data:', trainingData); // Log for debugging

    try {
      const url = isEditing ? `/api/training/${currentRecord?.id}` : '/api/training';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} training record: ${JSON.stringify(errorData)}`);
      }

      toast({
        title: 'Success',
        description: `Training record ${isEditing ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      fetchTrainingRecords();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} training record:`, error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} training record`,
        variant: 'destructive',
      });
    }
  };

  const handleCellClick = (record: TrainingRecord, field: keyof TrainingRecord) => {
    if (field === 'id' || field === 'trainingIndex' || field === 'employees') return;
    setEditingCell({ id: record.id, field });
    setEditValue(record[field] as string || '');
  };

  const handleCellSave = async () => {
    if (!editingCell) return;
    
    try {
      const record = trainingRecords.find(r => r.id === editingCell.id);
      if (!record) return;
      
      // Create a new object with only the field we want to update
      const updateData: Record<string, string | null> = {};
      updateData[editingCell.field] = editValue === '' ? null : editValue;
      
      const response = await fetch(`/api/training/${editingCell.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update training record');
      }

      toast({
        title: 'Success',
        description: 'Training record updated successfully',
      });

      // Update local state
      setTrainingRecords(trainingRecords.map(r => 
        r.id === editingCell.id ? { 
          ...r, 
          [editingCell.field]: editValue === '' ? null : editValue
        } : r
      ));
      
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating training record:', error);
      toast({
        title: 'Error',
        description: 'Failed to update training record',
        variant: 'destructive',
      });
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const renderCell = (record: TrainingRecord, field: keyof TrainingRecord) => {
    // Skip date fields as they're handled separately
    if (field === 'startDate' || field === 'endDate') {
      return null;
    }
    
    if (editingCell && editingCell.id === record.id && editingCell.field === field) {
      // For totalHour field, use a number input
      if (field === 'totalHour') {
        return (
          <div className="flex items-center">
            <Input
              type="number"
              step="0.1"
              min="0"
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
    
    // Show employees count with a button to view details
    if (field === 'employees') {
      const count = record.employees?.length || 0;
      return (
        <div className="flex items-center justify-center">
          <Button variant="ghost" size="sm" className="flex gap-2 items-center">
            <FaUsers className="h-4 w-4" />
            <span>{count}</span>
          </Button>
        </div>
      );
    }
    
    // For totalHour field, format with hours
    if (field === 'totalHour') {
      return (
        <div 
          className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          onClick={() => handleCellClick(record, field)}
        >
          {record.totalHour !== null ? `${record.totalHour} hour(s)` : ''}
        </div>
      );
    }
    
    return (
      <div 
        className="cursor-pointer hover:bg-gray-100 p-1 rounded"
        onClick={() => handleCellClick(record, field)}
      >
        {record[field] || ''}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lịch sử đào tạo</h1>
        <Button onClick={handleAddTraining}>
          <FaPlus className="mr-2 h-4 w-4" />
          Thêm lịch sử đào tạo
        </Button>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading...</p>
            </div>
          ) : trainingRecords.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>Không tìm thấy lịch sử đào tạo. Thêm lịch sử đào tạo để bắt đầu.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] min-w-[40px] p-2">#</TableHead>
                    <TableHead className="w-[150px] min-w-[100px] p-2">Hình thức</TableHead>
                    <TableHead className="w-[200px] min-w-[120px] p-2">Nội dung</TableHead>
                    <TableHead className="w-[150px] min-w-[100px] p-2">Đơn vị/cá nhân chịu trách nhiệm</TableHead>
                    <TableHead className="w-[100px] min-w-[80px] p-2">Tổng giờ tín chỉ</TableHead>
                    <TableHead className="w-[150px] min-w-[120px] p-2">Mô tả thời gian</TableHead>
                    <TableHead className="w-[120px] min-w-[100px] p-2">Ngày bắt đầu</TableHead>
                    <TableHead className="w-[120px] min-w-[100px] p-2">Ngày kết thúc</TableHead>
                    <TableHead className="w-[120px] min-w-[80px] p-2">Nhân viên</TableHead>
                    <TableHead className="w-[100px] min-w-[80px] p-2">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="w-[40px] min-w-[40px] p-2">{record.trainingIndex}</TableCell>
                      <TableCell className="w-[150px] min-w-[100px] p-2">{renderCell(record, 'trainingType')}</TableCell>
                      <TableCell className="w-[200px] min-w-[120px] p-2">{renderCell(record, 'content')}</TableCell>
                      <TableCell className="w-[150px] min-w-[100px] p-2">{renderCell(record, 'organizer')}</TableCell>
                      <TableCell className="w-[100px] min-w-[80px] p-2">{renderCell(record, 'totalHour')}</TableCell>
                      <TableCell className="w-[150px] min-w-[120px] p-2">{renderCell(record, 'timeDescription')}</TableCell>
                      <TableCell className="w-[120px] min-w-[100px] p-2">
                        {record.startDate && editingCell?.id === record.id && editingCell.field === 'startDate' ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full"
                            />
                            <Button size="sm" variant="ghost" onClick={handleCellSave}>
                              <FaSave className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCellCancel}>
                              <FaTimes className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                            onClick={() => handleCellClick(record, 'startDate')}
                          >
                            {record.startDate ? new Date(record.startDate).toLocaleDateString() : '-'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[100px] p-2">
                        {record.endDate && editingCell?.id === record.id && editingCell.field === 'endDate' ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full"
                            />
                            <Button size="sm" variant="ghost" onClick={handleCellSave}>
                              <FaSave className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCellCancel}>
                              <FaTimes className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                            onClick={() => handleCellClick(record, 'endDate')}
                          >
                            {record.endDate ? new Date(record.endDate).toLocaleDateString() : '-'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-[120px] min-w-[80px] p-2">{renderCell(record, 'employees' as keyof TrainingRecord)}</TableCell>
                      <TableCell className="w-[100px] min-w-[80px] p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTraining(record)}
                          >
                            <FaEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTraining(record.id)}
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
        <DialogContent className="max-w-5xl max-h-[800px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Chỉnh sửa lịch sử đào tạo' : 'Thêm lịch sử đào tạo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="trainingType">Hình thức</Label>
                <Input
                  id="trainingType"
                  name="trainingType"
                  defaultValue={currentRecord?.trainingType || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Nội dung</Label>
                <Input
                  id="content"
                  name="content"
                  defaultValue={currentRecord?.content || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="organizer">Đơn vị/cá nhân chịu trách nhiệm</Label>
                <Input
                  id="organizer"
                  name="organizer"
                  defaultValue={currentRecord?.organizer || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalHour">Tổng giờ tín chỉ</Label>
                <Input
                  id="totalHour"
                  name="totalHour"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={currentRecord?.totalHour?.toString() || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeDescription">Mô tả thời gian</Label>
                <Input
                  id="timeDescription"
                  name="timeDescription"
                  defaultValue={currentRecord?.timeDescription || ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={currentRecord?.startDate ? new Date(currentRecord.startDate).toISOString().split('T')[0] : ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={currentRecord?.endDate ? new Date(currentRecord.endDate).toISOString().split('T')[0] : ''}
                />
              </div>

              <div className="grid gap-2 col-span-2">
                <Label>Gán nhân viên</Label>
                <div className="mb-2">
                  <div className="relative">
                    <Input
                      placeholder="Tìm kiếm nhân viên..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FaSearch className="h-4 w-4" />
                    </div>
                    {employeeSearchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setEmployeeSearchTerm('')}
                      >
                        <FaTimes className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {employeeSearchTerm && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tìm thấy {filteredEmployees.length} {filteredEmployees.length === 1 ? 'nhân viên' : 'nhân viên'} khớp với &quot;{employeeSearchTerm}&quot;
                    </p>
                  )}
                </div>
                <div className="border rounded-md p-3 max-h-56 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {filteredEmployees.map((employee) => (
                      <div key={employee.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`employee-${employee.id}`}
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEmployees([...selectedEmployees, employee.id]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                            }
                          }}
                        />
                        <Label htmlFor={`employee-${employee.id}`}>{employee.fullName}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit">
                {isEditing ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 