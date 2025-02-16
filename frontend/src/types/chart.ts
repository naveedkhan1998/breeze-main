import { Time } from "lightweight-charts";

export interface Instrument {
  id: string;
  exchange_code: string;
  exchange: string;
  company_name: string;
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  value?: number;
}

export interface IndicatorSetting {
  name: string;
  type: "number" | "select";
  default: number | string;
  options?: string[];
}

export interface Indicator {
  id: string;
  name: string;
  description: string;
  settings: IndicatorSetting[];
}

export interface IndicatorState {
  ma: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
}

export interface ChartState {
  timeframe: number;
  chartType: "Candlestick" | "Line";
  showVolume: boolean;
  autoRefresh: boolean;
  isFullscreen: boolean;
  indicators: IndicatorState;
}

export interface ChartContextType extends ChartState {
  instrument: Instrument;
  setTimeframe: (tf: number) => void;
  setChartType: (type: "Candlestick" | "Line") => void;
  toggleVolume: () => void;
  toggleAutoRefresh: () => void;
  toggleFullscreen: () => void;
  toggleIndicator: (name: keyof IndicatorState) => void;
}
