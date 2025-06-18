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
import { formatDate } from "../common-functions";
import { Candle, Instrument } from "../common-types";
import { SeriesOptionsMap, Time } from "lightweight-charts";
import { useTheme } from "@/components/theme-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  HiArrowLeft,
  HiDownload,
  HiRefresh,
  HiArrowsExpand,
  HiX,
  HiCog,
  HiEye,
  HiEyeOff,
  HiChartBar,
} from "react-icons/hi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import MainChart from "../components/MainChart";
import VolumeChart from "../components/VolumeChart";
import ChartControls from "../components/ChartControls";

interface LocationState {
  obj: Instrument;
}

const GraphsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { obj } = (location.state as LocationState) || {};
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // State variables
  const [timeframe, setTimeFrame] = useState<number>(15);
  const [chartType, setChartType] = useState<"Candlestick" | "Line">(
    "Candlestick",
  );
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const { data, refetch, isLoading, isError } = useGetCandlesQuery({
    id: obj?.id,
    tf: timeframe,
  });

  // Refs
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
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-gradient-to-br from-background to-secondary dark:from-background dark:to-card">
      {/* Modern Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/80 backdrop-blur-md border-border">
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 p-0"
                >
                  <HiArrowLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go back</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">
              {obj?.company_name || "Chart"}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {obj?.exchange_code || "N/A"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {timeframe}m
              </Badge>
              {autoRefresh && (
                <Badge variant="default" className="text-xs animate-pulse">
                  Live
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowControls(!showControls)}
                  className="h-8 px-3"
                >
                  <HiCog className="w-4 h-4 mr-1" />
                  Controls
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle controls</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVolume(!showVolume)}
                  className="h-8 px-3"
                >
                  {showVolume ? (
                    <HiEye className="w-4 h-4" />
                  ) : (
                    <HiEyeOff className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showVolume ? "Hide" : "Show"} volume
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  className="w-8 h-8 p-0"
                >
                  <HiRefresh className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="w-8 h-8 p-0"
                >
                  <HiDownload className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download CSV</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="w-8 h-8 p-0"
                >
                  {isFullscreen ? (
                    <HiX className="w-4 h-4" />
                  ) : (
                    <HiArrowsExpand className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Content */}
      <div ref={chartSectionRef} className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Controls Sidebar */}
          {showControls && (
            <>
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={35}
                className={`transition-all duration-200 ${sidebarCollapsed ? "min-w-16" : ""}`}
              >
                {" "}
                <Card className="h-full m-2 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                  <div className="h-full p-4 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">
                        Chart Controls
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-6 h-6 p-0"
                      >
                        {sidebarCollapsed ? (
                          <HiArrowsExpand className="w-3 h-3" />
                        ) : (
                          <HiX className="w-3 h-3" />
                        )}
                      </Button>
                    </div>

                    {!sidebarCollapsed && (
                      <ChartControls
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
                    )}
                  </div>
                </Card>
              </ResizablePanel>
              <ResizableHandle
                withHandle
                className="w-1 transition-colors bg-border hover:bg-muted"
              />
            </>
          )}

          {/* Chart Area */}
          <ResizablePanel defaultSize={showControls ? 80 : 100}>
            <div className="h-full p-2">
              <ResizablePanelGroup direction="vertical">
                {/* Main Chart */}{" "}
                <ResizablePanel defaultSize={showVolume ? 70 : 100}>
                  <Card className="h-full overflow-hidden border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                    <MainChart
                      seriesData={seriesData}
                      chartType={chartType}
                      mode={isDarkMode}
                      obj={obj}
                      timeframe={timeframe}
                      setTimeScale={(timeScale: any) =>
                        (mainChartRef.current = timeScale)
                      }
                    />
                  </Card>
                </ResizablePanel>
                {/* Volume Chart */}
                {showVolume && (
                  <>
                    <ResizableHandle
                      withHandle
                      className="h-1 transition-colors bg-border hover:bg-muted"
                    />
                    <ResizablePanel defaultSize={30} minSize={15}>
                      <Card className="h-full overflow-hidden border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                        <div className="p-2 border-b border-border">
                          <div className="flex items-center gap-2">
                            <HiChartBar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                              Volume
                            </span>
                          </div>
                        </div>
                        <VolumeChart
                          volumeData={volumeData}
                          mode={isDarkMode}
                          setTimeScale={(timeScale: any) =>
                            (volumeChartRef.current = timeScale)
                          }
                        />
                      </Card>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default GraphsPage;
