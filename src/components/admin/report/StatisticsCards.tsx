
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketStats } from '@/hooks/useReportData';
import { getStatusLabel } from '@/utils/ticketStatusUtils';

interface StatisticsCardsProps {
  ticketStats: TicketStats;
  startDate: Date;
  endDate: Date;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  ticketStats,
  startDate,
  endDate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Status distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-right text-base">حالة التذاكر</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-4">
            {Object.entries(ticketStats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{getStatusLabel(status)}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ 
                        width: `${Math.round((count / ticketStats.total) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Total tickets card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-right text-base">إجمالي التذاكر</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center justify-center h-24">
            <span className="text-4xl font-bold">{ticketStats.total}</span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {format(startDate, 'yyyy-MM-dd')} إلى {format(endDate, 'yyyy-MM-dd')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
