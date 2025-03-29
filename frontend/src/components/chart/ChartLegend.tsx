// components/chart/ChartLegend.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { useChart } from "./ChartContext";
import { formatPrice, formatVolume } from "@/lib/chart-utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Candle } from "@/common-types";
import { Badge } from "@/components/ui/badge";

interface ChartLegendProps {
  data: Candle;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ data }) => {
  const { instrument, timeframe } = useChart();
  const change = ((data.close - data.open) / data.open) * 100;
  const isPositive = change >= 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="absolute z-10 max-w-xs p-3 border shadow-lg top-12 left-4 bg-card/90 backdrop-blur-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate">
              {instrument.exchange_code}
            </h3>
            <Badge variant="outline" className="text-xs">
              {timeframe}m
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(data.date)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Open</span>
            <p className="text-sm font-medium">{formatPrice(data.open)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">High</span>
            <p className="text-sm font-medium">{formatPrice(data.high)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Low</span>
            <p className="text-sm font-medium">{formatPrice(data.low)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Close</span>
            <p className="text-sm font-medium">{formatPrice(data.close)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Volume</span>
            <p className="text-sm font-medium">
              {formatVolume(data.volume ?? 0)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Change</span>
            <p
              className={`text-sm font-medium flex items-center gap-1 ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {Math.abs(change).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
