// lib/indicators.ts
import { Time } from "lightweight-charts";

// Format date for chart data - using Unix timestamp in seconds for compatibility
export function formatDate(dateStr: string): number {
  const date = new Date(dateStr);
  return Math.floor(date.getTime() / 1000);
}

interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  value?: number;
}

// Calculate Moving Average
export function calculateMA(data: ChartData[], period = 20) {
  const result: { time: Time; value: number }[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((total, item) => total + item.close, 0);
    const ma = sum / period;
    
    result.push({
      time: data[i].time,
      value: parseFloat(ma.toFixed(2)),
    });
  }
  
  return result;
}

// Calculate RSI (Relative Strength Index)
export function calculateRSI(data: ChartData[], period = 14) {
  const result: { time: Time; value: number }[] = [];
  
  if (data.length <= period) {
    return result;
  }
  
  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }
  
  // Calculate initial averages
  let sumGain = 0;
  let sumLoss = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      sumGain += changes[i];
    } else {
      sumLoss += Math.abs(changes[i]);
    }
  }
  
  let avgGain = sumGain / period;
  let avgLoss = sumLoss / period;
  
  // Calculate RSI values
  for (let i = period; i < changes.length; i++) {
    // Calculate RSI using Wilder's smoothing method
    avgGain = ((avgGain * (period - 1)) + (changes[i] > 0 ? changes[i] : 0)) / period;
    avgLoss = ((avgLoss * (period - 1)) + (changes[i] < 0 ? Math.abs(changes[i]) : 0)) / period;
    
    const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({
      time: data[i].time,
      value: parseFloat(rsi.toFixed(2)),
    });
  }
  
  return result;
}

// Calculate Bollinger Bands
export function calculateBollingerBands(data: ChartData[], period = 20, multiplier = 2) {
  const result = {
    upper: [] as { time: Time; value: number }[],
    middle: [] as { time: Time; value: number }[],
    lower: [] as { time: Time; value: number }[],
  };
  
  if (data.length <= period) {
    return result;
  }
  
  // Calculate SMA (Simple Moving Average) and standard deviation
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((total, item) => total + item.close, 0);
    const sma = sum / period;
    
    // Calculate standard deviation
    const sumSquaredDiff = slice.reduce((total, item) => {
      const diff = item.close - sma;
      return total + diff * diff;
    }, 0);
    
    const standardDeviation = Math.sqrt(sumSquaredDiff / period);
    
    // Calculate Bollinger Bands
    const upper = sma + (standardDeviation * multiplier);
    const lower = sma - (standardDeviation * multiplier);
    
    result.middle.push({
      time: data[i].time,
      value: parseFloat(sma.toFixed(2)),
    });
    
    result.upper.push({
      time: data[i].time,
      value: parseFloat(upper.toFixed(2)),
    });
    
    result.lower.push({
      time: data[i].time,
      value: parseFloat(lower.toFixed(2)),
    });
  }
  
  return result;
}

// Calculate MACD (Moving Average Convergence Divergence)
export function calculateMACD(data: ChartData[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const result = {
    macd: [] as { time: Time; value: number }[],
    signal: [] as { time: Time; value: number }[],
    histogram: [] as { time: Time; value: number; color: string }[],
  };
  
  if (data.length <= slowPeriod + signalPeriod) {
    return result;
  }
  
  // Calculate EMA (Exponential Moving Average) for fast and slow periods
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);
  
  // Calculate MACD line (fast EMA - slow EMA)
  const macdLine: { time: Time; value: number }[] = [];
  
  // Align the EMAs to have the same starting point (at slow period)
  const startIndex = slowPeriod - fastPeriod;
  for (let i = 0; i < emaFast.length - startIndex; i++) {
    const macdValue = emaFast[i + startIndex].value - emaSlow[i].value;
    macdLine.push({
      time: emaSlow[i].time,
      value: parseFloat(macdValue.toFixed(2)),
    });
  }
  
  // Calculate signal line (EMA of MACD line)
  let signalLine: { time: Time; value: number }[] = [];
  
  if (macdLine.length > signalPeriod) {
    const macdData = macdLine.map(item => ({
      ...item,
      close: item.value, // Convert to format expected by EMA function
      open: item.value,
      high: item.value,
      low: item.value,
    }));
    
    signalLine = calculateEMA(macdData as ChartData[], signalPeriod);
    
    // Ensure macdLine and signalLine are aligned
    const startIdx = macdLine.length - signalLine.length;
    const alignedMacdLine = macdLine.slice(startIdx);
    
    // Calculate histogram (MACD line - signal line)
    for (let i = 0; i < signalLine.length; i++) {
      const histValue = alignedMacdLine[i].value - signalLine[i].value;
      
      result.macd.push({
        time: signalLine[i].time,
        value: alignedMacdLine[i].value,
      });
      
      result.signal.push({
        time: signalLine[i].time,
        value: signalLine[i].value,
      });
      
      result.histogram.push({
        time: signalLine[i].time,
        value: parseFloat(histValue.toFixed(2)),
        color: histValue >= 0 ? "#22c55e" : "#ef4444",
      });
    }
  }
  
  return result;
}

// Helper function to calculate EMA (Exponential Moving Average)
function calculateEMA(data: ChartData[], period: number) {
  const result: { time: Time; value: number }[] = [];
  
  if (data.length < period) {
    return result;
  }
  
  // Calculate SMA for the first data point
  const firstSlice = data.slice(0, period);
  const firstSum = firstSlice.reduce((total, item) => total + item.close, 0);
  const firstSMA = firstSum / period;
  
  // Calculate multiplier
  const multiplier = 2 / (period + 1);
  
  // Add first EMA (which is SMA)
  result.push({
    time: data[period - 1].time,
    value: parseFloat(firstSMA.toFixed(2)),
  });
  
  // Calculate EMA for the rest of the data
  let prevEMA = firstSMA;
  for (let i = period; i < data.length; i++) {
    const ema = (data[i].close - prevEMA) * multiplier + prevEMA;
    prevEMA = ema;
    
    result.push({
      time: data[i].time,
      value: parseFloat(ema.toFixed(2)),
    });
  }
  
  return result;
}
