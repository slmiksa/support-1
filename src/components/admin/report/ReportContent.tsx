
import { AdminStats, TicketStats } from '@/hooks/useReportData';
import StatisticsCards from './StatisticsCards';
import StaffPerformanceChart from './StaffPerformanceChart';
import TicketsTable from './TicketsTable';

interface ReportContentProps {
  ticketStats: TicketStats;
  adminStats: AdminStats;
  tickets: any[];
  startDate: Date;
  endDate: Date;
  prepareStaffComparativeData: () => any[];
}

const ReportContent: React.FC<ReportContentProps> = ({
  ticketStats,
  adminStats,
  tickets,
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

      {/* Staff performance comparison chart */}
      <StaffPerformanceChart
        adminStats={adminStats}
        prepareStaffComparativeData={prepareStaffComparativeData}
      />
      
      {/* Tickets table */}
      <TicketsTable tickets={tickets} />
    </>
  );
};

export default ReportContent;
