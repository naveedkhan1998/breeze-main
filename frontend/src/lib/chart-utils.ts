// lib/chart-utils.ts
import {
  ChartOptions,
  DeepPartial,
  IChartApi,
  ISeriesApi,
  SeriesType,
  Time,
} from "lightweight-charts";

import { Candle } from "@/common-types";
import {
  calculateBollingerBands,
  calculateMA,
  calculateMACD,
  calculateRSI,
} from "./indicators";

// Format date for chart time axis (referenced from outside)
// Note: Converts dates to unix timestamps for better compatibility
export function formatDate(dateStr: string): number {
  const date = new Date(dateStr);
  // Use timestamp in seconds for lightweight-charts
  return Math.floor(date.getTime() / 1000);
}

// Format price with appropriate decimal places
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Format volume with appropriate unit (K, M, B)
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  }
  return volume.toString();
}

// Format time for tooltip display
export function formatTimeTooltip(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get appropriate theme colors based on current theme
export function getThemeColors(isDark: boolean) {
  return {
    background: isDark ? "#18181b" : "#ffffff",
    text: isDark ? "#e4e4e7" : "#27272a",
    grid: isDark ? "#27272a" : "#e4e4e7",
    upColor: isDark ? "#22c55e" : "#16a34a",
    downColor: isDark ? "#ef4444" : "#dc2626",
    primary: isDark ? "#3b82f6" : "#2563eb",
    secondary: isDark ? "#8b5cf6" : "#7c3aed",
    neutral: isDark ? "#6b7280" : "#9ca3af",
  };
}

export const getChartOptions = (
  isDarkTheme: boolean,
): DeepPartial<ChartOptions> => ({
  layout: {
    background: { color: isDarkTheme ? "#18181b" : "#ffffff" },
    textColor: isDarkTheme ? "#e4e4e7" : "#27272a",
    fontSize: 12,
    fontFamily: "Inter, -apple-system, system-ui, sans-serif",
  },
  grid: {
    vertLines: {
      color: isDarkTheme ? "#27272a" : "#e4e4e7",
      style: 1,
    },
    horzLines: {
      color: isDarkTheme ? "#27272a" : "#e4e4e7",
      style: 1,
    },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      color: isDarkTheme ? "#525252" : "#a1a1aa",
      width: 1,
      style: 1,
      labelBackgroundColor: isDarkTheme ? "#18181b" : "#ffffff",
    },
    horzLine: {
      color: isDarkTheme ? "#525252" : "#a1a1aa",
      width: 1,
      style: 1,
      labelBackgroundColor: isDarkTheme ? "#18181b" : "#ffffff",
    },
  },
  timeScale: {
    borderColor: isDarkTheme ? "#27272a" : "#e4e4e7",
    timeVisible: true,
    secondsVisible: false,
  },
  rightPriceScale: {
    borderColor: isDarkTheme ? "#27272a" : "#e4e4e7",
  },
  handleScroll: true,
  handleScale: true,
});

interface CreateSeriesOptions {
  chart: IChartApi;
  type: SeriesType;
  data: Candle[];
  isDarkTheme: boolean;
  showVolume: boolean;
  indicators: {
    ma: boolean;
    bollinger: boolean;
    rsi: boolean;
    macd: boolean;
    volume: boolean;
  };
}

