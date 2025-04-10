import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTicketStats, getAdminStats, getTicketsWithResolutionDetails } from '@/utils/ticketUtils';
import { format, startOfMonth, endOfMonth, sub } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart3, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as XLSX from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define interfaces for our state
interface TicketStats {
  total: number;
  byStatus: Record<string, number>;
  byBranch: Record<string, number>;
  byStaff: Record<string, number>;
}

interface AdminStats {
  staffDetails: Array<{
    id: string;
    name: string;
    ticketsCount: number;
    resolvedCount: number;
    responseCount: number;
    responseRate: number;
    averageResponseTime: number;
    statusDistribution: Record<string, number>;
  }>;
}

const ReportGenerator = () => {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [period, setPeriod] = useState<string>('month');
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketStats, setTicketStats] = useState<TicketStats>({ 
    total: 0, 
    byStatus: {}, 
    byBranch: {}, 
    byStaff: {} 
  });
  const [adminStats, setAdminStats] = useState<AdminStats>({ staffDetails: [] });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    updateDateRange(period);
  }, [period]);

  useEffect(() => {
    generateReport();
  }, [startDate, endDate]);

  const updateDateRange = (selectedPeriod: string) => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'today':
        setStartDate(new Date(now.setHours(0, 0, 0, 0)));
        setEndDate(new Date());
        break;
      case 'week':
        // Last 7 days
        setStartDate(sub(new Date(), { days: 6 }));
        setEndDate(new Date());
        break;
      case 'month':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'quarter':
        // Last 3 months
        setStartDate(sub(new Date(), { months: 3 }));
        setEndDate(new Date());
        break;
      case 'year':
        // Last year
        setStartDate(sub(new Date(), { years: 1 }));
        setEndDate(new Date());
        break;
      default:
        // Keep current selection for 'custom'
        break;
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // Get tickets
      const ticketsData = await getTicketsWithResolutionDetails(formattedStartDate, formattedEndDate);
      setTickets(ticketsData);
      
      // Get statistics
      const stats = await getTicketStats(formattedStartDate, formattedEndDate);
      setTicketStats(stats);
      
      // Get admin performance data
      const adminData = await getAdminStats(formattedStartDate, formattedEndDate);
      setAdminStats(adminData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const prepareStaffComparativeData = () => {
    if (!adminStats.staffDetails || adminStats.staffDetails.length === 0) {
      return [];
    }
    
    return adminStats.staffDetails.map(staff => ({
      name: staff.name,
      تذاكر_كلية: staff.ticketsCount,
      تم_حلها: staff.resolvedCount
    }));
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
        { header: 'تاريخ الإنشاء', key: 'created_at', width: 20 },
        { header: 'الموظف المعين', key: 'assigned_to', width: 20 },
      ];
      
      // Add data
      tickets.forEach(ticket => {
        worksheet.addRow({
          ticket_id: ticket.ticket_id,
          branch: ticket.branch,
          priority: ticket.priority,
          status: ticket.status,
          created_at: new Date(ticket.created_at).toLocaleString('ar-SA'),
          assigned_to: ticket.assigned_to || 'لم يتم التعيين',
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
      
      // Add tickets table
      const tableData = tickets.map(ticket => [
        ticket.ticket_id,
        ticket.branch,
        ticket.priority,
        ticket.status,
        new Date(ticket.created_at).toLocaleString('ar-SA'),
        ticket.assigned_to || 'لم يتم التعيين'
      ]);
      
      autoTable(doc, {
        head: [['رقم التذكرة', 'الفرع', 'الأولوية', 'الحالة', 'تاريخ الإنشاء', 'الموظف المعين']],
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

  return (
    <div className="space-y-6">
      {/* Controls for generating reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right text-base">إنشاء تقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:rtl:space-x-reverse">
            <div className="w-full md:w-1/3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">الشهر الحالي</SelectItem>
                  <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
                  <SelectItem value="year">آخر سنة</SelectItem>
                  <SelectItem value="custom">فترة مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {period === 'custom' && (
              <div className="flex flex-col md:flex-row md:space-x-4 md:rtl:space-x-reverse space-y-2 md:space-y-0">
                <div className="w-full md:w-1/2">
                  <DatePicker
                    date={startDate}
                    onChange={date => date && setStartDate(date)}
                    placeholder="تاريخ البداية"
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <DatePicker
                    date={endDate}
                    onChange={date => date && setEndDate(date)}
                    placeholder="تاريخ النهاية"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={exportToExcel}
            >
              <FileText className="h-4 w-4" />
              <span>تصدير Excel</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={exportToPDF}
            >
              <Download className="h-4 w-4" />
              <span>تصدير PDF</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-right text-base">حالة التذاكر</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              {Object.entries(ticketStats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{status}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: `${Math.round((count / ticketStats.total) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Tickets by branch */}
        {Object.keys(ticketStats.byBranch).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-right text-base">التذاكر حسب الفرع</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                {Object.entries(ticketStats.byBranch).map(([branch, count]) => (
                  <div key={branch} className="flex items-center justify-between">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{branch}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary" 
                          style={{ 
                            width: `${Math.round((count / ticketStats.total) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Total tickets card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-right text-base">إجمالي التذاكر</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-center h-24">
              <span className="text-4xl font-bold">{ticketStats.total}</span>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {format(startDate, 'yyyy-MM-dd')} إلى {format(endDate, 'yyyy-MM-dd')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff performance comparison chart - only show if data exists */}
      {adminStats.staffDetails.length > 0 && (
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-right text-base">مقارنة أداء الموظفين</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tickets table */}
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
                    <th className="p-2 font-medium">الموظف المعين</th>
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
                        <td className="p-2">{ticket.assigned_to || 'لم يتم التعيين'}</td>
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
    </div>
  );
};

export default ReportGenerator;
