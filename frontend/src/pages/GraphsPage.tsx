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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  HiArrowLeft,
  HiDownload,
  HiRefresh,
  HiArrowsExpand,
  HiX,
  HiCog,
  HiEyeOff,
  HiChartBar,
  HiDotsVertical,
  HiPlay,
  HiPause,
  HiViewGrid,
  HiTrendingUp,
  HiColorSwatch,
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
            ? isDarkMode ? "rgba(34, 197, 94, 0.8)" : "rgba(22, 163, 74, 0.8)"
            : isDarkMode ? "rgba(239, 68, 68, 0.8)" : "rgba(220, 38, 38, 0.8)";
        return {
          time: formatDate(date) as Time,
          value: volume,
          color,
        };
      },
    );
  }, [data, isDarkMode]);

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
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Card className="p-8 shadow-2xl bg-card/80 backdrop-blur-sm border-border">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 rounded-full border-chart-1/30 border-t-chart-1 animate-spin"></div>
            <div className="text-card-foreground">
              <div className="font-semibold">Loading chart data...</div>
              <div className="text-sm text-muted-foreground">Please wait while we fetch the latest data</div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Card className="p-8 shadow-2xl bg-card/80 backdrop-blur-sm border-destructive/20">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
              <HiX className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <div className="font-semibold text-destructive">Failed to load chart data</div>
              <div className="text-sm text-muted-foreground">Please check your connection and try again</div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!obj) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Card className="p-8 shadow-2xl bg-card/80 backdrop-blur-sm border-border">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
              <HiChartBar className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="font-semibold text-card-foreground">No instrument data available</div>
            <div className="mt-1 text-sm text-muted-foreground">Please select an instrument to view charts</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-sidebar-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Section - Navigation & Title */}
          <div className="flex items-center space-x-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 p-0 transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                  >
                    <HiArrowLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Go back</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-sidebar-foreground">
                  {obj?.company_name || "Chart"}
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="px-2 py-1 text-xs font-medium border bg-chart-1/10 text-chart-1 border-chart-1/20">
                    {obj?.exchange_code || "N/A"}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 text-xs font-medium">
                    {timeframe}m
                  </Badge>
                </div>
              </div>
              <div className="flex items-center mt-1 space-x-4">
                {autoRefresh && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse"></div>
                    <Badge variant="default" className="px-2 py-1 text-xs border bg-chart-2/10 text-chart-2 border-chart-2/20">
                      Live
                    </Badge>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {data?.data?.length || 0} candles loaded
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <div className="flex items-center p-1 space-x-1 rounded-lg bg-sidebar-accent/50">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`h-8 px-3 transition-all duration-200 ${
                        autoRefresh 
                          ? 'bg-chart-2/10 text-chart-2 hover:bg-chart-2/20' 
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      {autoRefresh ? (
                        <HiPause className="w-4 h-4" />
                      ) : (
                        <HiPlay className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{autoRefresh ? 'Pause' : 'Start'} live updates</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVolume(!showVolume)}
                      className={`h-8 px-3 transition-all duration-200 ${
                        showVolume 
                          ? 'bg-chart-1/10 text-chart-1 hover:bg-chart-1/20' 
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <HiChartBar className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showVolume ? 'Hide' : 'Show'} volume chart</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowControls(!showControls)}
                      className={`h-8 px-3 transition-all duration-200 ${
                        showControls 
                          ? 'bg-chart-5/10 text-chart-5 hover:bg-chart-5/20' 
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <HiCog className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle controls panel</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refetch}
                      className="w-8 h-8 p-0 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <HiRefresh className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="w-8 h-8 p-0 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <HiDownload className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download CSV</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="w-8 h-8 p-0 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      {isFullscreen ? (
                        <HiX className="w-4 h-4" />
                      ) : (
                        <HiArrowsExpand className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <HiDotsVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <HiViewGrid className="w-4 h-4 mr-2" />
                  Toggle Layout
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <HiTrendingUp className="w-4 h-4 mr-2" />
                  Add Indicator
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HiColorSwatch className="w-4 h-4 mr-2" />
                  Customize Theme
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div ref={chartSectionRef} className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Enhanced Controls Sidebar */}
          {showControls && (
            <>
              <ResizablePanel
                defaultSize={22}
                minSize={18}
                maxSize={35}
                className="min-w-0"
              >
                <div className="h-full p-4 bg-sidebar-background/50">
                  <Card className="h-full shadow-xl border-sidebar-border bg-sidebar-background/70 backdrop-blur-lg">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                        <h3 className="font-semibold text-sidebar-foreground">
                          Chart Controls
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowControls(false)}
                          className="w-6 h-6 p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <HiX className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto scrollbar-hidden">
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
                      </div>
                    </div>
                  </Card>
                </div>
              </ResizablePanel>
              <ResizableHandle
                withHandle
                className="w-1 transition-colors bg-sidebar-border hover:bg-sidebar-border/80"
              />
            </>
          )}

          {/* Chart Area */}
          <ResizablePanel defaultSize={showControls ? 78 : 100}>
            <div className="h-full p-4">
              <ResizablePanelGroup direction="vertical">
                {/* Main Chart */}
                <ResizablePanel defaultSize={showVolume ? 75 : 100}>
                  <Card className="h-full shadow-2xl border-border bg-card/80 backdrop-blur-sm">
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
                      className="h-1 my-2 transition-colors rounded-full bg-border hover:bg-border/80"
                    />
                    <ResizablePanel defaultSize={25} minSize={15}>
                      <Card className="h-full shadow-2xl border-border bg-card/80 backdrop-blur-sm">
                        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
                          <div className="flex items-center space-x-2">
                            <HiChartBar className="w-4 h-4 text-chart-1" />
                            <span className="text-sm font-medium text-card-foreground">
                              Volume Analysis
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowVolume(false)}
                            className="w-6 h-6 p-0 hover:bg-accent hover:text-accent-foreground"
                          >
                            <HiEyeOff className="w-3 h-3" />
                          </Button>
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
