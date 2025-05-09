
import { AdminStats, TicketStats } from '@/hooks/useReportData';
import StatisticsCards from './StatisticsCards';
import StaffPerformanceChart from './StaffPerformanceChart';
import TicketsTable from './TicketsTable';

interface ReportContentProps {
  ticketStats: TicketStats;
  adminStats: AdminStats;
  tickets: any[];
  ticketResponses: Record<string, any[]>;
  startDate: Date;
  endDate: Date;
  prepareStaffComparativeData: () => any[];
}

const ReportContent: React.FC<ReportContentProps> = ({
  ticketStats,
  adminStats,
  tickets,
  ticketResponses,
  startDate,
  endDate,
  prepareStaffComparativeData
}) => {
  return (
    <>
      {/* Statistics cards */}
      <StatisticsCards
        ticketStats={ticketStats}
        startDate={startDate}
        endDate={endDate}
      />

      <div className="grid grid-cols-1 mb-4">
        {/* Staff performance comparison chart */}
        <StaffPerformanceChart
          adminStats={adminStats}
          prepareStaffComparativeData={prepareStaffComparativeData}
        />
      </div>
      
      {/* Tickets table with increased separation from charts */}
      <div className="mt-4 border-t pt-4">
        <h2 className="text-2xl font-bold mb-3 text-right">قائمة التذاكر</h2>
        <TicketsTable 
          tickets={tickets} 
          ticketResponses={ticketResponses} 
        />
      </div>
    </>
  );
};

export default ReportContent;
