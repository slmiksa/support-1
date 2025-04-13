
import { format } from 'date-fns';
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportUtilsProps {
  tickets: any[];
  ticketStats: {
    total: number;
    byStatus: Record<string, number>;
    byBranch: Record<string, number>;
    byStaff: Record<string, number>;
  };
  startDate: Date;
  endDate: Date;
  ticketResponses?: Record<string, any[]>;
}

export const useExportUtils = ({ tickets, ticketStats, startDate, endDate, ticketResponses = {} }: ExportUtilsProps) => {
  // هذه الدالة تستخرج أول رد من موظف الدعم الفني للتذكرة
  const getFirstAdminResponse = (ticketId: string) => {
    const responses = ticketResponses[ticketId] || [];
    const firstAdminResponse = responses.find(resp => resp.is_admin);
    return firstAdminResponse ? firstAdminResponse.response : 'لم يتم الرد بعد';
  };

  const exportToExcel = async () => {
    try {
      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet('تقرير التذاكر');
      
      // Add headers
      worksheet.columns = [
        { header: 'رقم التذكرة', key: 'ticket_id', width: 20 },
        { header: 'الفرع', key: 'branch', width: 15 },
        { header: 'الأولوية', key: 'priority', width: 15 },
        { header: 'الحالة', key: 'status', width: 15 },
        { header: 'وصف المشكلة', key: 'description', width: 30 },
        { header: 'رد الدعم الفني', key: 'admin_response', width: 30 },
        { header: 'تاريخ الإنشاء', key: 'created_at', width: 20 },
        { header: 'موظف الدعم المسؤول', key: 'first_responder', width: 20 },
      ];
      
      // Add data
      tickets.forEach(ticket => {
        worksheet.addRow({
          ticket_id: ticket.ticket_id,
          branch: ticket.branch,
          priority: ticket.priority,
          status: ticket.status,
          description: ticket.description,
          admin_response: getFirstAdminResponse(ticket.ticket_id),
          created_at: new Date(ticket.created_at).toLocaleString('ar-SA'),
          first_responder: ticket.first_responder || 'لم يتم الرد',
        });
      });
      
      // Set right-to-left for Arabic support
      worksheet.views = [{ rightToLeft: true }];
      
      // Generate buffer and save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `تقرير_التذاكر_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add right-to-left support
      doc.setR2L(true);
      
      // Add title
      doc.setFontSize(18);
      doc.text('تقرير نظام التذاكر', doc.internal.pageSize.width / 2, 15, { align: 'center' });
      
      // Add date range
      doc.setFontSize(12);
      doc.text(
        `الفترة: ${format(startDate, 'yyyy-MM-dd')} إلى ${format(endDate, 'yyyy-MM-dd')}`,
        doc.internal.pageSize.width / 2, 
        25, 
        { align: 'center' }
      );
      
      // Add summary statistics
      doc.text(`إجمالي التذاكر: ${ticketStats.total}`, 20, 35);
      
      // Add tickets table with description and admin response
      const tableData = tickets.map(ticket => [
        ticket.ticket_id,
        ticket.branch,
        ticket.priority,
        ticket.status,
        ticket.description && ticket.description.length > 30 ? ticket.description.substring(0, 30) + '...' : ticket.description,
        getFirstAdminResponse(ticket.ticket_id).length > 30 ? getFirstAdminResponse(ticket.ticket_id).substring(0, 30) + '...' : getFirstAdminResponse(ticket.ticket_id),
        new Date(ticket.created_at).toLocaleString('ar-SA'),
        ticket.first_responder || 'لم يتم الرد'
      ]);
      
      autoTable(doc, {
        head: [['رقم التذكرة', 'الفرع', 'الأولوية', 'الحالة', 'وصف المشكلة', 'رد الدعم الفني', 'تاريخ الإنشاء', 'موظف الدعم المسؤول']],
        body: tableData,
        startY: 45,
        styles: { font: 'courier', halign: 'right' },
        headStyles: { fillColor: [212, 175, 55] },
      });
      
      // Save the PDF
      doc.save(`تقرير_التذاكر_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  return {
    exportToExcel,
    exportToPDF
  };
};
