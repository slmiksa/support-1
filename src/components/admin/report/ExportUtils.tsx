
import { format } from 'date-fns';
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';
import { getStatusLabel, priorityLabels } from '@/utils/ticketStatusUtils';

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

  // دالة للحصول على توقيت أول رد من الدعم الفني
  const getFirstResponseTime = (ticketId: string) => {
    const responses = ticketResponses[ticketId] || [];
    const firstAdminResponse = responses.find(resp => resp.is_admin);
    return firstAdminResponse ? 
      format(new Date(firstAdminResponse.created_at), 'yyyy-MM-dd HH:mm:ss') : 
      'لم يتم الرد بعد';
  };

  // دالة لتنسيق التاريخ والوقت
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '-';
    return format(new Date(dateTimeString), 'yyyy-MM-dd HH:mm:ss');
  };

  const exportToExcel = async () => {
    try {
      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet('تقرير التذاكر');
      
      // Add headers
      worksheet.columns = [
        { header: 'رقم التذكرة', key: 'ticket_id', width: 20 },
        { header: 'الرقم الوظيفي', key: 'employee_id', width: 15 },
        { header: 'الفرع', key: 'branch', width: 15 },
        { header: 'الأولوية', key: 'priority', width: 15 },
        { header: 'الحالة', key: 'status', width: 15 },
        { header: 'رقم الاتصال', key: 'contact_number', width: 15 },
        { header: 'رقم AnyDesk', key: 'anydesk_number', width: 15 },
        { header: 'وصف المشكلة', key: 'description', width: 30 },
        { header: 'رد الدعم الفني', key: 'admin_response', width: 30 },
        { header: 'تاريخ الإنشاء', key: 'created_at', width: 20 },
        { header: 'وقت فتح التذكرة من الدعم', key: 'first_response_time', width: 20 },
        { header: 'آخر تحديث للحالة', key: 'updated_at', width: 20 },
        { header: 'موظف الدعم المسؤول', key: 'first_responder', width: 20 },
      ];
      
      // Add data
      tickets.forEach(ticket => {
        worksheet.addRow({
          ticket_id: ticket.ticket_id,
          employee_id: ticket.employee_id,
          branch: ticket.branch,
          priority: priorityLabels[ticket.priority as keyof typeof priorityLabels] || ticket.priority,
          status: getStatusLabel(ticket.status),
          contact_number: ticket.custom_fields?.Contact_Number || '-',
          anydesk_number: ticket.anydesk_number || '-',
          description: ticket.description,
          admin_response: getFirstAdminResponse(ticket.ticket_id),
          created_at: new Date(ticket.created_at).toLocaleString('en-US'),
          first_response_time: getFirstResponseTime(ticket.ticket_id),
          updated_at: ticket.updated_at ? formatDateTime(ticket.updated_at) : '-',
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

  return {
    exportToExcel
  };
};
