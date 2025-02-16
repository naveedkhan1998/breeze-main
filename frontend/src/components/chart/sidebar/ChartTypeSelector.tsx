// components/chart/sidebar/ChartTypeSelector.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useChart } from "../ChartContext";
import { BarChart2, LineChart } from "lucide-react";

const CHART_TYPES = [
  {
    id: "Candlestick",
    name: "Candlestick",
    icon: BarChart2,
  },
  {
    id: "Line",
    name: "Line",
    icon: LineChart,
  },
] as const;

export const ChartTypeSelector: React.FC = () => {
  const { chartType, setChartType } = useChart();

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Chart Type</Label>
      <div className="grid grid-cols-2 gap-2">
        {CHART_TYPES.map(({ id, name, icon: Icon }) => (
          <Button
            key={id}
            variant={chartType === id ? "default" : "outline"}
            className="flex items-center justify-center h-10 gap-2"
            onClick={() => setChartType(id)}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
