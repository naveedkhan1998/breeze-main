// lib/indicators.ts
import { ChartData } from "@/types/chart";

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateMA(
  data: ChartData[],
  period: number = 20,
): ChartData[] {
  const result: ChartData[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      continue;
    }

    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, candle) => acc + candle.close, 0);

    result.push({
      time: data[i].time,
      open: data[i].open,
      high: data[i].high,
      low: data[i].low,
      close: data[i].close,
      value: sum / period,
    });
  }

  return result;
}

/**
 * Calculates Relative Strength Index (RSI)
 */
export function calculateRSI(
  data: ChartData[],
  period: number = 14,
): ChartData[] {
  const result: ChartData[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate initial gains and losses
  for (let i = 1; i < data.length; i++) {
    const difference = data[i].close - data[i - 1].close;
    gains.push(Math.max(0, difference));
    losses.push(Math.max(0, -difference));
  }

  // Calculate RSI for each period
  for (let i = period; i < data.length; i++) {
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b) / period;
    const avgLoss =
      losses.slice(i - period, i).reduce((a, b) => a + b) / period;

    const rs = avgGain / (avgLoss || 1); // Prevent division by zero
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: data[i].time,
      open: data[i].open,
      high: data[i].high,
      low: data[i].low,
      close: data[i].close,
      value: rsi,
    });
  }

  return result;
}

/**
 * Calculates Bollinger Bands
 */
export function calculateBollingerBands(
  data: ChartData[],
  period: number = 20,
  multiplier: number = 2,
): {
  upper: ChartData[];
  middle: ChartData[];
  lower: ChartData[];
} {
  const result = {
    upper: [] as ChartData[],
    middle: [] as ChartData[],
    lower: [] as ChartData[],
  };

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);

    // Calculate SMA
    const sma = slice.reduce((sum, candle) => sum + candle.close, 0) / period;

    // Calculate Standard Deviation
    const squaredDiffs = slice.map((candle) => Math.pow(candle.close - sma, 2));
    const variance = squaredDiffs.reduce((sum, value) => sum + value) / period;
    const stdDev = Math.sqrt(variance);

    // Calculate Bands
    const upperBand = sma + multiplier * stdDev;
    const lowerBand = sma - multiplier * stdDev;

    result.upper.push({
      time: data[i].time,
      open: data[i].open,
      high: data[i].high,
      low: data[i].low,
      close: data[i].close,
      value: upperBand,
    });
    result.middle.push({
      time: data[i].time,
      open: data[i].open,
      high: data[i].high,
      low: data[i].low,
      close: data[i].close,
      value: sma,
    });
    result.lower.push({
      time: data[i].time,
      open: data[i].open,
      high: data[i].high,
      low: data[i].low,
      close: data[i].close,
      value: lowerBand,
    });
  }

  return result;
}

/**
 * Calculates Moving Average Convergence Divergence (MACD)
 */
export function calculateMACD(
  data: ChartData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): {
  macd: ChartData[];
  signal: ChartData[];
  histogram: ChartData[];
} {
  const result = {
    macd: [] as ChartData[],
    signal: [] as ChartData[],
    histogram: [] as ChartData[],
  };

  // Calculate EMAs
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Calculate MACD line
  const macdLine: ChartData[] = [];
  for (let i = slowPeriod - 1; i < data.length; i++) {
    const fastValue = fastEMA[i - (slowPeriod - fastPeriod)].value;
    const slowValue = slowEMA[i - (slowPeriod - 1)].value;

    if (fastValue !== undefined && slowValue !== undefined) {
      macdLine.push({
        time: data[i].time,
        open: data[i].open,
        high: data[i].high,
        low: data[i].low,
        close: data[i].close,
        value: fastValue - slowValue,
      });
    }
  }

  // Calculate Signal line (9-day EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod);

  // Calculate Histogram
  for (let i = 0; i < signalLine.length; i++) {
    const macdValue = macdLine[i + signalPeriod - 1].value;
    const signalValue = signalLine[i].value;

    result.macd.push({
      time: data[i + slowPeriod + signalPeriod - 2].time,
      open: data[i + slowPeriod + signalPeriod - 2].open,
      high: data[i + slowPeriod + signalPeriod - 2].high,
      low: data[i + slowPeriod + signalPeriod - 2].low,
      close: data[i + slowPeriod + signalPeriod - 2].close,
      value: macdValue,
    });

    result.signal.push({
      time: data[i + slowPeriod + signalPeriod - 2].time,
      open: data[i + slowPeriod + signalPeriod - 2].open,
      high: data[i + slowPeriod + signalPeriod - 2].high,
      low: data[i + slowPeriod + signalPeriod - 2].low,
      close: data[i + slowPeriod + signalPeriod - 2].close,
      value: signalValue,
    });

    if (macdValue !== undefined && signalValue !== undefined) {
      result.histogram.push({
        time: data[i + slowPeriod + signalPeriod - 2].time,
        open: data[i + slowPeriod + signalPeriod - 2].open,
        high: data[i + slowPeriod + signalPeriod - 2].high,
        low: data[i + slowPeriod + signalPeriod - 2].low,
        close: data[i + slowPeriod + signalPeriod - 2].close,
        value: macdValue - signalValue,
      });
    }
  }

  return result;
}

/**
 * Helper function to calculate Exponential Moving Average (EMA)
 */
function calculateEMA(data: ChartData[], period: number): ChartData[] {
  const result: ChartData[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA is calculated as SMA
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += data[i].close || data[i].value || 0;
  }
  let prevEMA = initialSum / period;

  result.push({
    time: data[period - 1].time,
    open: data[period - 1].open,
    high: data[period - 1].high,
    low: data[period - 1].low,
    close: data[period - 1].close,
    value: prevEMA,
  });

  // Calculate subsequent EMAs
  for (let i = period; i < data.length; i++) {
    const currentValue = data[i].close || data[i].value || 0;
    const currentEMA = (currentValue - prevEMA) * multiplier + prevEMA;
    prevEMA = currentEMA;

    result.push({
      time: data[i].time,
      open: data[i].open,
      high: data[i].high,
      low: data[i].low,
      close: data[i].close,
      value: currentEMA,
    });
  }

  return result;
}

/**
 * Format date for chart time values
 */
export function formatDate(date: string | number): number {
  if (typeof date === "number") return date;
  return new Date(date).getTime() / 1000;
}
