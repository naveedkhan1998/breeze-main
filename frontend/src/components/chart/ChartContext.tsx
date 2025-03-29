// components/chart/ChartContext.tsx
import { Instrument, Candle } from "@/common-types";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type TimeframeOption = 1 | 5 | 15 | 30 | 60 | 240 | 1440;
export type ChartType = "Candlestick" | "Line" | "Area" | "Bar";

interface ChartState {
  timeframe: TimeframeOption;
  chartType: ChartType;
  showVolume: boolean;
  autoRefresh: boolean;
  isFullscreen: boolean;
  isSidebarOpen: boolean;
  selectedCandle: Candle | null;
  indicators: {
    ma: boolean;
    bollinger: boolean;
    rsi: boolean;
    macd: boolean;
    volume: boolean;
  };
}

interface ChartContextType extends ChartState {
  instrument: Instrument;
  setTimeframe: (tf: TimeframeOption) => void;
  setChartType: (type: ChartType) => void;
  toggleVolume: () => void;
  toggleAutoRefresh: () => void;
  toggleFullscreen: () => void;
  toggleSidebar: () => void;
  toggleIndicator: (name: keyof ChartState["indicators"]) => void;
  setSelectedCandle: (candle: Candle | null) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export function ChartProvider({
  children,
  instrument,
}: {
  children: ReactNode;
  instrument: Instrument;
}) {
  const [state, setState] = useState<ChartState>({
    timeframe: 15,
    chartType: "Candlestick",
    showVolume: false,
    autoRefresh: false,
    isFullscreen: false,
    isSidebarOpen: true,
    selectedCandle: null,
    indicators: {
      ma: false,
      bollinger: false,
      rsi: false,
      macd: false,
      volume: false,
    },
  });

  const setTimeframe = useCallback((tf: TimeframeOption) => {
    setState((prev) => ({ ...prev, timeframe: tf }));
  }, []);

  const setChartType = useCallback((type: ChartType) => {
    setState((prev) => ({ ...prev, chartType: type }));
  }, []);

  const toggleVolume = useCallback(() => {
    setState((prev) => ({ ...prev, showVolume: !prev.showVolume }));
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setState((prev) => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  }, []);

  const toggleIndicator = useCallback(
    (name: keyof ChartState["indicators"]) => {
      setState((prev) => ({
        ...prev,
        indicators: {
          ...prev.indicators,
          [name]: !prev.indicators[name],
        },
      }));
    },
    [],
  );

  const setSelectedCandle = useCallback((candle: Candle | null) => {
    setState((prev) => ({ ...prev, selectedCandle: candle }));
  }, []);

  return (
    <ChartContext.Provider
      value={{
        ...state,
        instrument,
        setTimeframe,
        setChartType,
        toggleVolume,
        toggleAutoRefresh,
        toggleFullscreen,
        toggleSidebar,
        toggleIndicator,
        setSelectedCandle,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
}

export function useChart() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error("useChart must be used within a ChartProvider");
  }
  return context;
}
