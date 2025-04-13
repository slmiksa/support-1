
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, sub, endOfDay, startOfDay } from 'date-fns';
import { getTicketStats, getAdminStats, getTicketsWithResolutionDetails, getAllTicketResponses } from '@/utils/ticketUtils';

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
  const [ticketResponses, setTicketResponses] = useState<Record<string, any[]>>({});

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
        // بداية اليوم (00:00:00)
        setStartDate(startOfDay(now));
        // نهاية اليوم (23:59:59)
        setEndDate(endOfDay(now));
        break;
      case 'week':
        setStartDate(sub(now, { days: 6 }));
        setEndDate(endOfDay(now));
        break;
      case 'month':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'quarter':
        setStartDate(sub(now, { months: 3 }));
        setEndDate(endOfDay(now));
        break;
      case 'year':
        setStartDate(sub(now, { years: 1 }));
        setEndDate(endOfDay(now));
        break;
      default:
        break;
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // تنسيق التواريخ بشكل كامل بما في ذلك الوقت
      const formattedStartDate = format(startDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd\'T\'HH:mm:ss');
      
      console.log(`Fetching tickets from ${formattedStartDate} to ${formattedEndDate}`);
      
      const ticketsData = await getTicketsWithResolutionDetails(formattedStartDate, formattedEndDate);
      
      const ticketIds = ticketsData.map(ticket => ticket.ticket_id);
      const responses = await getAllTicketResponses(ticketIds);
      setTicketResponses(responses);
      
      const enhancedTickets = ticketsData.map(ticket => {
        const ticketResponses = responses[ticket.ticket_id] || [];
        const firstAdminResponse = ticketResponses.find(resp => resp.is_admin);
        
        return {
          ...ticket,
          first_responder: firstAdminResponse ? firstAdminResponse.admin_name : 'لم يتم الرد'
        };
      });
      
      setTickets(enhancedTickets);
      
      const stats = await getTicketStats(formattedStartDate, formattedEndDate);
      setTicketStats(stats);
      
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
    ticketResponses,
    updateDateRange,
    generateReport,
    prepareStaffComparativeData
  };
};
