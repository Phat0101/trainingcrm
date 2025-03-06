import { RefObject } from 'react';

export const useCertificatePrinter = (certificateRef: RefObject<HTMLDivElement | null>) => {
  const handlePrint = () => {
    if (!certificateRef.current) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const certificateHtml = certificateRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 0.5cm;
            }
          }
          
          body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 20px;
            font-size: 12pt;
            line-height: 1.2; /* Reduce line height globally for the print version */
          }
          
          /* Control spacing for paragraphs */
          p {
            margin-top: 0.3rem;
            margin-bottom: 0.3rem;
            line-height: 1.2;
          }
          
          /* Reduce spacing in table cells */
          td, th {
            padding: 4px;
            line-height: 1.2;
          }
          
          /* Header section styles */
          .flex {
            display: flex;
          }
          
          .justify-between {
            justify-content: space-between;
          }
          
          .text-center {
            text-align: center;
          }
          
          .w-1\\/3 {
            width: 33%;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          /* Title section styles */
          .mt-4 {
            margin-top: 1rem;
          }
          
          .mb-12 {
            margin-bottom: 3rem;
          }
          
          .text-xl {
            font-size: 1.25rem;
          }
          
          .text-lg {
            font-size: 1.125rem;
          }
          
          /* Certificate title specific styles */
          .text-center.mt-8.mb-12 {
            margin-top: 1.5rem;
            margin-bottom: 3rem;
          }
          
          .text-center.mt-8.mb-12 h2,
          .text-center.mt-8.mb-12 h3 {
            margin-top: 0.2rem;
            margin-bottom: 0.2rem;
            line-height: 1.2;
          }
          
          /* Table styles */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }
          
          table, th, td {
            border: 1px solid black;
          }
          
          th, td {
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: #f8f9fa;
          }
          
          /* Footer section */
          .my-4 {
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
          
          .text-right {
            text-align: right;
          }
          
          .mt-2 {
            margin-top: 0.5rem;
          }
          
          .mr-28 {
            margin-right: 7rem;
          }
          
          .mr-\\[100px\\] {
            margin-right: 100px;
          }
          
          .h-20 {
            height: 5rem;
          }
          
          /* Border utilities */
          .border {
            border: 1px solid #e2e8f0;
          }
          
          .border-gray-400 {
            border-color: #cbd5e0;
          }
          
          .rounded-md {
            border-radius: 0.375rem;
          }
          
          /* General spacing */
          .p-2 {
            padding: 0.5rem;
          }
          
          .p-8 {
            padding: 2rem;
          }
          
          .mb-4 {
            margin-bottom: 1rem;
          }
          
          /* Date range formatting */
          .date-range-text {
            font-weight: normal;
            line-height: 1.2;
          }
          
          /* Adjust spacing for director signature section */
          .text-right p {
            margin-top: 0.3rem;
            margin-bottom: 0.3rem;
          }
          
          /* Remove unnecessary elements for print */
          .print\\:shadow-none {
            box-shadow: none;
          }
          
          .print\\:p-0 {
            padding: 0;
          }

          .italic {
            font-style: italic;
          }
          
          /* Container */
          .container {
            padding: 20px;
            max-width: 210mm; /* A4 width */
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${certificateHtml}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return { handlePrint };
}; 