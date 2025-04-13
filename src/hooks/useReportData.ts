import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, sub } from 'date-fns';
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
        setStartDate(new Date(now.setHours(0, 0, 0, 0)));
        setEndDate(new Date());
        break;
      case 'week':
        setStartDate(sub(new Date(), { days: 6 }));
        setEndDate(new Date());
        break;
      case 'month':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'quarter':
        setStartDate(sub(new Date(), { months: 3 }));
        setEndDate(new Date());
        break;
      case 'year':
        setStartDate(sub(new Date(), { years: 1 }));
        setEndDate(new Date());
        break;
      default:
        break;
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
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
