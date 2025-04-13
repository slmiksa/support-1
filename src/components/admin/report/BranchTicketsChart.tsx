
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface BranchTicketsChartProps {
  branchStats: Record<string, number>;
}

const BranchTicketsChart: React.FC<BranchTicketsChartProps> = ({ branchStats }) => {
  const data = Object.entries(branchStats).map(([branch, count]) => ({
    name: branch,
    value: count
  }));

  // Sort data from highest to lowest count
  data.sort((a, b) => b.value - a.value);

  const config = {
    value: {
      theme: {
        light: "#2B5A97",
        dark: "#2B5A97"
      }
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-right text-sm">توزيع التذاكر حسب الفروع</CardTitle>
      </CardHeader>
      <CardContent className="h-[180px] px-2 py-1">
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                bottom: 5,
                left: 5,
              }}
              barCategoryGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10 }} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                type="number"
                tick={{ fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent
                        active={active}
                        payload={payload}
                      />
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value" 
                name="عدد التذاكر" 
                fill="var(--color-value)" 
                barSize={16} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BranchTicketsChart;
