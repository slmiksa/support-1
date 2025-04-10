
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminStats } from '@/hooks/useReportData';

interface StaffPerformanceChartProps {
  adminStats: AdminStats;
  prepareStaffComparativeData: () => any[];
}

const StaffPerformanceChart: React.FC<StaffPerformanceChartProps> = ({
  adminStats,
  prepareStaffComparativeData
}) => {
  if (adminStats.staffDetails.length === 0) {
    return null;
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-right text-base">مقارنة أداء الموظفين</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={prepareStaffComparativeData()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="تذاكر_كلية" fill="#8884d8" />
              <Bar dataKey="تم_حلها" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffPerformanceChart;