export const createSeries = ({
  chart,
  type,
  data,
  isDarkTheme,
  showVolume,
  indicators,
}: CreateSeriesOptions): ISeriesApi<SeriesType>[] => {
  const series: ISeriesApi<SeriesType>[] = [];

  // Format data for the chart
  let chartData = data.map((candle) => ({
    time: formatDate(candle.date) as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    value: candle.volume,
  }));

  // Remove duplicates by creating a Map with time as key
  const uniqueDataMap = new Map();
  chartData.forEach((item) => {
    uniqueDataMap.set(item.time, item);
  });

  // Convert back to array and sort by time
  chartData = Array.from(uniqueDataMap.values()).sort((a, b) => {
    // Ensure proper ascending order by time
    return Number(a.time) - Number(b.time);
  });

  // Ensure we have at least one data point
  if (chartData.length === 0) {
    console.error("No valid chart data after processing");
    return series;
  }

  // Main price series
  const mainSeries =
    type === "Candlestick"
      ? chart.addCandlestickSeries({
          upColor: isDarkTheme ? "#22c55e" : "#16a34a",
          downColor: isDarkTheme ? "#ef4444" : "#dc2626",
          borderVisible: false,
          wickUpColor: isDarkTheme ? "#22c55e" : "#16a34a",
          wickDownColor: isDarkTheme ? "#ef4444" : "#dc2626",
        })
      : type === "Area"
        ? chart.addAreaSeries({
            lineColor: isDarkTheme ? "#3b82f6" : "#2563eb",
            topColor: isDarkTheme
              ? "rgba(59, 130, 246, 0.4)"
              : "rgba(37, 99, 235, 0.4)",
            bottomColor: isDarkTheme
              ? "rgba(59, 130, 246, 0.05)"
              : "rgba(37, 99, 235, 0.05)",
            lineWidth: 2,
          })
        : type === "Bar"
          ? chart.addBarSeries({
              upColor: isDarkTheme ? "#22c55e" : "#16a34a",
              downColor: isDarkTheme ? "#ef4444" : "#dc2626",
            })
          : chart.addLineSeries({
              color: isDarkTheme ? "#3b82f6" : "#2563eb",
              lineWidth: 2,
            });

  mainSeries.setData(chartData);
  series.push(mainSeries);

  // Volume series
  if (showVolume && indicators.volume) {
    const volumeSeries = chart.addHistogramSeries({
      color: isDarkTheme ? "#3b82f680" : "#2563eb80",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume",
    });

    const volumeData = chartData.map((candle, index) => ({
      time: candle.time,
      value: candle.value ?? 0,
      color:
        index > 0 && candle.close > chartData[index - 1].close
          ? isDarkTheme
            ? "rgba(34, 197, 94, 0.5)"
            : "rgba(22, 163, 74, 0.5)"
          : isDarkTheme
            ? "rgba(239, 68, 68, 0.5)"
            : "rgba(220, 38, 38, 0.5)",
    }));

    volumeSeries.setData(volumeData);
    series.push(volumeSeries);
  }

  // Technical indicators
  if (indicators.ma) {
    const maSeries = chart.addLineSeries({
      color: isDarkTheme ? "#f59e0b" : "#d97706",
      lineWidth: 1,
      priceLineVisible: false,
    });
    maSeries.setData(calculateMA(chartData));
    series.push(maSeries);
  }

  if (indicators.bollinger) {
    const { upper, middle, lower } = calculateBollingerBands(chartData);

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

    series.push(upperSeries, middleSeries, lowerSeries);
  }

  if (indicators.rsi) {
    const rsiSeries = chart.addLineSeries({
      color: isDarkTheme ? "#8b5cf6" : "#7c3aed",
      lineWidth: 1,
      priceScaleId: "rsi",
      priceFormat: {
        type: "custom",
        formatter: (price: number) => price.toFixed(2),
      },
    });

    // Add RSI levels
    chart
      .addLineSeries({
        color: isDarkTheme
          ? "rgba(107, 114, 128, 0.3)"
          : "rgba(156, 163, 175, 0.3)",
        lineWidth: 1,
        priceScaleId: "rsi",
        priceLineVisible: false,
      })
      .setData(
        chartData.map((item) => ({
          time: item.time,
          value: 70, // Overbought level
        })),
      );

    chart
      .addLineSeries({
        color: isDarkTheme
          ? "rgba(107, 114, 128, 0.3)"
          : "rgba(156, 163, 175, 0.3)",
        lineWidth: 1,
        priceScaleId: "rsi",
        priceLineVisible: false,
      })
      .setData(
        chartData.map((item) => ({
          time: item.time,
          value: 30, // Oversold level
        })),
      );

    rsiSeries.setData(calculateRSI(chartData));
    series.push(rsiSeries);
  }

  if (indicators.macd) {
    const { macd, signal, histogram } = calculateMACD(chartData);

    const macdPane = "macd";

    const macdSeries = chart.addLineSeries({
      color: isDarkTheme ? "#3b82f6" : "#2563eb",
      lineWidth: 1,
      priceScaleId: macdPane,
    });

    const signalSeries = chart.addLineSeries({
      color: isDarkTheme ? "#ef4444" : "#dc2626",
      lineWidth: 1,
      priceScaleId: macdPane,
    });

    const histogramSeries = chart.addHistogramSeries({
      priceScaleId: macdPane,
    });

    macdSeries.setData(macd);
    signalSeries.setData(signal);
    histogramSeries.setData(histogram);

    series.push(macdSeries, signalSeries, histogramSeries);
  }

  return series;
};

// New function to create indicator series for sub-charts
export interface CreateIndicatorSeriesOptions {
  chart: IChartApi;
  type: string; // 'RSI', 'MACD', 'Volume', etc.
  data: Candle[];
  isDarkTheme: boolean;
}

