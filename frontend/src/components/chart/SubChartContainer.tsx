// components/chart/SubChartContainer.tsx
import React, { useRef, useEffect } from "react";
import { createChart, IChartApi } from "lightweight-charts";
import { useTheme } from "@/components/theme-provider";
import { useChart, SubchartType } from "./ChartContext";
import { useGetCandlesQuery } from "@/services/instrumentService";
import { Card } from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getChartOptions, createIndicatorSeries } from "@/lib/chart-utils";

interface SubChartContainerProps {
  id: string;
  type: SubchartType;
}

export const SubChartContainer: React.FC<SubChartContainerProps> = ({
  id,
  type,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const {
    instrument,
    timeframe,
    selectedCandle,
    removeSubChart,
  } = useChart();

  // Use your actual API with proper typing
  const { data, error, isLoading } = useGetCandlesQuery({
    id: instrument.id,
    tf: timeframe,
  });

  // Create and update chart when data or settings change
  useEffect(() => {
    if (!chartContainerRef.current || !data?.data?.length || !type) return;

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Create the chart with theme-appropriate colors
    const chart = createChart(chartContainerRef.current, {
      ...getChartOptions(isDarkTheme),
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      // For subcharts, remove left and right price scales
      rightPriceScale: {
        visible: true,
        borderColor: isDarkTheme ? 'rgba(197, 203, 206, 0.3)' : 'rgba(197, 203, 206, 0.8)',
      },
      leftPriceScale: {
        visible: false,
      },
      // Overlay time scale for synchronization with main chart
      timeScale: {
        visible: false,
      },
      // Reduce margins for subcharts
      layout: {
        background: { color: isDarkTheme ? '#1E1E1E' : '#FFFFFF' },
        textColor: isDarkTheme ? '#D9D9D9' : '#191919',
      },
      grid: {
        vertLines: { color: isDarkTheme ? 'rgba(42, 46, 57, 0)' : 'rgba(42, 46, 57, 0)' },
        horzLines: { color: isDarkTheme ? 'rgba(42, 46, 57, 0.2)' : 'rgba(42, 46, 57, 0.2)' },
      },
    });

    try {
      // Create series for this specific indicator type
      createIndicatorSeries({
        chart,
        type,
        data: data.data,
        isDarkTheme,
      });

      // Store chart reference
      chartRef.current = chart;

      // Fit content
      chart.timeScale().fitContent();

      // Cleanup
      return () => {
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (e) {
      console.error(`Error creating ${type} subchart:`, e);
      // If chart creation fails, remove any partially created chart
      chart.remove();
      return () => {};
    }
  }, [data, type, isDarkTheme]);

  // Update chart dimensions when container is resized
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    // Create a ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(handleResize);
    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    // Handle window resize as well
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-2 w-[80%]">
          <Skeleton className="h-3 w-[60%]" />
          <Skeleton className="w-full h-20" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-2">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Failed to load {type} data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="relative h-full w-full overflow-hidden border-0">
      <div className="absolute top-1 right-1 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => removeSubChart(id)}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove {type} chart</span>
        </Button>
      </div>
      <div className="absolute top-1 left-2 z-10 text-xs font-medium text-muted-foreground">
        {type}
      </div>
      <div
        ref={chartContainerRef}
        className="absolute inset-0 pt-6" // Space for the title and close button
      />
    </Card>
  );
};