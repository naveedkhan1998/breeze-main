/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { SeriesOptionsMap, Time } from 'lightweight-charts';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
} from 'react-icons/hi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import type { Candle, Instrument } from '@/types/common-types';
import { useTheme } from '@/components/ThemeProvider';
import { useGetCandlesQuery } from '@/api/instrumentService';
import { formatDate } from '@/lib/functions';
import ChartControls from './components/ChartControls';
import MainChart from './components/MainChart';
import VolumeChart from './components/VolumeChart';

interface LocationState {
  obj: Instrument;
}

const GraphsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { obj } = (location.state as LocationState) || {};
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // State variables
  const [timeframe, setTimeFrame] = useState<number>(15);
  const [chartType, setChartType] = useState<'Candlestick' | 'Line'>(
    'Candlestick'
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
      })
    );
  }, [data]);

  const volumeData = useMemo(() => {
    if (!data) return [];
    return data.data.map(
      ({ date, close, volume = 0 }: Candle, index: number, array: Candle[]) => {
        const previousClose = index > 0 ? array[index - 1].close : close;
        const color =
          close >= previousClose
            ? isDarkMode
              ? 'rgba(34, 197, 94, 0.8)'
              : 'rgba(22, 163, 74, 0.8)'
            : isDarkMode
              ? 'rgba(239, 68, 68, 0.8)'
              : 'rgba(220, 38, 38, 0.8)';
        return {
          time: formatDate(date) as Time,
          value: volume,
          color,
        };
      }
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

      getChartsToSync().forEach(timeScale => {
        if (timeScale) {
          try {
            timeScale.setVisibleRange(mainVisibleRange);
          } catch (error) {
            console.error('Error setting visible range:', error);
          }
        }
      });
    };

    const subscribeToMainChart = () => {
      mainChartRef.current?.subscribeVisibleTimeRangeChange(
        handleVisibleTimeRangeChange
      );
    };

    handleVisibleTimeRangeChange();
    const timeoutId = setTimeout(subscribeToMainChart, 100);

    return () => {
      clearTimeout(timeoutId);
      mainChartRef.current?.unsubscribeVisibleTimeRangeChange(
        handleVisibleTimeRangeChange
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
    const headers = 'Date,Time,Open,High,Low,Close,Volume';
    const csvData = seriesData.map((row: any) => {
      const date = new Date(row.time * 1000);
      return `${date.toLocaleString()},${row.open},${row.high},${row.low},${row.close},${row.value}`;
    });
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${csvData.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${obj?.company_name}_${timeframe}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartSectionRef.current
        ?.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err =>
          console.error(
            `Error attempting to enable fullscreen mode: ${err.message}`
          )
        );
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="max-w-md p-10 mx-auto border-0 shadow-2xl glass-card">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 rounded-full border-chart-1/20 border-t-chart-1 animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 rounded-full border-chart-2/20 border-b-chart-2 animate-spin"
                style={{
                  animationDirection: 'reverse',
                  animationDuration: '1.5s',
                }}
              ></div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-transparent bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Loading chart data...
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Fetching the latest market data for analysis
              </div>
              <div className="flex items-center justify-center mt-4 space-x-2">
                <div className="w-2 h-2 rounded-full bg-chart-1 animate-pulse"></div>
                <div
                  className="w-2 h-2 rounded-full bg-chart-2 animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-chart-3 animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-destructive/5">
        <Card className="max-w-md p-10 mx-auto shadow-2xl glass-card border-destructive/20">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/20">
              <HiX className="w-10 h-10 text-destructive" />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-destructive">
                Connection Error
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Unable to fetch chart data. Please check your connection.
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 action-button bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
              >
                <HiRefresh className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!obj) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="max-w-md p-10 mx-auto border-0 shadow-2xl glass-card">
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-chart-1/10 to-chart-1/20">
              <HiChartBar className="w-10 h-10 text-chart-1" />
            </div>
            <div className="text-xl font-bold text-transparent bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              No Data Available
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Please select an instrument to view detailed charts
            </div>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="mt-6 action-button"
            >
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b shadow-lg border-border/50 glass-panel">
        <div className="flex items-center justify-between px-6 py-5">
          {/* Left Section - Navigation & Title */}
          <div className="flex items-center space-x-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="p-0 transition-all duration-300 action-button w-11 h-11 rounded-xl hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/60 hover:shadow-lg"
                  >
                    <HiArrowLeft className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="border-0 glass-panel">
                  Go back to instruments
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex flex-col">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-sidebar-foreground via-sidebar-foreground to-sidebar-foreground/80 bg-clip-text">
                  {obj?.company_name || 'Chart'}
                </h1>
                <div className="flex items-center space-x-3">
                  <Badge className="status-badge px-3 py-1.5 text-xs font-semibold border-0 bg-gradient-to-r from-chart-1/20 to-chart-1/10 text-chart-1 shadow-sm">
                    {obj?.exchange_code || 'N/A'}
                  </Badge>
                  <Badge className="status-badge px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-muted to-muted/80 border-border/50 shadow-sm">
                    {timeframe}m timeframe
                  </Badge>
                </div>
              </div>
              <div className="flex items-center mt-2 space-x-6">
                {autoRefresh && (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-chart-2 live-pulse"></div>
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-chart-2 animate-ping"></div>
                    </div>
                    <Badge className="status-badge px-3 py-1.5 text-xs font-semibold border-0 bg-gradient-to-r from-chart-2/20 to-chart-2/10 text-chart-2 shadow-sm">
                      <HiPlay className="w-3 h-3 mr-1" />
                      Live Updates
                    </Badge>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <HiChartBar className="w-4 h-4" />
                  <span className="font-medium">
                    {data?.data?.length || 0} data points loaded
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Enhanced Controls */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions Panel */}
            <div className="flex items-center p-1.5 space-x-1 rounded-xl glass-panel shadow-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className={`action-button h-9 px-4 rounded-lg transition-all duration-300 ${
                        autoRefresh
                          ? 'bg-gradient-to-r from-chart-2/20 to-chart-2/10 text-chart-2 shadow-sm hover:shadow-md'
                          : 'hover:bg-gradient-to-r hover:from-sidebar-accent/80 hover:to-sidebar-accent/60'
                      }`}
                    >
                      {autoRefresh ? (
                        <>
                          <HiPause className="w-4 h-4 mr-2" />
                          <span className="text-xs font-medium">Pause</span>
                        </>
                      ) : (
                        <>
                          <HiPlay className="w-4 h-4 mr-2" />
                          <span className="text-xs font-medium">Live</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-0 glass-panel">
                    {autoRefresh ? 'Pause' : 'Start'} live market updates
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVolume(!showVolume)}
                      className={`action-button h-9 px-4 rounded-lg transition-all duration-300 ${
                        showVolume
                          ? 'bg-gradient-to-r from-chart-1/20 to-chart-1/10 text-chart-1 shadow-sm hover:shadow-md'
                          : 'hover:bg-gradient-to-r hover:from-sidebar-accent/80 hover:to-sidebar-accent/60'
                      }`}
                    >
                      <HiChartBar className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Volume</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-0 glass-panel">
                    {showVolume ? 'Hide' : 'Show'} volume analysis
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowControls(!showControls)}
                      className={`action-button h-9 px-4 rounded-lg transition-all duration-300 ${
                        showControls
                          ? 'bg-gradient-to-r from-chart-5/20 to-chart-5/10 text-chart-5 shadow-sm hover:shadow-md'
                          : 'hover:bg-gradient-to-r hover:from-sidebar-accent/80 hover:to-sidebar-accent/60'
                      }`}
                    >
                      <HiCog className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Settings</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-0 glass-panel">
                    Toggle chart settings panel
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Separator
              orientation="vertical"
              className="h-8 bg-gradient-to-b from-transparent via-border to-transparent"
            />

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refetch}
                      className="w-10 h-10 p-0 transition-all duration-300 action-button rounded-xl hover:bg-gradient-to-r hover:from-chart-3/20 hover:to-chart-3/10 hover:text-chart-3 hover:shadow-lg"
                    >
                      <HiRefresh className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-0 glass-panel">
                    Refresh market data
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="w-10 h-10 p-0 transition-all duration-300 action-button rounded-xl hover:bg-gradient-to-r hover:from-chart-4/20 hover:to-chart-4/10 hover:text-chart-4 hover:shadow-lg"
                    >
                      <HiDownload className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-0 glass-panel">
                    Export data as CSV
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="w-10 h-10 p-0 transition-all duration-300 action-button rounded-xl hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 hover:text-primary hover:shadow-lg"
                    >
                      {isFullscreen ? (
                        <HiX className="w-5 h-5" />
                      ) : (
                        <HiArrowsExpand className="w-5 h-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-0 glass-panel">
                    {isFullscreen
                      ? 'Exit fullscreen mode'
                      : 'Enter fullscreen mode'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Enhanced More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 transition-all duration-300 action-button rounded-xl hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:shadow-lg"
                >
                  <HiDotsVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-0 shadow-2xl glass-panel"
              >
                <DropdownMenuItem className="p-3 rounded-lg hover:bg-gradient-to-r hover:from-chart-1/10 hover:to-chart-1/5">
                  <HiViewGrid className="w-5 h-5 mr-3 text-chart-1" />
                  <div>
                    <div className="font-medium">Toggle Layout</div>
                    <div className="text-xs text-muted-foreground">
                      Switch chart arrangement
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                <DropdownMenuItem className="p-3 rounded-lg hover:bg-gradient-to-r hover:from-chart-2/10 hover:to-chart-2/5">
                  <HiTrendingUp className="w-5 h-5 mr-3 text-chart-2" />
                  <div>
                    <div className="font-medium">Add Indicator</div>
                    <div className="text-xs text-muted-foreground">
                      Technical analysis tools
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 rounded-lg hover:bg-gradient-to-r hover:from-chart-3/10 hover:to-chart-3/5">
                  <HiColorSwatch className="w-5 h-5 mr-3 text-chart-3" />
                  <div>
                    <div className="font-medium">Customize Theme</div>
                    <div className="text-xs text-muted-foreground">
                      Personalize appearance
                    </div>
                  </div>
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
                defaultSize={24}
                minSize={20}
                maxSize={35}
                className="min-w-0"
              >
                <div className="h-full p-4 bg-gradient-to-b from-sidebar-background/30 to-sidebar-background/10">
                  <Card className="h-full border-0 shadow-2xl glass-card">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between p-5 border-b border-sidebar-border/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-chart-1 to-chart-2"></div>
                          <h3 className="font-bold text-sidebar-foreground">
                            Chart Controls
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowControls(false)}
                          className="w-8 h-8 p-0 rounded-lg action-button hover:bg-gradient-to-r hover:from-destructive/20 hover:to-destructive/10 hover:text-destructive"
                        >
                          <HiX className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex-1 p-5 overflow-y-auto scroll-fade scrollbar-hidden">
                        <ChartControls
                          timeframe={timeframe}
                          chartType={chartType}
                          showVolume={showVolume}
                          autoRefresh={autoRefresh}
                          onTfChange={handleTfChange}
                          onChartTypeChange={(type: keyof SeriesOptionsMap) =>
                            setChartType(type as 'Candlestick' | 'Line')
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
                className="w-1.5 transition-all duration-300 hover:w-2 bg-gradient-to-b from-sidebar-border/50 via-sidebar-border to-sidebar-border/50 hover:bg-gradient-to-b hover:from-chart-1/50 hover:via-chart-2/50 hover:to-chart-3/50"
              />
            </>
          )}

          {/* Enhanced Chart Area */}
          <ResizablePanel defaultSize={showControls ? 76 : 100}>
            <div className="h-full p-4">
              <ResizablePanelGroup direction="vertical">
                {/* Main Chart */}
                <ResizablePanel defaultSize={showVolume ? 75 : 100}>
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
                </ResizablePanel>

                {/* Enhanced Volume Chart */}
                {showVolume && (
                  <>
                    <ResizableHandle
                      withHandle
                      className="h-1.5 my-3 transition-all duration-300 hover:h-2 rounded-full bg-gradient-to-r from-border/50 via-border to-border/50 hover:bg-gradient-to-r hover:from-chart-1/50 hover:via-chart-2/50 hover:to-chart-3/50"
                    />
                    <ResizablePanel defaultSize={25} minSize={15}>
                      <Card className="h-full border-0 shadow-2xl glass-card">
                        <div className="flex items-center justify-between p-4 border-b border-border/30 glass-panel">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-1/10">
                              <HiChartBar className="w-4 h-4 text-chart-1" />
                            </div>
                            <div>
                              <span className="font-bold text-card-foreground">
                                Volume Analysis
                              </span>
                              <div className="text-xs text-muted-foreground">
                                Trading volume patterns
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowVolume(false)}
                            className="w-8 h-8 p-0 rounded-lg action-button hover:bg-gradient-to-r hover:from-destructive/20 hover:to-destructive/10 hover:text-destructive"
                          >
                            <HiEyeOff className="w-4 h-4" />
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
