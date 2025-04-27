'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function BackupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleBackup = async () => {
    setLoading(true);
    setMessage('Đang tạo bản lưu trữ...');
    try {
      const response = await fetch('/api/backup');
      if (!response.ok) {
        throw new Error(`Lỗi tạo bản lưu trữ: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `backup_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Bản lưu trữ đã được tạo thành công!');
    } catch (error) {
      console.error('Backup error:', error);
      setMessage(`Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Tạo Bản Lưu Trữ Dữ Liệu</h1>
      <p className="mb-6 text-gray-600">
        Nhấn nút bên dưới để tải xuống toàn bộ dữ liệu trong cơ sở dữ liệu dưới dạng tệp Excel (.xlsx).
        Mỗi bảng dữ liệu (Nhân viên, Đào tạo, Quản trị viên) sẽ nằm trong một trang tính riêng.
      </p>
      <Button onClick={handleBackup} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Tạo và Tải xuống Bản Lưu Trữ'}
      </Button>
      {message && <p className={`mt-4 ${message.startsWith('Lỗi') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
    </DashboardLayout>
  );
}
