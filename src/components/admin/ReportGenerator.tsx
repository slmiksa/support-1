
import { useState } from 'react';
import { getTicketsByDateRange, SupportTicket } from '@/utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define ticket status color map
const statusColorMap = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  open: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  inprogress: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  resolved: 'bg-green-100 text-green-800 hover:bg-green-200',
  closed: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

// Define ticket status labels in Arabic
const statusLabels = {
  pending: 'قيد الانتظار',
  open: 'مفتوحة',
  inprogress: 'جاري المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلقة',
};

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('يرجى تحديد تاريخ البداية والنهاية');
      return;
    }

    setLoading(true);

    // Adjust to end of day for end date
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    try {
      const data = await getTicketsByDateRange(
        startDate.toISOString(),
        adjustedEndDate.toISOString()
      );
      setTickets(data);
      setHasSearched(true);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('حدث خطأ أثناء إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (tickets.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    const headers = [
      'رقم التذكرة',
      'الرقم الوظيفي',
      'الفرع',
      'رقم Anydesk',
      'رقم التحويلة',
      'الوصف',
      'الحالة',
      'تاريخ الإنشاء'
    ];

    const csvContent = tickets.map(ticket => [
      ticket.ticket_id,
      ticket.employee_id,
      ticket.branch,
      ticket.anydesk_number || '',
      ticket.extension_number || '',
      `"${ticket.description.replace(/"/g, '""')}"`,
      statusLabels[ticket.status] || ticket.status,
      new Date(ticket.created_at || '').toLocaleDateString('ar-SA')
    ]);

    // Add BOM to support Arabic in Excel
    let csvString = '\uFEFF' + headers.join(',') + '\n' + 
                    csvContent.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const dateRange = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_التذاكر_${dateRange}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/admin/tickets/${ticketId}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-right text-xl font-bold text-company">نظام التقارير</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <div className="flex flex-col gap-2">
              <label className="text-right text-sm font-medium">تاريخ البداية</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-right"
                  >
                    {startDate ? (
                      format(startDate, 'PPP', { locale: ar })
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <div className="flex flex-col gap-2">
              <label className="text-right text-sm font-medium">تاريخ النهاية</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-right"
                  >
                    {endDate ? (
                      format(endDate, 'PPP', { locale: ar })
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 flex items-end">
            <Button 
              className="w-full" 
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? (
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent me-2"></div>
              ) : null}
              إنشاء التقرير
            </Button>
          </div>
        </div>

        {hasSearched && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-sm text-gray-500">
                  تم العثور على {tickets.length} تذكرة خلال الفترة
                </span>
              </div>
              {tickets.length > 0 && (
                <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                  <Download size={16} />
                  <span>تصدير التقرير (CSV)</span>
                </Button>
              )}
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم التذكرة</TableHead>
                    <TableHead className="text-right">الرقم الوظيفي</TableHead>
                    <TableHead className="text-right">الفرع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium text-right">{ticket.ticket_id}</TableCell>
                        <TableCell className="text-right">{ticket.employee_id}</TableCell>
                        <TableCell className="text-right">{ticket.branch}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={statusColorMap[ticket.status] || 'bg-gray-100'}>
                            {statusLabels[ticket.status] || ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(ticket.created_at || '').toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => handleViewTicket(ticket.ticket_id)}
                          >
                            عرض التفاصيل
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        <p>لا توجد تذاكر خلال الفترة المحددة</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;
