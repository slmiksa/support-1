
import { AdminStats, TicketStats } from '@/hooks/useReportData';
import StatisticsCards from './StatisticsCards';
import StaffPerformanceChart from './StaffPerformanceChart';
import TicketsTable from './TicketsTable';
import BranchTicketsChart from './BranchTicketsChart';

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Staff performance comparison chart */}
        <StaffPerformanceChart
          adminStats={adminStats}
          prepareStaffComparativeData={prepareStaffComparativeData}
        />
        
        {/* Branch tickets chart - made smaller */}
        <BranchTicketsChart branchStats={ticketStats.byBranch} />
      </div>
      
      {/* Tickets table */}
      <div className="mt-2">
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
