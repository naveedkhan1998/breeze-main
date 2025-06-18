/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useGetCandlesQuery } from "../services/instrumentService";
import {
  formatDate,
} from "../common-functions";
import { Candle, Instrument } from "../common-types";
import { SeriesOptionsMap, Time } from "lightweight-charts";
import { useTheme } from "@/components/theme-provider";
import GraphHeader from "../components/GraphHeader";
import ChartControls from "../components/ChartControls";
import MainChart from "../components/MainChart";
import VolumeChart from "../components/VolumeChart";
import ResponsiveSidebar from "../components/ResponsiveSidebar";

interface LocationState {
  obj: Instrument;
}

const GraphsPage: React.FC = () => {
  const location = useLocation();
  const { obj } = (location.state as LocationState) || {};
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [timeframe, setTimeFrame] = useState<number>(15);
  const [chartType, setChartType] = useState<"Candlestick" | "Line">(
    "Candlestick",
  );  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const { data, refetch, isLoading, isError } = useGetCandlesQuery({
    id: obj?.id,
    tf: timeframe,
  });
  const mainChartRef = useRef<any>(null);
  const volumeChartRef = useRef<any>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);

  const seriesData = useMemo(() => {
    if (!data) return [];
    return data.data.map(
      ({ date, open, high, low, close, volume = 0 }: Candle) => ({
        time: formatDate(date) as Time,
        open,
        high,
        low,
        close,
        value: volume,
      }),
    );
  }, [data]);

  const volumeData = useMemo(() => {
    if (!data) return [];
    return data.data.map(
      ({ date, close, volume = 0 }: Candle, index: number, array: Candle[]) => {
        const previousClose = index > 0 ? array[index - 1].close : close;
        const color =
          close >= previousClose
            ? "rgba(76, 175, 80, 0.5)"
            : "rgba(255, 82, 82, 0.5)";
        return {
          time: formatDate(date) as Time,
          value: volume,
          color,
        };
      },
    );
  }, [data]);
  useEffect(() => {
    let intervalId: number | null = null;
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        refetch();
      }, 1000);
    }
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refetch]);
  const syncCharts = useCallback(() => {
    if (!mainChartRef.current) return;

    const getChartsToSync = () => {
      const charts = [];
      if (showVolume && volumeChartRef.current)
        charts.push(volumeChartRef.current);
      return charts;
    };

    const handleVisibleTimeRangeChange = () => {
      const mainVisibleRange = mainChartRef.current?.getVisibleRange();
      if (!mainVisibleRange) return;

      getChartsToSync().forEach((timeScale) => {
        if (timeScale) {
          try {
            timeScale.setVisibleRange(mainVisibleRange);
          } catch (error) {
            console.error("Error setting visible range:", error);
          }
        }
      });
    };

    const subscribeToMainChart = () => {
      mainChartRef.current?.subscribeVisibleTimeRangeChange(
        handleVisibleTimeRangeChange,
      );
    };

    handleVisibleTimeRangeChange();
    const timeoutId = setTimeout(subscribeToMainChart, 100);

    return () => {
      clearTimeout(timeoutId);
      mainChartRef.current?.unsubscribeVisibleTimeRangeChange(
        handleVisibleTimeRangeChange,
      );
    };
  }, [showVolume]);

  useEffect(() => {
    const cleanup = syncCharts();
    return () => {
      if (cleanup) cleanup();
    };
  }, [syncCharts, seriesData, showVolume]);

  const handleTfChange = (tf: number) => {
    setTimeFrame(tf);
    if (timeframe === tf) {
      refetch();
    }
  };

  const handleDownload = () => {
    const headers = "Date,Time,Open,High,Low,Close,Volume";
    const csvData = seriesData.map((row: any) => {
      const date = new Date(row.time * 1000);
      return `${date.toLocaleString()},${row.open},${row.high},${row.low},${row.close},${row.value}`;
    });
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${csvData.join("\n")}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${obj?.company_name}_${timeframe}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartSectionRef.current
        ?.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) =>
          console.error(
            `Error attempting to enable fullscreen mode: ${err.message}`,
          ),
        );
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-zinc-700 dark:text-zinc-300">
        Loading chart data...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Failed to load chart data. Please try again later.
      </div>
    );
  }

  if (!obj) {
    return (
      <div className="flex items-center justify-center h-screen text-zinc-700 dark:text-zinc-300">
        No instrument data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-screen h-[calc(100vh-4rem)] bg-white dark:bg-zinc-950">
      <GraphHeader
        title={`${obj.exchange_code} Chart`}
        onRefresh={refetch}
        onDownload={handleDownload}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
      <main className="flex flex-grow overflow-hidden">
        <div ref={chartSectionRef} className="flex flex-grow">
          <ResizablePanelGroup direction="horizontal" className="flex-grow">
            <ResizablePanel
              defaultSize={15}
              minSize={15}
              maxSize={30}
              className="hidden md:block"
            >
              <ResponsiveSidebar isFullscreen={isFullscreen}>                <ChartControls
                  timeframe={timeframe}
                  chartType={chartType}
                  showVolume={showVolume}
                  autoRefresh={autoRefresh}
                  onTfChange={handleTfChange}
                  onChartTypeChange={(type: keyof SeriesOptionsMap) =>
                    setChartType(type as "Candlestick" | "Line")
                  }
                  onShowVolumeChange={setShowVolume}
                  onAutoRefreshChange={setAutoRefresh}
                />
              </ResponsiveSidebar>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70}>                  <MainChart
                    seriesData={seriesData}
                    chartType={chartType}
                    mode={isDarkMode}
                    obj={obj}
                    timeframe={timeframe}
                    setTimeScale={(timeScale: any) =>
                      (mainChartRef.current = timeScale)
                    }
                  />
                </ResizablePanel>                <ResizableHandle withHandle />
                {showVolume && (
                  <ResizablePanel defaultSize={30}>
                    <VolumeChart
                      volumeData={volumeData}
                      mode={isDarkMode}
                      setTimeScale={(timeScale: any) =>
                        (volumeChartRef.current = timeScale)
                      }
                    />
                  </ResizablePanel>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </div>
  );
};

export default GraphsPage;
