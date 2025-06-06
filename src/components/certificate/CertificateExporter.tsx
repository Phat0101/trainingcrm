export type TrainingRecord = {
  id: string;
  trainingType: string;
  content: string | null;
  organizer: string | null;
  totalHour: number | null;
  timeDescription: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type Employee = {
  id: string;
  fullName: string;
  birthDate: string | null;
  position: string | null;
  department: string | null;
  trainingRecords: TrainingRecord[];
};

export const useCertificateExporter = () => {
  // Helper function to format dates consistently
  const formatDateVN = (dateString: string): string => {
    if (!dateString) return "......";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Word export function
  const handleExportWord = (
    employee: Employee, 
    date: string, 
    filterStartDate?: string, 
    filterEndDate?: string
  ) => {
    if (!employee) return;

    const totalHours = employee.trainingRecords.reduce((total, record) => {
      return total + (record.totalHour || 0);
    }, 0);
    
    const currentDate = new Date(date);
    const formattedDate = `ngày ${currentDate.getDate()} tháng ${currentDate.getMonth() + 1} năm ${currentDate.getFullYear()}`;

    // Format filter dates for display using Vietnamese locale
    const formattedStartDate = filterStartDate ? formatDateVN(filterStartDate) : "......";
    const formattedEndDate = filterEndDate ? formatDateVN(filterEndDate) : "......";

    // Create HTML content for Word document that matches the image layout exactly
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Giấy chứng nhận - ${employee.fullName}</title>
        <style>
          @page Section1 {
            size: 21cm 29.7cm;
            margin: 1cm 1cm 1cm 1cm;
            mso-page-orientation: portrait;
            mso-header-margin: 0cm;
            mso-footer-margin: 0cm;
            mso-paper-source: 0;
          }
          
          div.Section1 {
            page: Section1;
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.2;
            margin: 0;
            padding: 0;
          }
          
          p {
            margin-top: 0.3rem;
            margin-bottom: 0.3rem;
            line-height: 1.2;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            border: none;
          }
          
          table.header {
            margin-bottom: 10pt;
          }
          
          table.content {
            border: 1px solid black;
            margin-top: 8pt;
            margin-bottom: 10pt;
          }
          
          table.content td, table.content th {
            border: 1px solid black;
            padding: 3pt;
            line-height: 1.2;
          }
          
          .total-row td {
            padding-top: 2pt;
            padding-bottom: 2pt;
          }
          
          .summary {
            margin-top: 6pt;
            margin-bottom: 6pt;
          }
          
          .center {
            text-align: center;
          }
          
          .bold {
            font-weight: bold;
          }
          
          .right {
            text-align: right;
          }
          
          .title {
            text-align: center;
            margin: 10pt 0;
            margin-bottom: 15pt;
          }
          
          .title h1 {
            font-size: 16pt;
            margin: 4pt 0;
          }
          
          .title h2 {
            font-size: 14pt;
            margin: 2pt 0;
          }
          
          .signature {
            margin-top: 15pt;
            text-align: right;
          }
          
          .signature-space {
            height: 60pt;
          }
          
          .person-info {
            margin-bottom: 10pt;
          }
          
          .person-info p {
            margin-top: 4pt;
            margin-bottom: 4pt;
            line-height: 1.3;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          .header-left {
            width: 50%;
            text-align: left;
            vertical-align: top;
          }
          
          .header-left p {
            margin-left: 0;
            margin-bottom: 3pt;
          }
          
          .header-right {
            width: 50%;
            text-align: center;
            vertical-align: top;
          }
          
          .info-label {
            width: 120pt;
          }
          
          .row-space {
            height: 12pt;
          }
          
          /* Table column widths to match image */
          .col-stt {
            width: 40pt;
          }
          
          .col-hinhthuc {
            width: 100pt;
          }
          
          .col-noidung {
            width: 120pt;
          }
          
          .col-donvi {
            width: 150pt;
          }
          
          .col-thoigian {
            width: 150pt;
          }
          
          .col-gio {
            width: 80pt;
          }
          
          .text-red {
            color: red;
          }

        </style>
      </head>
      <body>
        <div class="Section1">
          <!-- Header -->
          <table class="header">
            <tr>
              <td class="header-left">
                <p class="bold">SỞ Y TẾ TP. HỒ CHÍ MINH</p>
                <p class="bold">BỆNH VIỆN QUẬN TÂN PHÚ</p>
                <p>Số:........./BVQTP - GCNĐTLT</p>
              </td>
              <td class="header-right">
                <p class="bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p class="bold">Độc lập - Tự Do - Hạnh Phúc</p>
                <p>&nbsp;</p>
              </td>
            </tr>
          </table>

          <!-- Title -->
          <div class="title">
            <h1 class="bold">GIẤY CHỨNG NHẬN</h1>
            <h2 class="bold">THAM GIA CẬP NHẬT KIẾN THỨC Y KHOA LIÊN TỤC</h2>
            <h2 class="bold">TRONG KHÁM BỆNH, CHỮA BỆNH</h2>
          </div>

          <!-- Person Info -->
          <div class="person-info">
            <p><span class="font-bold">Chứng nhận:</span> Ông/Bà: ${employee.fullName || '(Chưa có)'}</p>
            <p><span class="font-bold">Sinh ngày:</span> ${employee.birthDate || '(Chưa có)'}</p>
            <p><span class="font-bold">Đơn vị công tác:</span> Bệnh viện quận Tân Phú</p>
            <p><span class="font-bold">Đã hoàn thành cập nhật kiến thức y khoa liên tục với các nội dung như sau:</span></p>
          </div>

          <!-- Table -->
          <table class="content">
            <tr>
              <th class="center bold col-stt">STT</th>
              <th class="center bold col-hinhthuc">Hình thức</th>
              <th class="center bold col-noidung">Nội dung</th>
              <th class="center bold col-donvi">Đơn vị/cá nhân chịu trách nhiệm</th>
              <th class="center bold col-thoigian">Thời gian</th>
              <th class="center bold col-gio">Số giờ tín chỉ</th>
            </tr>`;

    if (employee.trainingRecords.length === 0) {
      html += `
            <tr>
              <td class="center"></td>
              <td class="center" colspan="4">Không có dữ liệu đào tạo trong khoảng thời gian đã chọn</td>
              <td class="center"></td>
            </tr>`;
    } else {
      employee.trainingRecords.forEach((record, index) => {
        let timeDisplay = '';
        
        // Use timeDescription if available, otherwise use date range
        if (record.timeDescription) {
          timeDisplay = record.timeDescription;
        } else if (record.startDate && record.endDate) {
          timeDisplay = `Từ ${formatDateVN(record.startDate)} đến ${formatDateVN(record.endDate)}`;
        }
        
        html += `
            <tr>
              <td class="center">${index + 1}</td>
              <td>${record.trainingType}</td>
              <td>${record.content || ''}</td>
              <td>${record.organizer || ''}</td>
              <td>${timeDisplay}</td>
              <td class="center">${record.totalHour || 0}</td>
            </tr>`;
      });
    }

    // Calculate training date range for display
    const dateRangeText = (filterStartDate && filterEndDate) ? 
      `từ ngày ${formattedStartDate} đến ngày ${formattedEndDate}` : 
      (filterStartDate ? `từ ngày ${formattedStartDate}` : 
        (filterEndDate ? `đến ngày ${formattedEndDate}` : 
          `từ ngày ...... đến ngày ......`));

    html += `
            <tr class="total-row">
              <td class="bold" colspan="5">Tổng cộng</td>
              <td class="center bold">${totalHours}</td>
            </tr>
          </table>

          <p class="summary">Tổng số tiết đào tạo liên tục ${dateRangeText}: <b>${totalHours}</b> giờ tín chỉ</p>

          <div class="signature">
            <p style="font-style: italic; margin-bottom: 3pt;">TP. Hồ Chí Minh, ${formattedDate}</p>
            <p class="bold" style="margin-right: 100px; margin-top: 3pt; margin-bottom: 3pt;">GIÁM ĐỐC</p>
            <div class="signature-space"></div>
          </div>
        </div>
      </body>
      </html>`;

    // Create a Blob with the HTML content
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chứng nhận CME - ${employee.fullName} - ${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { handleExportWord };
};