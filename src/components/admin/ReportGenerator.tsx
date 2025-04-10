import { useState, useRef } from 'react';
import { getTicketsByDateRange, getTicketsWithResolutionDetails, getTicketStats, getAdminStats, getAllTicketResponses, SupportTicket } from '@/utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download, FileText, BarChart, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const statusColorMap = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  open: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  inprogress: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  resolved: 'bg-green-100 text-green-800 hover:bg-green-200',
  closed: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

const statusLabels = {
  pending: 'قيد الانتظار',
  open: 'مفتوحة',
  inprogress: 'جاري المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلقة',
};

const statusLabelsEn = {
  pending: 'Pending',
  open: 'Open',
  inprogress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const getPerformanceLevel = (resolvedTickets, averageResponseTime) => {
  if (resolvedTickets > 20 && averageResponseTime < 24) return { label: 'ممتاز', class: 'bg-green-100 text-green-800' };
  if (resolvedTickets > 10 && averageResponseTime < 48) return { label: 'جيد جدا', class: 'bg-blue-100 text-blue-800' };
  if (resolvedTickets > 5) return { label: 'جيد', class: 'bg-purple-100 text-purple-800' };
  return { label: 'متوسط', class: 'bg-yellow-100 text-yellow-800' };
};

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketResponses, setTicketResponses] = useState<Record<string, any[]>>({});
  const [ticketStats, setTicketStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byBranch: Record<string, number>;
    byStaff: Record<string, number>;
  }>({
    total: 0,
    byStatus: {},
    byBranch: {},
    byStaff: {},
  });
  const [adminStats, setAdminStats] = useState<{
    staffDetails: Array<{
      name: string;
      ticketsCount: number;
      resolvedCount: number;
      averageResponseTime: number;
      responseRate: number;
      statusDistribution: Record<string, number>;
      ticketIds: string[];
    }>;
  }>({
    staffDetails: []
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "خطأ",
        description: 'يرجى تحديد تاريخ البداية والنهاية',
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    try {
      const data = await getTicketsWithResolutionDetails(
        startDate.toISOString(),
        adjustedEndDate.toISOString()
      );
      setTickets(data);
      
      const ticketIds = data.map(ticket => ticket.ticket_id);
      const responses = await getAllTicketResponses(ticketIds);
      setTicketResponses(responses);
      
      const stats = await getTicketStats(
        startDate.toISOString(),
        adjustedEndDate.toISOString()
      );
      setTicketStats(stats);

      const adminStatsData = await getAdminStats(
        startDate.toISOString(),
        adjustedEndDate.toISOString()
      );
      setAdminStats(adminStatsData);
      
      setHasSearched(true);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "خطأ",
        description: 'حدث خطأ أثناء إنشاء التقرير',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (tickets.length === 0) {
      toast({
        title: "خطأ",
        description: 'لا توجد بيانات للتصدير',
        variant: "destructive"
      });
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
      'موظف الدعم الفني',
      'تاريخ الإنشاء',
      'تاريخ آخر تحديث',
      'الردود'
    ];

    const csvContent = tickets.map(ticket => {
      const responses = ticketResponses[ticket.ticket_id] || [];
      const responsesText = responses.map(r => 
        `${r.is_admin ? (r.admin_name || 'الدعم الفني') : 'الموظف'}: ${r.response.replace(/"/g, '""')} (${new Date(r.created_at).toLocaleDateString('ar-SA')})`
      ).join(' | ');

      return [
        ticket.ticket_id,
        ticket.employee_id,
        ticket.branch,
        ticket.anydesk_number || '',
        ticket.extension_number || '',
        `"${ticket.description.replace(/"/g, '""')}"`,
        statusLabels[ticket.status] || ticket.status,
        ticket.assigned_to || 'لم يتم التعيين',
        new Date(ticket.created_at || '').toLocaleDateString('ar-SA'),
        new Date(ticket.updated_at || '').toLocaleDateString('ar-SA'),
        `"${responsesText.replace(/"/g, '""')}"`
      ];
    });

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

  const exportToPDF = () => {
    if (tickets.length === 0) {
      toast({
        title: "خطأ",
        description: "لا توجد بيانات للتصدير",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      doc.setFontSize(18);
      doc.setTextColor(21, 67, 127);
      const title = `Ticket Report: ${format(startDate, 'yyyy/MM/dd')} - ${format(endDate, 'yyyy/MM/dd')}`;
      doc.text(title, doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const currentDate = `Report Date: ${format(new Date(), 'yyyy/MM/dd HH:mm')}`;
      doc.text(currentDate, doc.internal.pageSize.width - 20, 30, { align: 'right' });
      
      doc.setFontSize(14);
      doc.setTextColor(21, 67, 127);
      doc.text('Ticket Statistics', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      
      const statsData = [
        ['Total Tickets', ticketStats.total.toString()],
        ['Pending', (ticketStats.byStatus.pending || 0).toString()],
        ['Open', (ticketStats.byStatus.open || 0).toString()],
        ['In Progress', (ticketStats.byStatus.inprogress || 0).toString()],
        ['Resolved', (ticketStats.byStatus.resolved || 0).toString()],
        ['Closed', (ticketStats.byStatus.closed || 0).toString()]
      ];
      
      autoTable(doc, {
        startY: 45,
        head: [['Status', 'Count']],
        body: statsData,
        theme: 'grid',
        headStyles: { 
          halign: 'center',
          fillColor: [21, 67, 127],
          textColor: [255, 255, 255],
          fontSize: 12
        },
        bodyStyles: { 
          halign: 'center',
          fontSize: 10
        },
        margin: { left: 100, right: 100 },
        tableWidth: 'auto',
      });

      const finalStatsY = (doc as any).lastAutoTable.finalY + 10;
      
      if (adminStats.staffDetails.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(21, 67, 127);
        doc.text('Staff Performance', doc.internal.pageSize.width / 2, finalStatsY, { align: 'center' });
        
        const staffPerformanceData = adminStats.staffDetails.map(staff => [
          staff.name,
          staff.ticketsCount.toString(),
          staff.resolvedCount.toString(),
          `${staff.responseRate.toFixed(1)}%`,
          `${staff.averageResponseTime.toFixed(1)} hours`,
          staff.resolvedCount > 0 ? 
            `${((staff.resolvedCount / staff.ticketsCount) * 100).toFixed(1)}%` : 
            '0%'
        ]);
        
        autoTable(doc, {
          startY: finalStatsY + 5,
          head: [['Staff Member', 'Total Tickets', 'Resolved', 'Response Rate', 'Avg Response Time', 'Resolution Rate']],
          body: staffPerformanceData,
          theme: 'grid',
          headStyles: { 
            halign: 'center',
            fillColor: [21, 67, 127],
            textColor: [255, 255, 255],
            fontSize: 12
          },
          bodyStyles: { 
            halign: 'center',
            fontSize: 10
          },
        });
      }
      
      const staffTableY = (doc as any).lastAutoTable.finalY + 10;
      if (Object.keys(ticketStats.byBranch).length > 0) {
        const branchData = Object.entries(ticketStats.byBranch)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([branch, count]) => [branch, count.toString()]);
        
        doc.text('Ticket Distribution by Branch', doc.internal.pageSize.width / 2, staffTableY, { align: 'center' });
        
        autoTable(doc, {
          startY: staffTableY + 5,
          head: [['Branch', 'Ticket Count']],
          body: branchData,
          theme: 'grid',
          headStyles: { 
            halign: 'center',
            fillColor: [21, 67, 127],
            textColor: [255, 255, 255],
            fontSize: 12
          },
          bodyStyles: { 
            halign: 'center',
            fontSize: 10
          },
          margin: { left: 20, right: 20 },
          tableWidth: 'auto',
        });
      }
      
      const ticketsTitleY = (doc as any).lastAutoTable.finalY + 15 || staffTableY + 50;
      doc.setFontSize(14);
      doc.setTextColor(21, 67, 127);
      doc.text('Ticket Details with Responses', doc.internal.pageSize.width / 2, ticketsTitleY, { align: 'center' });
      
      let currentY = ticketsTitleY + 10;
      
      for (const ticket of tickets) {
        if (currentY > doc.internal.pageSize.height - 40) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(21, 67, 127);
        doc.text(`Ticket #${ticket.ticket_id}`, 15, currentY);
        
        const ticketDetailRows = [
          ['Employee ID', ticket.employee_id],
          ['Branch', ticket.branch],
          ['Status', statusLabelsEn[ticket.status] || ticket.status],
          ['Support Staff', ticket.assigned_to || 'Not Assigned'],
          ['Created Date', new Date(ticket.created_at || '').toLocaleDateString('en-US')]
        ];
        
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Field', 'Value']],
          body: ticketDetailRows,
          theme: 'grid',
          headStyles: { 
            halign: 'center',
            fillColor: [21, 67, 127],
            textColor: [255, 255, 255],
            fontSize: 10
          },
          bodyStyles: { 
            halign: 'center',
            fontSize: 8
          },
          margin: { left: 15, right: 15 },
          tableWidth: 'auto',
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 5;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Description:', 15, currentY);
        
        const splitDescription = doc.splitTextToSize(ticket.description, doc.internal.pageSize.width - 30);
        doc.text(splitDescription, 15, currentY + 5);
        
        currentY += 10 + (splitDescription.length * 5);
        
        const responses = ticketResponses[ticket.ticket_id] || [];
        if (responses.length > 0) {
          if (currentY > doc.internal.pageSize.height - 40) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFontSize(10);
          doc.setTextColor(21, 67, 127);
          doc.text('Responses:', 15, currentY);
          
          currentY += 5;
          
          const responseRows = responses.map(response => [
            response.is_admin ? (response.admin_name || 'Support Staff') : 'Employee',
            response.response,
            new Date(response.created_at).toLocaleDateString('en-US')
          ]);
          
          autoTable(doc, {
            startY: currentY,
            head: [['From', 'Response', 'Date']],
            body: responseRows,
            theme: 'grid',
            headStyles: { 
              halign: 'center',
              fillColor: [100, 100, 150],
              textColor: [255, 255, 255],
              fontSize: 9
            },
            bodyStyles: { 
              fontSize: 8
            },
            columnStyles: {
              0: { cellWidth: 30 },
              1: { cellWidth: 'auto' },
              2: { cellWidth: 25 }
            },
            margin: { left: 15, right: 15 },
          });
          
          currentY = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text('No responses for this ticket.', 15, currentY + 5);
          currentY += 15;
        }
      }
      
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const pageText = `Page ${i} of ${totalPages}`;
        doc.text(pageText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        
        doc.setTextColor(21, 67, 127);
        doc.text("Al-Wasl Technical Support", 20, doc.internal.pageSize.height - 10);
      }
      
      const dateRange = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
      doc.save(`Ticket_Report_${dateRange}.pdf`);
      
      toast({
        title: "تم بنجاح",
        description: "تم تصدير التقرير بصيغة PDF بنجاح",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء ملف PDF",
        variant: "destructive"
      });
    }
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/admin/tickets/${ticketId}`);
  };

  const prepareStatusChartData = () => {
    return Object.entries(ticketStats.byStatus).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count
    }));
  };

  const prepareBranchChartData = () => {
    return Object.entries(ticketStats.byBranch)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([branch, count]) => ({
        name: branch,
        count: count
      }));
  };

  const prepareStaffComparativeData = () => {
    if (!adminStats.staffDetails.length) return [];
    
    return adminStats.staffDetails.map(staff => ({
      name: staff.name,
      تذاكر_كلية: staff.ticketsCount,
      تم_حلها: staff.resolvedCount
    }));
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
          <div className="mt-6" ref={reportRef}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-sm text-gray-500">
                  تم العثور على {tickets.length} تذكرة خلال الفترة
                </span>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                {tickets.length > 0 && (
                  <>
                    <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                      <FileText size={16} />
                      <span>تصدير CSV</span>
                    </Button>
                    <Button variant="outline" onClick={exportToPDF} className="flex items-center gap-2">
                      <BarChart size={16} />
                      <span>تصدير PDF</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {tickets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-right mb-4 text-company">تفاصيل التذاكر والردود</h3>
                
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.ticket_id} className="shadow-md">
                      <CardHeader className="pb-2 bg-gray-50">
                        <CardTitle className="flex justify-between items-center">
                          <Button 
                            size="sm"
                            className="bg-company hover:bg-company-dark"
                            onClick={() => handleViewTicket(ticket.ticket_id)}
                          >
                            عرض التفاصيل
                          </Button>
                          <div className="text-right text-base text-company">
                            تذكرة رقم: {ticket.ticket_id}
                            <Badge className={`${statusColorMap[ticket.status] || 'bg-gray-100'} mr-2 px-3 py-1`}>
                              {statusLabels[ticket.status] || ticket.status}
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-1">
                            <p className="text-right text-gray-500 text-sm">الرقم الوظيفي</p>
                            <p className="text-right font-medium">{ticket.employee_id}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-right text-gray-500 text-sm">الفرع</p>
                            <p className="text-right font-medium">{ticket.branch}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-right text-gray-500 text-sm">موظف الدعم الفني</p>
                            <p className="text-right font-medium">{ticket.assigned_to || 'لم يتم التعيين'}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-right text-gray-500 text-sm mb-1">وصف المشكلة</p>
                          <p className="text-right p-3 bg-gray-50 rounded-md">{ticket.description}</p>
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="responses">
                            <AccordionTrigger className="text-right">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span>الردود ({(ticketResponses[ticket.ticket_id] || []).length})</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {ticketResponses[ticket.ticket_id]?.length > 0 ? (
                                <div className="space-y-3 pt-2">
                                  {ticketResponses[ticket.ticket_id].map((response, index) => (
                                    <div 
                                      key={index}
                                      className={`p-3 rounded-md ${
                                        response.is_admin 
                                          ? 'bg-blue-50 border-r-4 border-company ml-6' 
                                          : 'bg-gray-50 border-r-4 border-gray-300 mr-6'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">
                                          {new Date(response.created_at).toLocaleString('ar-SA')}
                                        </span>
                                        <span className="font-medium text-right">
                                          {response.is_admin 
                                            ? (response.admin_name || 'الدعم الفني') 
                                            : 'الموظف'}
                                        </span>
                                      </div>
                                      <p className="text-right">{response.response}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-center py-3 text-gray-500">لا توجد ردود لهذه التذكرة</p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {tickets.length === 0 && hasSearched && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-500">لا توجد تذاكر خلال الفترة المحددة</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;
