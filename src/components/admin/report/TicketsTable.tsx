
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TicketsTableProps {
  tickets: any[];
}

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right text-base">قائمة التذاكر</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-right">
                  <th className="p-2 font-medium">رقم التذكرة</th>
                  <th className="p-2 font-medium">الفرع</th>
                  <th className="p-2 font-medium">الأولوية</th>
                  <th className="p-2 font-medium">الحالة</th>
                  <th className="p-2 font-medium">تاريخ الإنشاء</th>
                  <th className="p-2 font-medium">موظف الدعم المسؤول</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr key={ticket.ticket_id} className="border-b text-right">
                      <td className="p-2">{ticket.ticket_id}</td>
                      <td className="p-2">{ticket.branch}</td>
                      <td className="p-2">{ticket.priority}</td>
                      <td className="p-2">{ticket.status}</td>
                      <td className="p-2">{new Date(ticket.created_at).toLocaleString('ar-SA')}</td>
                      <td className="p-2">{ticket.first_responder || 'لم يتم الرد'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      لا توجد تذاكر في الفترة المحددة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketsTable;
