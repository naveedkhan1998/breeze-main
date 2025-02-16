// components/chart/ChartContainer.tsx
import React, { useRef, useEffect } from "react";
import { createChart, IChartApi, Time, ISeriesApi } from "lightweight-charts";
import { useTheme } from "@/components/theme-provider";
import { useChart } from "./ChartContext";
import { useGetCandlesQuery } from "@/services/instrumentService";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  formatDate,
  calculateMA,
  calculateRSI,
  calculateBollingerBands,
  calculateMACD,
} from "@/lib/indicators";

export const ChartContainer: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<{ [key: string]: ISeriesApi<any> }>({});

  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const { instrument, timeframe, chartType, indicators } = useChart();

  const { data, error, isLoading } = useGetCandlesQuery({
    id: instrument.id,
    tf: timeframe,
  });

  useEffect(() => {
    if (!chartContainerRef.current || !data) return;

    // Create the main chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: isDarkTheme ? "#18181b" : "#ffffff" },
        textColor: isDarkTheme ? "#e4e4e7" : "#27272a",
      },
      grid: {
        vertLines: { color: isDarkTheme ? "#27272a" : "#e4e4e7" },
        horzLines: { color: isDarkTheme ? "#27272a" : "#e4e4e7" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDarkTheme ? "#6b7280" : "#9ca3af",
          width: 1,
          style: 1,
          labelBackgroundColor: isDarkTheme ? "#18181b" : "#ffffff",
        },
        horzLine: {
          color: isDarkTheme ? "#6b7280" : "#9ca3af",
          width: 1,
          style: 1,
          labelBackgroundColor: isDarkTheme ? "#18181b" : "#ffffff",
        },
      },
    });

    // Format candle data
    const formattedData = data.data.map((candle) => ({
      time: formatDate(candle.date) as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    // Create main price series
    const mainSeries =
      chartType === "Candlestick"
        ? chart.addCandlestickSeries({
            upColor: isDarkTheme ? "#22c55e" : "#16a34a",
            downColor: isDarkTheme ? "#ef4444" : "#dc2626",
            borderVisible: false,
            wickUpColor: isDarkTheme ? "#22c55e" : "#16a34a",
            wickDownColor: isDarkTheme ? "#ef4444" : "#dc2626",
          })
        : chart.addLineSeries({
            color: isDarkTheme ? "#3b82f6" : "#2563eb",
            lineWidth: 2,
          });

    mainSeries.setData(formattedData);
    seriesRef.current.main = mainSeries;

    // Add indicators
    if (indicators.ma) {
      const maSeries = chart.addLineSeries({
        color: isDarkTheme ? "#eab308" : "#ca8a04",
        lineWidth: 1,
      });
      maSeries.setData(calculateMA(formattedData));
      seriesRef.current.ma = maSeries;
    }

    if (indicators.bollinger) {
      const { upper, middle, lower } = calculateBollingerBands(formattedData);

      const upperSeries = chart.addLineSeries({
        color: isDarkTheme ? "#22c55e80" : "#16a34a80",
        lineWidth: 1,
      });
      const middleSeries = chart.addLineSeries({
        color: isDarkTheme ? "#6b728080" : "#71717a80",
        lineWidth: 1,
      });
      const lowerSeries = chart.addLineSeries({
        color: isDarkTheme ? "#ef444480" : "#dc262680",
        lineWidth: 1,
      });

      upperSeries.setData(upper);
      middleSeries.setData(middle);
      lowerSeries.setData(lower);

      seriesRef.current.bbupper = upperSeries;
      seriesRef.current.bbmiddle = middleSeries;
      seriesRef.current.bblower = lowerSeries;
    }

    if (indicators.rsi) {
      const rsiSeries = chart.addLineSeries({
        color: isDarkTheme ? "#8b5cf6" : "#7c3aed",
        lineWidth: 1,
        priceScaleId: "rsi",
        priceFormat: {
          type: "custom",
          minMove: 0.1,
          formatter: (price: number) => price.toFixed(2),
        },
      });
      rsiSeries.setData(calculateRSI(formattedData));
      seriesRef.current.rsi = rsiSeries;

      // Add RSI levels at 70 and 30
      const rsiLevels = [
        {
          price: 70,
          color: isDarkTheme ? "#ef444480" : "#dc262680",
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: "Overbought (70)",
        },
        {
          price: 30,
          color: isDarkTheme ? "#22c55e80" : "#16a34a80",
          lineWidth: 1,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: "Oversold (30)",
        },
      ];

      rsiSeries.createPriceLine(rsiLevels[0]);
      rsiSeries.createPriceLine(rsiLevels[1]);
    }

    if (indicators.macd) {
      const { macd, signal, histogram } = calculateMACD(formattedData);

      const macdSeries = chart.addLineSeries({
        color: isDarkTheme ? "#3b82f6" : "#2563eb",
        lineWidth: 1,
        priceScaleId: "macd",
      });
      const signalSeries = chart.addLineSeries({
        color: isDarkTheme ? "#ef4444" : "#dc2626",
        lineWidth: 1,
        priceScaleId: "macd",
      });
      const histogramSeries = chart.addHistogramSeries({
        color: isDarkTheme ? "#22c55e" : "#16a34a",
        priceScaleId: "macd",
      });

      macdSeries.setData(macd);
      signalSeries.setData(signal);
      histogramSeries.setData(histogram);

      seriesRef.current.macd = macdSeries;
      seriesRef.current.signal = signalSeries;
      seriesRef.current.histogram = histogramSeries;
    }

    // Handle window resizing
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    chartRef.current = chart;

    // Fit content
    chart.timeScale().fitContent();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = {};
    };
  }, [data, chartType, isDarkTheme, indicators]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Failed to load chart data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="relative flex-1">
      <div
        ref={chartContainerRef}
        className="w-full h-full"
        style={{ minHeight: "500px" }}
      />
    </Card>
  );
};
