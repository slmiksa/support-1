
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
                  <TableHead className="font-medium">الفرع</TableHead>
                  <TableHead className="font-medium">الأولوية</TableHead>
                  <TableHead className="font-medium">الحالة</TableHead>
                  <TableHead className="font-medium">وصف المشكلة</TableHead>
                  <TableHead className="font-medium">رد الدعم الفني</TableHead>
                  <TableHead className="font-medium">تاريخ الإنشاء</TableHead>
                  <TableHead className="font-medium">موظف الدعم المسؤول</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.ticket_id} className="border-b text-right">
                      <TableCell>{ticket.ticket_id}</TableCell>
                      <TableCell>{ticket.branch}</TableCell>
                      <TableCell>{ticket.priority}</TableCell>
                      <TableCell>{ticket.status}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={ticket.description}>
                        {ticket.description}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={getFirstAdminResponse(ticket.ticket_id)}>
                        {getFirstAdminResponse(ticket.ticket_id)}
                      </TableCell>
                      <TableCell>{new Date(ticket.created_at).toLocaleString('ar-SA')}</TableCell>
                      <TableCell>{ticket.first_responder || 'لم يتم الرد'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="p-4 text-center text-muted-foreground">
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
