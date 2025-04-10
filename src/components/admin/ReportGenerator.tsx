
import { useReportData } from '@/hooks/useReportData';
import { useExportUtils } from './report/ExportUtils';
import ReportControls from './report/ReportControls';
import ReportContent from './report/ReportContent';

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
      
      {/* Report content - statistics, charts, and tables */}
      <ReportContent 
        ticketStats={ticketStats}
        adminStats={adminStats}
        tickets={tickets}
        startDate={startDate}
        endDate={endDate}
        prepareStaffComparativeData={prepareStaffComparativeData}
      />
    </div>
  );
};

export default ReportGenerator;
