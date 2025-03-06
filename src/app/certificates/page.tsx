'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FaPrint, FaSearch, FaTimes, FaFileWord, FaFilter } from 'react-icons/fa';
import { useToast } from '@/components/ui/use-toast';
import { useCertificatePrinter } from '@/components/certificate/CertificatePrinter';
import { 
  useCertificateExporter, 
  Employee,
  TrainingRecord 
} from '@/components/certificate/CertificateExporter';

export default function CertificationPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [printDate, setPrintDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filteredTrainingRecords, setFilteredTrainingRecords] = useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Use the certificate printer hook
  const { handlePrint } = useCertificatePrinter(certificateRef);
  
  // Use the certificate exporter hook
  const { handleExportWord } = useCertificateExporter();

  useEffect(() => {
    fetchEmployees();
    
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setIsSearchResultsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find(emp => emp.id === selectedEmployeeId);
      setSelectedEmployee(employee || null);
      
      if (employee) {
        // Apply date filtering to training records when employee is selected
        filterTrainingRecords(employee);
      }
      
      // Clear search when an employee is selected
      setSearchTerm('');
      setIsSearchResultsOpen(false);
    } else {
      setSelectedEmployee(null);
      setFilteredTrainingRecords([]);
    }
  }, [selectedEmployeeId, employees, filterStartDate, filterEndDate]);

  // Apply date filtering whenever the filter dates change
  useEffect(() => {
    if (selectedEmployee) {
      filterTrainingRecords(selectedEmployee);
    }
  }, [filterStartDate, filterEndDate]);

  useEffect(() => {
    // Filter employees based on search term
    if (searchTerm.trim() === '') {
      setFilteredEmployees([]);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = employees.filter(employee => 
        employee.fullName.toLowerCase().includes(lowercasedSearch)
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

  // Filter training records based on date range
  const filterTrainingRecords = (employee: Employee) => {
    if (!employee.trainingRecords) {
      setFilteredTrainingRecords([]);
      return;
    }

    let filtered = [...employee.trainingRecords];
    
    // Filter by start date if provided
    if (filterStartDate) {
      const startDateObj = new Date(filterStartDate);
      filtered = filtered.filter(record => {
        if (!record.startDate) return false;
        const recordStartDate = new Date(record.startDate);
        return recordStartDate >= startDateObj;
      });
    }
    
    // Filter by end date if provided
    if (filterEndDate) {
      const endDateObj = new Date(filterEndDate);
      filtered = filtered.filter(record => {
        if (!record.endDate) return false;
        const recordEndDate = new Date(record.endDate);
        return recordEndDate <= endDateObj;
      });
    }
    
    setFilteredTrainingRecords(filtered);
  };

  const getTotalHours = (): number => {
    if (!filteredTrainingRecords.length) return 0;
    
    return filteredTrainingRecords.reduce((total, record) => {
      return total + (record.totalHour || 0);
    }, 0);
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployeeId(employee.id);
  };

  const handleSearchFocus = () => {
    if (searchTerm.trim() !== '') {
      setIsSearchResultsOpen(true);
    }
  };

  const clearSelectedEmployee = () => {
    setSelectedEmployeeId('');
    setSelectedEmployee(null);
    setFilteredTrainingRecords([]);
  };

  const handleExportWordDoc = () => {
    if (selectedEmployee) {
      // Pass filtered records and date range to export function
      handleExportWord(
        { ...selectedEmployee, trainingRecords: filteredTrainingRecords },
        printDate,
        filterStartDate,
        filterEndDate
      );
    }
  };

  // Format as DD/MM/YYYY with Vietnamese locale
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Generate text for date range, handling different combinations of start/end dates
  const getDateRangeText = (): string => {
    if (filterStartDate && filterEndDate) {
      return `từ ngày ${formatDate(filterStartDate)} đến ngày ${formatDate(filterEndDate)}`;
    } else if (filterStartDate) {
      return `từ ngày ${formatDate(filterStartDate)}`;
    } else if (filterEndDate) {
      return `đến ngày ${formatDate(filterEndDate)}`;
    } else {
      return `từ ngày ...... đến ngày ......`;
    }
  };

  // Reset date filters
  const clearDateFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Giấy chứng nhận đào tạo</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="employee-search">Tìm kiếm nhân viên</Label>
              <div className="relative">
                {selectedEmployee ? (
                  <div className="flex items-center border rounded-md p-2">
                    <span className="flex-grow">{selectedEmployee.fullName}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={clearSelectedEmployee}
                    >
                      <FaTimes className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Input
                        id="employee-search"
                        placeholder={isLoading ? "Đang tải..." : "Tìm kiếm nhân viên..."}
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value.trim() !== '') {
                            setIsSearchResultsOpen(true);
                          } else {
                            setIsSearchResultsOpen(false);
                          }
                        }}
                        onFocus={handleSearchFocus}
                        disabled={isLoading}
                        className="pl-10"
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FaSearch className="h-4 w-4" />
                      </div>
                    </div>
                    
                    {isSearchResultsOpen && searchTerm.trim() !== '' && (
                      <div 
                        ref={searchResultsRef}
                        className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto"
                      >
                        {filteredEmployees.length === 0 ? (
                          <div className="p-2 text-center text-gray-500">
                            Không tìm thấy nhân viên
                          </div>
                        ) : (
                          filteredEmployees.map(employee => (
                            <div
                              key={employee.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelectEmployee(employee)}
                            >
                              <div className="font-medium">{employee.fullName}</div>
                              {employee.department && (
                                <div className="text-sm text-gray-500">{employee.department}</div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="date">Ngày in</Label>
              <Input 
                id="date" 
                type="date" 
                value={printDate} 
                onChange={(e) => setPrintDate(e.target.value)} 
              />
            </div>
          </div>
          
          {/* Date range filter section */}
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center mb-2">
              <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
              <h3 className="font-medium">Lọc theo thời gian đào tạo</h3>
              {(filterStartDate || filterEndDate) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto h-8" 
                  onClick={clearDateFilters}
                >
                  <FaTimes className="mr-1 h-3 w-3" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filter-start-date">Từ ngày</Label>
                <Input 
                  id="filter-start-date" 
                  type="date" 
                  value={filterStartDate} 
                  onChange={(e) => setFilterStartDate(e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="filter-end-date">Đến ngày</Label>
                <Input 
                  id="filter-end-date" 
                  type="date" 
                  value={filterEndDate} 
                  onChange={(e) => setFilterEndDate(e.target.value)} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-6 gap-2">
        <Button onClick={handleExportWordDoc} disabled={!selectedEmployee} variant="outline">
          <FaFileWord className="mr-2 h-4 w-4" />
          Xuất Word
        </Button>
        <Button onClick={handlePrint} disabled={!selectedEmployee}>
          <FaPrint className="mr-2 h-4 w-4" />
          In giấy chứng nhận
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : selectedEmployee && (
        <div className="bg-white p-8 shadow-md rounded-md mb-6 print:shadow-none print:p-0" ref={certificateRef}>
          <div className="flex justify-between">
            <div className="text-center w-1/3">
              <p className="font-bold">SỞ Y TẾ TP. HỒ CHÍ MINH</p>
              <p className="font-bold">BỆNH VIỆN QUẬN TÂN PHÚ</p>
              <div style={{ width: '100px', borderBottom: '1px solid black', margin: '5px auto' }} />
              <p className='mt-4'>Số:........./BVQTP - GCNĐTLT</p>
            </div>
            <div className="text-center w-3/5">
              <p className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold">Độc lập - Tự Do - Hạnh Phúc</p>
              <div style={{ width: '180px', borderBottom: '1px solid black', margin: '5px auto' }} />
            </div>
          </div>

          <div className="text-center mt-8 mb-12">
            <h2 className="text-xl font-bold">GIẤY CHỨNG NHẬN</h2>
            <h3 className="text-lg font-bold">THAM GIA CẬP NHẬT KIẾN THỨC Y KHOA LIÊN TỤC</h3>
            <h3 className="text-lg font-bold">TRONG KHÁM BỆNH, CHỮA BỆNH</h3>
          </div>

          <div className="mb-4">
            <p><span className="font-bold">Chứng nhận: </span>Ông/Bà: {selectedEmployee.fullName}</p>
            <p><span className="font-bold">Sinh ngày: </span>{selectedEmployee.birthDate}</p>
            <p><span className="font-bold">Đơn vị công tác: </span>Bệnh viện quận Tân Phú</p>
            <p><span className="font-bold">Đã hoàn thành cập nhật kiến thức y khoa liên tục với các nội dung như sau:</span></p>
          </div>

          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2 text-center w-12">STT</th>
                <th className="border border-gray-400 p-2">Hình thức</th>
                <th className="border border-gray-400 p-2">Nội dung</th>
                <th className="border border-gray-400 p-2">Đơn vị/cá nhân chịu trách nhiệm</th>
                <th className="border border-gray-400 p-2">Thời gian</th>
                <th className="border border-gray-400 p-2 text-center w-24">Số giờ tín chỉ</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainingRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-gray-400 p-2 text-center">Không có dữ liệu đào tạo trong khoảng thời gian đã chọn</td>
                </tr>
              ) : (
                filteredTrainingRecords.map((record, index) => (
                  <tr key={record.id}>
                    <td className="border border-gray-400 p-2 text-center">{index + 1}</td>
                    <td className="border border-gray-400 p-2">{record.trainingType}</td>
                    <td className="border border-gray-400 p-2">{record.content || ''}</td>
                    <td className="border border-gray-400 p-2">{record.organizer || ''}</td>
                    <td className="border border-gray-400 p-2">
                      {record.timeDescription ? record.timeDescription : 
                        (record.startDate && record.endDate ? 
                          `Từ ${new Date(record.startDate).toLocaleDateString('vi-VN')} đến ${new Date(record.endDate).toLocaleDateString('vi-VN')}` : 
                          '')}
                    </td>
                    <td className="border border-gray-400 p-2 text-center">{record.totalHour || ''}</td>
                  </tr>
                ))
              )}
              <tr>
                <td colSpan={5} className="border border-gray-400 p-2 font-bold">Tổng cộng</td>
                <td className="border border-gray-400 p-2 text-center font-bold">{getTotalHours()}</td>
              </tr>
            </tbody>
          </table>

          <div className="my-4">
            <p>Tổng số tiết đào tạo liên tục <span className="date-range-text">{getDateRangeText()}</span>: <b>{getTotalHours()}</b> giờ tín chỉ</p>
          </div>

          <div className="text-right mt-8">
            <p className='italic'>TP. Hồ Chí Minh, ngày {new Date(printDate).getDate()} tháng {new Date(printDate).getMonth() + 1} năm {new Date(printDate).getFullYear()}</p>
            <p className="font-bold mt-2 mr-[100px]">GIÁM ĐỐC</p>
            <div className="h-20"></div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 