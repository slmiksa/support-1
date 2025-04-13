
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Staff performance comparison chart */}
        <StaffPerformanceChart
          adminStats={adminStats}
          prepareStaffComparativeData={prepareStaffComparativeData}
        />
        
        {/* Branch tickets chart */}
        <BranchTicketsChart branchStats={ticketStats.byBranch} />
      </div>
      
      {/* Tickets table */}
      <TicketsTable 
        tickets={tickets} 
        ticketResponses={ticketResponses} 
      />
    </>
  );
};

export default ReportContent;
