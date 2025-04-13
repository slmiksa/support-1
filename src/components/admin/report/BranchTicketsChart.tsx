
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
        light: "#D4AF37",
        dark: "#B08C1A"
      }
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="text-right">توزيع التذاكر حسب الفروع</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 16,
                right: 16,
                bottom: 16,
                left: 16,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120} 
                textAnchor="end"
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
              <Bar dataKey="value" name="عدد التذاكر" fill="var(--color-value)" barSize={24} radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BranchTicketsChart;