export const createIndicatorSeries = ({
  chart,
  type,
  data,
  isDarkTheme,
}: CreateIndicatorSeriesOptions): ISeriesApi<SeriesType>[] => {
  const series: ISeriesApi<SeriesType>[] = [];

  // Format data for the chart
  let chartData = data.map((candle) => ({
    time: formatDate(candle.date) as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    value: candle.volume,
  }));

  // Remove duplicates by creating a Map with time as key
  const uniqueDataMap = new Map();
  chartData.forEach((item) => {
    uniqueDataMap.set(item.time, item);
  });

  // Convert back to array and sort by time
  chartData = Array.from(uniqueDataMap.values()).sort((a, b) => {
    // Ensure proper ascending order by time
    return Number(a.time) - Number(b.time);
  });

  // Ensure we have at least one data point
  if (chartData.length === 0) {
    console.error("No valid chart data after processing");
    return series;
  }

  // Create appropriate indicator based on type
  switch (type) {
    case "RSI": {
      const rsiSeries = chart.addLineSeries({
        color: isDarkTheme ? "#8b5cf6" : "#7c3aed",
        lineWidth: 2,
        priceFormat: {
          type: "custom",
          formatter: (price: number) => price.toFixed(2),
        },
      });

      // Add RSI levels (overbought at 70, oversold at 30)
      const overboughtSeries = chart.addLineSeries({
        color: isDarkTheme
          ? "rgba(107, 114, 128, 0.5)"
          : "rgba(156, 163, 175, 0.5)",
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        priceLineVisible: false,
      });

      const oversoldSeries = chart.addLineSeries({
        color: isDarkTheme
          ? "rgba(107, 114, 128, 0.5)"
          : "rgba(156, 163, 175, 0.5)",
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        priceLineVisible: false,
      });

      const midlineSeries = chart.addLineSeries({
        color: isDarkTheme
          ? "rgba(107, 114, 128, 0.3)"
          : "rgba(156, 163, 175, 0.3)",
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        priceLineVisible: false,
      });

      overboughtSeries.setData(
        chartData.map((item) => ({
          time: item.time,
          value: 70, // Overbought level
        })),
      );

      oversoldSeries.setData(
        chartData.map((item) => ({
          time: item.time,
          value: 30, // Oversold level
        })),
      );

      midlineSeries.setData(
        chartData.map((item) => ({
          time: item.time,
          value: 50, // Middle level
        })),
      );

      rsiSeries.setData(calculateRSI(chartData));
      series.push(rsiSeries, overboughtSeries, oversoldSeries, midlineSeries);
      break;
    }

    case "MACD": {
      const { macd, signal, histogram } = calculateMACD(chartData);

      const macdSeries = chart.addLineSeries({
        color: isDarkTheme ? "#3b82f6" : "#2563eb",
        lineWidth: 2,
        title: 'MACD',
      });

      const signalSeries = chart.addLineSeries({
        color: isDarkTheme ? "#ef4444" : "#dc2626",
        lineWidth: 2,
        title: 'Signal',
      });

      const histogramSeries = chart.addHistogramSeries({
        color: isDarkTheme ? "#6b7280" : "#9ca3af",
        title: 'Histogram',
      });

      // Set histogram colors based on values
      const coloredHistogram = histogram.map(item => ({
        ...item,
        color: item.value >= 0 
          ? (isDarkTheme ? "#22c55e" : "#16a34a") 
          : (isDarkTheme ? "#ef4444" : "#dc2626")
      }));

      macdSeries.setData(macd);
      signalSeries.setData(signal);
      histogramSeries.setData(coloredHistogram);

      // Create a zero line
      const zeroLine = chart.addLineSeries({
        color: isDarkTheme
          ? "rgba(107, 114, 128, 0.5)"
          : "rgba(156, 163, 175, 0.5)",
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        priceLineVisible: false,
      });

      zeroLine.setData(
        chartData.map((item) => ({
          time: item.time,
          value: 0,
        })),
      );

      series.push(macdSeries, signalSeries, histogramSeries, zeroLine);
      break;
    }

    case "Volume": {
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
      });

      const volumeData = chartData.map((candle, index) => ({
        time: candle.time,
        value: candle.value ?? 0,
        color:
          index > 0 && candle.close > chartData[index - 1].close
            ? isDarkTheme
              ? "rgba(34, 197, 94, 0.7)"
              : "rgba(22, 163, 74, 0.7)"
            : isDarkTheme
              ? "rgba(239, 68, 68, 0.7)"
              : "rgba(220, 38, 38, 0.7)",
      }));

      volumeSeries.setData(volumeData);
      series.push(volumeSeries);
      break;
    }

    case "Bollinger": {
      const { upper, middle, lower } = calculateBollingerBands(chartData);

      const upperSeries = chart.addLineSeries({
        color: isDarkTheme ? "#22c55e" : "#16a34a",
        lineWidth: 1,
        title: 'Upper Band',
      });

      const middleSeries = chart.addLineSeries({
        color: isDarkTheme ? "#6b7280" : "#71717a",
        lineWidth: 2,
        title: 'Middle Band (SMA)',
      });

      const lowerSeries = chart.addLineSeries({
        color: isDarkTheme ? "#ef4444" : "#dc2626",
        lineWidth: 1,
        title: 'Lower Band',
      });

      upperSeries.setData(upper);
      middleSeries.setData(middle);
      lowerSeries.setData(lower);

      // Also add price to compare with bollinger bands
      const priceSeries = chart.addLineSeries({
        color: isDarkTheme ? "#3b82f6" : "#2563eb",
        lineWidth: 1,
        lineStyle: 2, // Dashed line
        title: 'Price',
      });

      priceSeries.setData(chartData.map(candle => ({
        time: candle.time,
        value: candle.close,
      })));

      series.push(upperSeries, middleSeries, lowerSeries, priceSeries);
      break;
    }

    default:
      console.error(`Unknown indicator type: ${type}`);
  }

  return series;
};
