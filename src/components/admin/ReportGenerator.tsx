
import { useReportData } from '@/hooks/useReportData';
import { useExportUtils } from './report/ExportUtils';
import ReportControls from './report/ReportControls';
import StatisticsCards from './report/StatisticsCards';
import StaffPerformanceChart from './report/StaffPerformanceChart';
import TicketsTable from './report/TicketsTable';

const ReportGenerator = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    period,
    setPeriod,
    tickets,
    ticketStats,
    adminStats,
    prepareStaffComparativeData
  } = useReportData();

  const { exportToExcel, exportToPDF } = useExportUtils({
    tickets,
    ticketStats,
    startDate,
    endDate
  });

  return (
    <div className="space-y-6">
      {/* Controls for generating reports */}
      <ReportControls
        startDate={startDate}
        endDate={endDate}
        period={period}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setPeriod={setPeriod}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
      />
      
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
    </div>
  );
};

export default ReportGenerator;
