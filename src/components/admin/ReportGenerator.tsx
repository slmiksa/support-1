
import { useState, useRef } from 'react';
import { getTicketsByDateRange, getTicketStats, SupportTicket } from '@/utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download, FileText, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.svg';

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

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
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
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);

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
      
      // Get ticket statistics
      const stats = await getTicketStats(
        startDate.toISOString(),
        adjustedEndDate.toISOString()
      );
      setTicketStats(stats);
      
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
      'موظف الدعم الفني',
      'تاريخ الإنشاء',
      'تاريخ آخر تحديث'
    ];

    const csvContent = tickets.map(ticket => [
      ticket.ticket_id,
      ticket.employee_id,
      ticket.branch,
      ticket.anydesk_number || '',
      ticket.extension_number || '',
      `"${ticket.description.replace(/"/g, '""')}"`,
      statusLabels[ticket.status] || ticket.status,
      ticket.assigned_to || 'لم يتم التعيين',
      new Date(ticket.created_at || '').toLocaleDateString('ar-SA'),
      new Date(ticket.updated_at || '').toLocaleDateString('ar-SA')
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

  const exportToPDF = () => {
    if (tickets.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }

    try {
      // Create a new PDF document instance with proper options for Arabic support
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true
      });
      
      // Import the Arabic font (Amiri)
      doc.addFont('https://cdn.jsdelivr.net/npm/amiri-font@1.0.0/amiri/Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFont('https://cdn.jsdelivr.net/npm/amiri-font@1.0.0/amiri/Amiri-Bold.ttf', 'Amiri', 'bold');
      
      // Set right-to-left mode for Arabic text
      doc.setR2L(true);
      
      // Add company logo
      const imgData = logo;
      doc.addImage(imgData, 'SVG', 20, 10, 40, 15);
      
      // Set fonts for Arabic
      doc.setFont('Amiri', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(21, 67, 127); // Company blue color
      
      // Add title
      const title = `تقرير التذاكر: ${format(startDate, 'yyyy/MM/dd', { locale: ar })} - ${format(endDate, 'yyyy/MM/dd', { locale: ar })}`;
      doc.text(title, doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Add the current date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const currentDate = `تاريخ التقرير: ${format(new Date(), 'yyyy/MM/dd HH:mm', { locale: ar })}`;
      doc.text(currentDate, doc.internal.pageSize.width - 20, 30, { align: 'right' });
      
      // Add statistics section header
      doc.setFont('Amiri', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(21, 67, 127);
      doc.text('إحصائيات التذاكر', doc.internal.pageSize.width / 2, 35, { align: 'center' });
      
      // Create statistics table
      const statsData = [
        ['إجمالي التذاكر', ticketStats.total.toString()],
        ['قيد الانتظار', (ticketStats.byStatus.pending || 0).toString()],
        ['مفتوحة', (ticketStats.byStatus.open || 0).toString()],
        ['جاري المعالجة', (ticketStats.byStatus.inprogress || 0).toString()],
        ['تم الحل', (ticketStats.byStatus.resolved || 0).toString()],
        ['مغلقة', (ticketStats.byStatus.closed || 0).toString()]
      ];
      
      // Add the statistics table
      autoTable(doc, {
        startY: 40,
        head: [['الحالة', 'العدد']],
        body: statsData,
        theme: 'grid',
        headStyles: { 
          halign: 'center',
          fillColor: [21, 67, 127],
          font: 'Amiri',
          fontStyle: 'bold'
        },
        bodyStyles: { 
          halign: 'center',
          font: 'Amiri'
        },
        margin: { left: 100, right: 100 },
        tableWidth: 'auto'
      });

      // Get current Y position after the stats table
      const finalStatsY = (doc as any).lastAutoTable.finalY + 10;
      
      // Add charts section
      if (Object.keys(ticketStats.byStatus).length > 0) {
        // Create a new div element for the status chart
        const chartDiv = document.createElement('div');
        chartDiv.style.width = '400px';
        chartDiv.style.height = '300px';
        chartDiv.style.position = 'absolute';
        chartDiv.style.top = '-9999px';
        document.body.appendChild(chartDiv);
        
        // Prepare the chart data
        const chartData = Object.entries(ticketStats.byStatus).map(([status, count]) => ({
          name: statusLabels[status] || status,
          value: count
        }));
        
        // Create a PieChart in the div
        const renderChart = () => {
          return (
            <PieChart width={400} height={300}>
              <Pie
                data={chartData}
                cx={200}
                cy={150}
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          );
        };
        
        // Add chart title
        doc.text('توزيع حالات التذاكر', doc.internal.pageSize.width / 2, finalStatsY, { align: 'center' });
        
        // Add branch distribution section if data exists
        if (Object.keys(ticketStats.byBranch).length > 0) {
          // Create top branches table
          const branchData = Object.entries(ticketStats.byBranch)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([branch, count]) => [branch, count.toString()]);
          
          // Add branch distribution table
          autoTable(doc, {
            startY: finalStatsY + 5,
            head: [['الفرع', 'عدد التذاكر']],
            body: branchData,
            theme: 'grid',
            headStyles: { 
              halign: 'center',
              fillColor: [21, 67, 127],
              font: 'Amiri',
              fontStyle: 'bold'
            },
            bodyStyles: { 
              halign: 'center',
              font: 'Amiri'
            },
            margin: { left: 20, right: doc.internal.pageSize.width / 2 + 10 },
            tableWidth: 'auto'
          });
        }
        
        // Clean up
        document.body.removeChild(chartDiv);
      }
      
      // Add ticket details section header
      const ticketsTitleY = (doc as any).lastAutoTable.finalY + 10 || finalStatsY + 50;
      doc.setFont('Amiri', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(21, 67, 127);
      doc.text('تفاصيل التذاكر', doc.internal.pageSize.width / 2, ticketsTitleY, { align: 'center' });
      
      // Prepare ticket data for the table
      const ticketRows = tickets.map(ticket => [
        ticket.ticket_id,
        ticket.employee_id,
        ticket.branch,
        statusLabels[ticket.status] || ticket.status,
        ticket.assigned_to || 'لم يتم التعيين',
        new Date(ticket.created_at || '').toLocaleDateString('ar-SA')
      ]);
      
      // Add the ticket details table
      autoTable(doc, {
        startY: ticketsTitleY + 5,
        head: [['رقم التذكرة', 'الرقم الوظيفي', 'الفرع', 'الحالة', 'موظف الدعم', 'تاريخ الإنشاء']],
        body: ticketRows,
        theme: 'grid',
        headStyles: { 
          halign: 'center',
          fillColor: [21, 67, 127],
          font: 'Amiri',
          fontStyle: 'bold'
        },
        bodyStyles: { 
          halign: 'center',
          font: 'Amiri'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 35 },
          5: { cellWidth: 30 }
        }
      });
      
      // Add footer with page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('Amiri', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const pageText = `صفحة ${i} من ${totalPages}`;
        doc.text(pageText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        
        // Add the company name in the footer
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(21, 67, 127);
        doc.text("الوصل لحلول الدعم الفني", 20, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      const dateRange = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
      doc.save(`تقرير_التذاكر_${dateRange}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("حدث خطأ أثناء إنشاء ملف PDF");
    }
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/admin/tickets/${ticketId}`);
  };

  // Prepare chart data for status distribution
  const prepareStatusChartData = () => {
    return Object.entries(ticketStats.byStatus).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count
    }));
  };

  // Prepare chart data for branch distribution
  const prepareBranchChartData = () => {
    return Object.entries(ticketStats.byBranch)
      .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
      .slice(0, 5) // Take top 5 branches
      .map(([branch, count]) => ({
        name: branch,
        count: count
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
              <div className="mb-8">
                <h3 className="text-lg font-medium text-right mb-4 text-company">إحصائيات التذاكر</h3>
                
                {/* Improved layout: Stats and Charts in separate boxes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Left Column - Statistics */}
                  <div className="space-y-6">
                    {/* Ticket status statistics */}
                    <Card className="shadow-md">
                      <CardHeader className="pb-2 bg-gray-50">
                        <CardTitle className="text-right text-base text-company">توزيع حالات التذاكر</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b">
                            <Badge className="bg-company text-white px-3 py-1">{ticketStats.total}</Badge>
                            <span className="font-medium">إجمالي التذاكر</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge className={`${statusColorMap.pending} px-3 py-1`}>{ticketStats.byStatus.pending || 0}</Badge>
                            <span>قيد الانتظار</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge className={`${statusColorMap.open} px-3 py-1`}>{ticketStats.byStatus.open || 0}</Badge>
                            <span>مفتوحة</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge className={`${statusColorMap.inprogress} px-3 py-1`}>{ticketStats.byStatus.inprogress || 0}</Badge>
                            <span>جاري المعالجة</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge className={`${statusColorMap.resolved} px-3 py-1`}>{ticketStats.byStatus.resolved || 0}</Badge>
                            <span>تم الحل</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge className={`${statusColorMap.closed} px-3 py-1`}>{ticketStats.byStatus.closed || 0}</Badge>
                            <span>مغلقة</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Staff distribution */}
                    {Object.keys(ticketStats.byStaff).length > 0 && (
                      <Card className="shadow-md">
                        <CardHeader className="pb-2 bg-gray-50">
                          <CardTitle className="text-right text-base text-company">موظفي الدعم الفني الأكثر نشاطًا</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="text-right font-bold text-company">اسم الموظف</TableHead>
                                <TableHead className="text-right font-bold text-company">عدد التذاكر المعالجة</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(ticketStats.byStaff)
                                .sort((a, b) => b[1] - a[1])
                                .map(([staff, count]) => (
                                  <TableRow key={staff}>
                                    <TableCell className="text-right font-medium">{staff}</TableCell>
                                    <TableCell className="text-right">{count}</TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Right Column - Charts */}
                  <div className="space-y-6">
                    {/* Pie chart for ticket status distribution */}
                    <Card className="shadow-md">
                      <CardHeader className="pb-2 bg-gray-50">
                        <CardTitle className="text-right text-base text-company">توزيع حالات التذاكر</CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 pt-4">
                        <ChartContainer
                          config={{
                            status1: { color: "#FFBB28" },  // pending
                            status2: { color: "#0088FE" },  // open
                            status3: { color: "#8884d8" },  // inprogress
                            status4: { color: "#00C49F" },  // resolved
                            status5: { color: "#999999" },  // closed
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={prepareStatusChartData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {prepareStatusChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                    
                    {/* Branch distribution chart */}
                    {Object.keys(ticketStats.byBranch).length > 0 && (
                      <Card className="shadow-md">
                        <CardHeader className="pb-2 bg-gray-50">
                          <CardTitle className="text-right text-base text-company">توزيع التذاكر حسب الفروع</CardTitle>
                        </CardHeader>
                        <CardContent className="h-72 pt-4">
                          <ChartContainer
                            config={{
                              branch: { color: "#15437f" },
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <ReBarChart data={prepareBranchChartData()} layout="vertical">
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip formatter={(value) => [`${value} تذكرة`, '']} />
                                <Bar dataKey="count" name="عدد التذاكر" fill="#15437f" />
                              </ReBarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Ticket details table with improved styling */}
                <Card className="shadow-md">
                  <CardHeader className="pb-2 bg-gray-50">
                    <CardTitle className="text-right text-base text-company">تفاصيل التذاكر</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="rounded-md overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="text-right font-bold text-company">رقم التذكرة</TableHead>
                            <TableHead className="text-right font-bold text-company">الرقم الوظيفي</TableHead>
                            <TableHead className="text-right font-bold text-company">الفرع</TableHead>
                            <TableHead className="text-right font-bold text-company">الحالة</TableHead>
                            <TableHead className="text-right font-bold text-company">موظف الدعم</TableHead>
                            <TableHead className="text-right font-bold text-company">تاريخ الإنشاء</TableHead>
                            <TableHead className="text-right font-bold text-company">إجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tickets.map((ticket) => (
                            <TableRow key={ticket.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-right">{ticket.ticket_id}</TableCell>
                              <TableCell className="text-right">{ticket.employee_id}</TableCell>
                              <TableCell className="text-right">{ticket.branch}</TableCell>
                              <TableCell className="text-right">
                                <Badge className={`${statusColorMap[ticket.status] || 'bg-gray-100'} px-3 py-1`}>
                                  {statusLabels[ticket.status] || ticket.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{ticket.assigned_to || 'لم يتم التعيين'}</TableCell>
                              <TableCell className="text-right">
                                {new Date(ticket.created_at || '').toLocaleDateString('ar-SA')}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm"
                                  className="bg-company hover:bg-company-dark"
                                  onClick={() => handleViewTicket(ticket.ticket_id)}
                                >
                                  عرض التفاصيل
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
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
