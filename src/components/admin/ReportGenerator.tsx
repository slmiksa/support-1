
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
    ticketResponses,
    prepareStaffComparativeData
  } = useReportData();

  const { exportToExcel } = useExportUtils({
    tickets,
    ticketStats,
    startDate,
    endDate,
    ticketResponses
  });

  return (
    <div className="space-y-6">
      <ReportControls
        startDate={startDate}
        endDate={endDate}
        period={period}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setPeriod={setPeriod}
        exportToExcel={exportToExcel}
      />
      
      <ReportContent 
        ticketStats={ticketStats}
        adminStats={adminStats}
        tickets={tickets}
        ticketResponses={ticketResponses}
        startDate={startDate}
        endDate={endDate}
        prepareStaffComparativeData={prepareStaffComparativeData}
      />
    </div>
  );
};

export default ReportGenerator;
