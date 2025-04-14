
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStatusLabel, priorityLabels, getStatusColorClass, priorityColorMap } from '@/utils/ticketStatusUtils';
import { format } from 'date-fns';

interface TicketsTableProps {
  tickets: any[];
  ticketResponses?: Record<string, any[]>;
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets, ticketResponses = {} }) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right text-base">قائمة التذاكر</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-right">
                  <TableHead className="font-medium">رقم التذكرة</TableHead>
                  <TableHead className="font-medium">الرقم الوظيفي</TableHead>
                  <TableHead className="font-medium">الفرع</TableHead>
                  <TableHead className="font-medium">الأولوية</TableHead>
                  <TableHead className="font-medium">الحالة</TableHead>
                  <TableHead className="font-medium">رقم الاتصال</TableHead>
                  <TableHead className="font-medium">رقم AnyDesk</TableHead>
                  <TableHead className="font-medium">وصف المشكلة</TableHead>
                  <TableHead className="font-medium">رد الدعم الفني</TableHead>
                  <TableHead className="font-medium">تاريخ الإنشاء</TableHead>
                  <TableHead className="font-medium">وقت فتح التذكرة من الدعم</TableHead>
                  <TableHead className="font-medium">آخر تحديث للحالة</TableHead>
                  <TableHead className="font-medium">موظف الدعم المسؤول</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.ticket_id} className="border-b text-right">
                      <TableCell>{ticket.ticket_id}</TableCell>
                      <TableCell>{ticket.employee_id}</TableCell>
                      <TableCell>{ticket.branch}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded ${priorityColorMap[ticket.priority] || 'bg-blue-100 text-blue-800'}`}>
                          {priorityLabels[ticket.priority as keyof typeof priorityLabels] || ticket.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded ${getStatusColorClass(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </TableCell>
                      <TableCell>{ticket.custom_fields?.Contact_Number || '-'}</TableCell>
                      <TableCell>{ticket.anydesk_number || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={ticket.description}>
                        {ticket.description}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={getFirstAdminResponse(ticket.ticket_id)}>
                        {getFirstAdminResponse(ticket.ticket_id)}
                      </TableCell>
                      <TableCell>{formatDateTime(ticket.created_at)}</TableCell>
                      <TableCell>{getFirstResponseTime(ticket.ticket_id)}</TableCell>
                      <TableCell>{formatDateTime(ticket.updated_at)}</TableCell>
                      <TableCell>{ticket.first_responder || 'لم يتم الرد'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} className="p-4 text-center text-muted-foreground">
                      لا توجد تذاكر في الفترة المحددة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketsTable;
