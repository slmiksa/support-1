
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface BranchTicketsChartProps {
  branchStats: Record<string, number>;
}

// Gold color palette
const COLORS = ['#D4AF37', '#B08C1A', '#CFB53B', '#EADDCA', '#F0E68C'];

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
        dark: "#D4AF37"
      }
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-1">
        <CardTitle className="text-right text-sm">توزيع التذاكر حسب الفروع</CardTitle>
      </CardHeader>
      <CardContent className="h-[100px] px-2">
        <ChartContainer config={config}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={10}
                outerRadius={30}
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
