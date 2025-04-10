import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, sub } from 'date-fns';
import { getTicketStats, getAdminStats, getTicketsWithResolutionDetails } from '@/utils/ticketUtils';

export interface TicketStats {
  total: number;
  byStatus: Record<string, number>;
  byBranch: Record<string, number>;
  byStaff: Record<string, number>;
}

export interface AdminStats {
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

export const useReportData = () => {
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

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    period,
    setPeriod,
    tickets,
    ticketStats,
    adminStats,
    isGenerating,
    updateDateRange,
    generateReport,
    prepareStaffComparativeData
  };
};
