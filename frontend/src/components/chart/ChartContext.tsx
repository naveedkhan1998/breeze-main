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
export type SubchartType = "RSI" | "MACD" | "Volume" | null;

// Sub-chart configuration
export interface SubChart {
  id: string;
  type: SubchartType;
  height: number;
  visible: boolean;
}

interface ChartState {
  timeframe: TimeframeOption;
  chartType: ChartType;
  autoRefresh: boolean;
  isFullscreen: boolean;
  isSidebarOpen: boolean;
  selectedCandle: Candle | null;
  mainChartHeight: number;
  subCharts: SubChart[];
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
  toggleAutoRefresh: () => void;
  toggleFullscreen: () => void;
  toggleSidebar: () => void;
  toggleIndicator: (name: keyof ChartState["indicators"]) => void;
  setSelectedCandle: (candle: Candle | null) => void;
  setMainChartHeight: (height: number) => void;
  addSubChart: (type: SubchartType) => void;
  removeSubChart: (id: string) => void;
  updateSubChartHeight: (id: string, height: number) => void;
  toggleSubChartVisibility: (id: string) => void;
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
    autoRefresh: false,
    isFullscreen: false,
    isSidebarOpen: true,
    selectedCandle: null,
    mainChartHeight: 70, // Percentage of available space
    subCharts: [
      { id: "volume", type: "Volume", height: 15, visible: true },
    ],
    indicators: {
      ma: false,
      bollinger: false,
      rsi: false,
      macd: false,
      volume: true,
    },
  });

  const setTimeframe = useCallback((tf: TimeframeOption) => {
    setState((prev) => ({ ...prev, timeframe: tf }));
  }, []);

  const setChartType = useCallback((type: ChartType) => {
    setState((prev) => ({ ...prev, chartType: type }));
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

  const setMainChartHeight = useCallback((height: number) => {
    setState((prev) => ({ ...prev, mainChartHeight: height }));
  }, []);

  const addSubChart = useCallback((type: SubchartType) => {
    if (!type) return;
    
    setState((prev) => {
      // Check if this type already exists
      const exists = prev.subCharts.some(chart => chart.type === type);
      if (exists) return prev;
      
      const newId = `${type.toLowerCase()}-${Date.now()}`;
      return {
        ...prev,
        subCharts: [
          ...prev.subCharts, 
          { id: newId, type, height: 15, visible: true }
        ],
        // Also enable the corresponding indicator
        indicators: {
          ...prev.indicators,
          [type.toLowerCase() as keyof ChartState["indicators"]]: true,
        },
      };
    });
  }, []);

  const removeSubChart = useCallback((id: string) => {
    setState((prev) => {
      const chartToRemove = prev.subCharts.find(chart => chart.id === id);
      
      return {
        ...prev,
        subCharts: prev.subCharts.filter((chart) => chart.id !== id),
        // If removing the chart, also disable the corresponding indicator
        indicators: chartToRemove ? {
          ...prev.indicators,
          [chartToRemove.type?.toLowerCase() as keyof ChartState["indicators"]]: false,
        } : prev.indicators,
      };
    });
  }, []);

  const updateSubChartHeight = useCallback((id: string, height: number) => {
    setState((prev) => ({
      ...prev,
      subCharts: prev.subCharts.map((chart) =>
        chart.id === id ? { ...chart, height } : chart
      ),
    }));
  }, []);

  const toggleSubChartVisibility = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subCharts: prev.subCharts.map((chart) =>
        chart.id === id ? { ...chart, visible: !chart.visible } : chart
      ),
    }));
  }, []);

  return (
    <ChartContext.Provider
      value={{
        ...state,
        instrument,
        setTimeframe,
        setChartType,
        toggleAutoRefresh,
        toggleFullscreen,
        toggleSidebar,
        toggleIndicator,
        setSelectedCandle,
        setMainChartHeight,
        addSubChart,
        removeSubChart,
        updateSubChartHeight,
        toggleSubChartVisibility,
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
