
import { useState, useRef } from 'react';
import { getTicketsByDateRange, getTicketStats, getAdminStats, SupportTicket } from '@/utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download, FileText, BarChart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

// Define ticket status labels in English for PDF export
const statusLabelsEn = {
  pending: 'Pending',
  open: 'Open',
  inprogress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

// Colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Staff performance levels
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

      // Get detailed admin statistics
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
      toast({
        title: "خطأ",
        description: "لا توجد بيانات للتصدير",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a new PDF document instance
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set font size for the header
      doc.setFontSize(18);
      doc.setTextColor(21, 67, 127); // Company blue color
      
      // Add title in English
      const title = `Ticket Report: ${format(startDate, 'yyyy/MM/dd')} - ${format(endDate, 'yyyy/MM/dd')}`;
      doc.text(title, doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Add the current date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const currentDate = `Report Date: ${format(new Date(), 'yyyy/MM/dd HH:mm')}`;
      doc.text(currentDate, doc.internal.pageSize.width - 20, 30, { align: 'right' });
      
      // Add statistics section header
      doc.setFontSize(14);
      doc.setTextColor(21, 67, 127);
      doc.text('Ticket Statistics', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      
      // Create statistics table in English
      const statsData = [
        ['Total Tickets', ticketStats.total.toString()],
        ['Pending', (ticketStats.byStatus.pending || 0).toString()],
        ['Open', (ticketStats.byStatus.open || 0).toString()],
        ['In Progress', (ticketStats.byStatus.inprogress || 0).toString()],
        ['Resolved', (ticketStats.byStatus.resolved || 0).toString()],
        ['Closed', (ticketStats.byStatus.closed || 0).toString()]
      ];
      
      // Add the statistics table
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

      // Get current Y position after the stats table
      const finalStatsY = (doc as any).lastAutoTable.finalY + 10;
      
      // Add staff performance section
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
        
        // Add staff performance table
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
      
      // Add branch distribution section if data exists
      const staffTableY = (doc as any).lastAutoTable.finalY + 10;
      if (Object.keys(ticketStats.byBranch).length > 0) {
        // Create top branches table
        const branchData = Object.entries(ticketStats.byBranch)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([branch, count]) => [branch, count.toString()]);
        
        // Add branch table title
        doc.text('Ticket Distribution by Branch', doc.internal.pageSize.width / 2, staffTableY, { align: 'center' });
        
        // Add branch distribution table
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
      
      // Add ticket details section header
      const ticketsTitleY = (doc as any).lastAutoTable.finalY + 15 || staffTableY + 50;
      doc.setFontSize(14);
      doc.setTextColor(21, 67, 127);
      doc.text('Ticket Details', doc.internal.pageSize.width / 2, ticketsTitleY, { align: 'center' });
      
      // Prepare ticket data for the table with English status labels
      const ticketRows = tickets.map(ticket => [
        ticket.ticket_id,
        ticket.employee_id,
        ticket.branch,
        statusLabelsEn[ticket.status] || ticket.status,
        ticket.assigned_to || 'Not Assigned',
        new Date(ticket.created_at || '').toLocaleDateString('en-US')
      ]);
      
      // Add the ticket details table
      autoTable(doc, {
        startY: ticketsTitleY + 5,
        head: [['Ticket ID', 'Employee ID', 'Branch', 'Status', 'Support Staff', 'Created Date']],
        body: ticketRows,
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
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 20 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 30 },
          5: { cellWidth: 25 }
        }
      });
      
      // Add footer with page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const pageText = `Page ${i} of ${totalPages}`;
        doc.text(pageText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        
        // Add the company name in the footer
        doc.setTextColor(21, 67, 127);
        doc.text("Al-Wasl Technical Support", 20, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
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

  // Prepare the data for the staff comparative chart
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

                {/* NEW SECTION: Staff Performance Analysis */}
                {adminStats.staffDetails.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-right mb-4 text-company">تحليل أداء فريق الدعم الفني</h3>
                    
                    {/* Staff Performance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {adminStats.staffDetails.map((staff, index) => {
                        const performance = getPerformanceLevel(staff.resolvedCount, staff.averageResponseTime);
                        return (
                          <Card key={index} className="shadow-md">
                            <CardHeader className="pb-2 bg-gray-50">
                              <CardTitle className="text-right text-base text-company">{staff.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <Badge className="bg-company text-white px-3 py-1">{staff.ticketsCount}</Badge>
                                  <span>إجمالي التذاكر</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <Badge className="bg-green-100 text-green-800 px-3 py-1">{staff.resolvedCount}</Badge>
                                  <span>تذاكر تم حلها</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1">{staff.responseRate.toFixed(1)}%</Badge>
                                  <span>معدل الاستجابة</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <Badge className="bg-purple-100 text-purple-800 px-3 py-1">{staff.averageResponseTime.toFixed(1)} ساعة</Badge>
                                  <span>متوسط وقت الاستجابة</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                  <Badge className={`${performance.class} px-3 py-1`}>{performance.label}</Badge>
                                  <span>تقييم الأداء</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    {/* Comparative Chart */}
                    <Card className="shadow-md">
                      <CardHeader className="pb-2 bg-gray-50">
                        <CardTitle className="text-right text-base text-company">مقارنة أداء فريق الدعم الفني</CardTitle>
                      </CardHeader>
                      <CardContent className="h-80 pt-4">
                        <ChartContainer
                          config={{
                            total: { color: "#15437f" },
                            resolved: { color: "#00C49F" },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={prepareStaffComparativeData()}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="تذاكر_كلية" fill="#15437f" name="إجمالي التذاكر" />
                              <Bar dataKey="تم_حلها" fill="#00C49F" name="تم حلها" />
                            </ReBarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                    
                    {/* Staff Status Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      {adminStats.staffDetails.map((staff, index) => (
                        <Card key={index} className="shadow-md">
                          <CardHeader className="pb-2 bg-gray-50">
                            <CardTitle className="text-right text-base text-company">
                              توزيع حالات تذاكر {staff.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="h-64 pt-4">
                            <ChartContainer>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={Object.entries(staff.statusDistribution).map(([status, count]) => ({
                                      name: statusLabels[status] || status,
                                      value: count
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={60}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => 
                                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                                    }
                                  >
                                    {Object.keys(staff.statusDistribution).map((status, i) => (
                                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                </PieChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Staff Ticket Lists */}
                {adminStats.staffDetails.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-right mb-4 text-company">تفاصيل تذاكر فريق الدعم الفني</h3>
                    
                    {adminStats.staffDetails.map((staff, index) => (
                      <Card key={index} className="shadow-md mb-4">
                        <CardHeader className="pb-2 bg-gray-50">
                          <CardTitle className="text-right text-base text-company">
                            تذاكر {staff.name} ({staff.ticketIds.length})
                          </CardTitle>
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
                                  <TableHead className="text-right font-bold text-company">تاريخ الإنشاء</TableHead>
                                  <TableHead className="text-right font-bold text-company">إجراءات</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tickets
                                  .filter(ticket => ticket.assigned_to === staff.name)
                                  .map((ticket) => (
                                    <TableRow key={ticket.id} className="hover:bg-gray-50">
                                      <TableCell className="font-medium text-right">{ticket.ticket_id}</TableCell>
                                      <TableCell className="text-right">{ticket.employee_id}</TableCell>
                                      <TableCell className="text-right">{ticket.branch}</TableCell>
                                      <TableCell className="text-right">
                                        <Badge className={`${statusColorMap[ticket.status] || 'bg-gray-100'} px-3 py-1`}>
                                          {statusLabels[ticket.status] || ticket.status}
                                        </Badge>
                                      </TableCell>
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
                    ))}
                  </div>
                )}

                {/* Ticket details table with improved styling */}
                <Card className="shadow-md">
                  <CardHeader className="pb-2 bg-gray-50">
                    <CardTitle className="text-right text-base text-company">تفاصيل جميع التذاكر</CardTitle>
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
