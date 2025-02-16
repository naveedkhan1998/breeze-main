// components/chart/ChartContext.tsx
import { Instrument } from "@/common-types";
import React, { createContext, useContext, useState, useCallback } from "react";

interface ChartState {
  timeframe: number;
  chartType: "Candlestick" | "Line";
  showVolume: boolean;
  autoRefresh: boolean;
  isFullscreen: boolean;
  indicators: {
    ma: boolean;
    bollinger: boolean;
    rsi: boolean;
    macd: boolean;
  };
}

interface ChartContextType extends ChartState {
  instrument: Instrument;
  setTimeframe: (tf: number) => void;
  setChartType: (type: "Candlestick" | "Line") => void;
  toggleVolume: () => void;
  toggleAutoRefresh: () => void;
  toggleFullscreen: () => void;
  toggleIndicator: (name: keyof ChartState["indicators"]) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

export function ChartProvider({
  children,
  instrument,
}: {
  children: React.ReactNode;
  instrument: Instrument;
}) {
  const [state, setState] = useState<ChartState>({
    timeframe: 15,
    chartType: "Candlestick",
    showVolume: true,
    autoRefresh: false,
    isFullscreen: false,
    indicators: {
      ma: false,
      bollinger: false,
      rsi: false,
      macd: true,
    },
  });

  const setTimeframe = useCallback((tf: number) => {
    setState((prev) => ({ ...prev, timeframe: tf }));
  }, []);

  const setChartType = useCallback((type: "Candlestick" | "Line") => {
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
        toggleIndicator,
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
