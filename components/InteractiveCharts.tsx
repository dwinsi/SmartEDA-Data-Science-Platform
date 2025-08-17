import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

export interface DemoChartProps {
  demoData?: Array<{ Category: string; Value: number }>;
}

export const InteractiveCharts: React.FC<DemoChartProps> = ({ demoData }) => {
  if (demoData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 size={20} /> Demo Dataset Bar Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demoData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Value" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }
  return null;
};