
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface BranchTicketsChartProps {
  branchStats: Record<string, number>;
}

const COLORS = ['#2B5A97', '#4D7CC3', '#7399D1', '#9CB7DF', '#C5D5ED'];

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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BranchTicketsChart;
