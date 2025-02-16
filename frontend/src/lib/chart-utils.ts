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
import { formatDate } from "@/common-functions";
import {
  calculateBollingerBands,
  calculateMA,
  calculateMACD,
  calculateRSI,
} from "./indicators";

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
  const chartData = data.map((candle) => ({
    time: formatDate(candle.date) as Time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    value: candle.volume,
  }));

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
      : chart.addLineSeries({
          color: isDarkTheme ? "#3b82f6" : "#2563eb",
          lineWidth: 2,
        });

  mainSeries.setData(chartData);
  series.push(mainSeries);

  // Volume series
  if (showVolume) {
    const volumeSeries = chart.addHistogramSeries({
      color: isDarkTheme ? "#3b82f6" : "#2563eb",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    const volumeData = data.map((candle, index) => ({
      time: formatDate(candle.date) as Time,
      value: candle.volume,
      color:
        candle.close >= (data[index - 1]?.close ?? candle.close)
          ? isDarkTheme
            ? "#22c55e80"
            : "#16a34a80"
          : isDarkTheme
            ? "#ef444480"
            : "#dc262680",
    }));

    volumeSeries.setData(volumeData);
    series.push(volumeSeries);
  }

  // Technical indicators
  if (indicators.ma) {
    const maSeries = chart.addLineSeries({
      color: isDarkTheme ? "#eab308" : "#ca8a04",
      lineWidth: 1,
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
    });
    rsiSeries.setData(calculateRSI(chartData));
    series.push(rsiSeries);
  }

  if (indicators.macd) {
    const { macd, signal, histogram } = calculateMACD(chartData);

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

    series.push(macdSeries, signalSeries, histogramSeries);
  }

  return series;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatVolume = (volume: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(volume);
};
