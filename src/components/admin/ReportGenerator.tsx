
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
import { Calendar as CalendarIcon, Download, FileText, BarChart, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Workbook } from 'exceljs';
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

  const exportToExcel = async () => {
    if (tickets.length === 0) {
      toast({
        title: "خطأ",
        description: 'لا توجد بيانات للتصدير',
        variant: "destructive"
      });
      return;
    }

    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('تقرير التذاكر');
      
      worksheet.columns = [
        { header: 'رقم التذكرة', key: 'ticketId', width: 15 },
        { header: 'الرقم الوظيفي', key: 'employeeId', width: 15 },
        { header: 'الفرع', key: 'branch', width: 20 },
        { header: 'رقم Anydesk', key: 'anydeskNumber', width: 15 },
        { header: 'رقم التحويلة', key: 'contactNumber', width: 15 },
        { header: 'الوصف', key: 'description', width: 40 },
        { header: 'الحالة', key: 'status', width: 15 },
        { header: 'موظف الدعم الفني', key: 'supportStaff', width: 20 },
        { header: 'تاريخ الإنشاء', key: 'createdAt', width: 20 },
        { header: 'تاريخ آخر تحديث', key: 'updatedAt', width: 20 },
        { header: 'الردود', key: 'responses', width: 60 }
      ];
      
      worksheet.getRow(1).font = { bold: true };
      
      tickets.forEach(ticket => {
        const responses = ticketResponses[ticket.ticket_id] || [];
        const responsesText = responses.map(r => 
          `${r.is_admin ? (r.admin_name || 'الدعم الفني') : 'الموظف'}: ${r.response} (${format(new Date(r.created_at), 'yyyy-MM-dd HH:mm')})`
        ).join(' | ');
        
        // يستخدم حقل Contact_Number من custom_fields إذا كان موجودًا أو رقم التحويلة كبديل
        const contactNumber = ticket.custom_fields && ticket.custom_fields.Contact_Number 
          ? ticket.custom_fields.Contact_Number 
          : ticket.extension_number || '';
        
        console.log(`Ticket ${ticket.ticket_id} contact number: ${contactNumber}, custom fields:`, ticket.custom_fields);
        
        worksheet.addRow({
          ticketId: ticket.ticket_id,
          employeeId: ticket.employee_id,
          branch: ticket.branch,
          anydeskNumber: ticket.anydesk_number || '',
          contactNumber: contactNumber,
          description: ticket.description,
          status: statusLabels[ticket.status] || ticket.status,
          supportStaff: ticket.assigned_to || 'لم يتم التعيين',
          createdAt: format(new Date(ticket.created_at), 'yyyy-MM-dd HH:mm'),
          updatedAt: ticket.updated_at ? format(new Date(ticket.updated_at), 'yyyy-MM-dd HH:mm') : '',
          responses: responsesText
        });
      });
      
      const statsSheet = workbook.addWorksheet('إحصائيات');
      
      statsSheet.addRow(['إحصائيات حالة التذاكر']);
      statsSheet.addRow(['الحالة', 'العدد']);
      statsSheet.getRow(1).font = { bold: true };
      statsSheet.getRow(2).font = { bold: true };
      
      Object.entries(ticketStats.byStatus).forEach(([status, count]) => {
        statsSheet.addRow([statusLabels[status] || status, count]);
      });
      
      statsSheet.addRow([]);
      
      if (adminStats.staffDetails.length > 0) {
        statsSheet.addRow(['إحصائيات أداء الموظفين']);
        statsSheet.addRow(['الموظف', 'عدد التذاكر', 'تم الحل', 'نسبة الاستجابة', 'متوسط وقت الاستجابة (ساعة)', 'معدل الحل']);
        statsSheet.getRow(statsSheet.rowCount - 1).font = { bold: true };
        statsSheet.getRow(statsSheet.rowCount).font = { bold: true };
        
        adminStats.staffDetails.forEach(staff => {
          statsSheet.addRow([
            staff.name,
            staff.ticketsCount,
            staff.resolvedCount,
            `${staff.responseRate.toFixed(1)}%`,
            staff.averageResponseTime.toFixed(1),
            staff.resolvedCount > 0 ? 
              `${((staff.resolvedCount / staff.ticketsCount) * 100).toFixed(1)}%` : 
              '0%'
          ]);
        });
      }
      
      statsSheet.addRow([]);
      
      if (Object.keys(ticketStats.byBranch).length > 0) {
        statsSheet.addRow(['توزيع التذاكر حسب الفرع']);
        statsSheet.addRow(['الفرع', 'عدد التذاكر']);
        statsSheet.getRow(statsSheet.rowCount - 1).font = { bold: true };
        statsSheet.getRow(statsSheet.rowCount).font = { bold: true };
        
        Object.entries(ticketStats.byBranch)
          .sort((a, b) => b[1] - a[1])
          .forEach(([branch, count]) => {
            statsSheet.addRow([branch, count]);
          });
      }
      
      const buffer = await workbook.xlsx.writeBuffer();
      
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const dateRange = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
      link.setAttribute('href', url);
      link.setAttribute('download', `تقرير_التذاكر_${dateRange}.xlsx`);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم بنجاح",
        description: "تم تصدير التقرير إلى Excel بنجاح",
      });
    } catch (error) {
      console.error("Excel generation error:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء ملف Excel",
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
                      format(startDate, 'yyyy-MM-dd')
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
                      format(endDate, 'yyyy-MM-dd')
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
                  <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>تصدير Excel</span>
                  </Button>
                )}
              </div>
            </div>

            {tickets.length > 0 && ticketStats.total > 0 && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-right text-base">توزيع التذاكر حسب الحالة</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareStatusChartData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareStatusChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-right text-base">مقارنة أداء الموظفين</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart
                          data={prepareStaffComparativeData()}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="تذاكر_كلية" fill="#8884d8" />
                          <Bar dataKey="تم_حلها" fill="#82ca9d" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {Object.keys(ticketStats.byBranch).length > 0 && (
                  <Card className="col-span-1 md:col-span-3">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-right text-base">توزيع التذاكر حسب الفروع (أعلى 5 فروع)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <ReBarChart
                            data={prepareBranchChartData()}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="عدد التذاكر" fill="#00C49F" />
                          </ReBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-1">
                            <p className="text-right text-gray-500 text-sm">رقم Anydesk</p>
                            <p className="text-right font-medium">{ticket.anydesk_number || 'غير محدد'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-right text-gray-500 text-sm">رقم التحويلة</p>
                            <p className="text-right font-medium">{ticket.custom_fields && ticket.custom_fields.Contact_Number 
                              ? ticket.custom_fields.Contact_Number 
                              : ticket.extension_number || 'غير محدد'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-right text-gray-500 text-sm">تاريخ الإنشاء</p>
                            <p className="text-right font-medium">{format(new Date(ticket.created_at), 'yyyy-MM-dd HH:mm')}</p>
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
                                          {format(new Date(response.created_at), 'yyyy-MM-dd HH:mm')}
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
