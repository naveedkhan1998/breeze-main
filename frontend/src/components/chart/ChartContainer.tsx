// components/chart/ChartContainer.tsx
import React, { useRef, useEffect, useState } from "react";
import { createChart, IChartApi } from "lightweight-charts";
import { useTheme } from "@/components/theme-provider";
import { useChart } from "./ChartContext";
import { useGetCandlesQuery } from "@/services/instrumentService";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartLegend } from "./ChartLegend";
import { ChartToolbar } from "./ChartToolbar";
import { getChartOptions, createSeries, formatDate } from "@/lib/chart-utils";
import { Candle } from "@/common-types";

export const ChartContainer: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const {
    instrument,
    timeframe,
    chartType,
    showVolume,
    indicators,
    selectedCandle,
    setSelectedCandle,
    autoRefresh,
  } = useChart();

  const [lastCandle, setLastCandle] = useState<Candle | null>(null);

  // Use your actual API with proper typing
  const { data, error, isLoading, refetch } = useGetCandlesQuery({
    id: instrument.id,
    tf: timeframe,
  });

  // Auto-refresh logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        refetch();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, refetch]);

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

  // Create and update chart when data or settings change
  useEffect(() => {
    if (!chartContainerRef.current || !data?.data?.length) return;

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
    });

    try {
      // Create series with all active indicators
      createSeries({
        chart,
        type: chartType,
        data: data.data,
        isDarkTheme,
        showVolume,
        indicators,
      });

      // Set last candle for the legend
      if (data.data.length > 0) {
        const lastIndex = data.data.length - 1;
        setLastCandle(data.data[lastIndex]);
        setSelectedCandle(data.data[lastIndex]);
      }

      // Add crosshair move handler to update selected candle
      chart.subscribeCrosshairMove((param) => {
        if (param.time && data?.data) {
          const paramTime = Number(param.time);
          const dataPoint: Candle | undefined = data.data.find(
            (candle: Candle) => {
              // Convert candle date to timestamp and compare
              return formatDate(candle.date) === paramTime;
            },
          );

          if (dataPoint) {
            setSelectedCandle(dataPoint);
          }
        } else if (!param.time) {
          // When crosshair leaves chart, show last candle
          setSelectedCandle(lastCandle);
        }
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
      console.error("Error creating chart:", e);
      // If chart creation fails, remove any partially created chart
      chart.remove();
      return () => {};
    }
  }, [
    data,
    chartType,
    isDarkTheme,
    indicators,
    showVolume,
    setSelectedCandle,
    lastCandle,
  ]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-3 w-[80%]">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="w-full h-72" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Failed to load chart data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="absolute inset-0 overflow-hidden border-0">
      <ChartToolbar />
      {selectedCandle && <ChartLegend data={selectedCandle} />}
      <div
        ref={chartContainerRef}
        className="absolute inset-0 top-[85px]" // Adjust top value based on toolbar and legend height
      />
    </Card>
  );
};
