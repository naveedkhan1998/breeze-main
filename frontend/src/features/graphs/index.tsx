/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  setShowVolume,
  selectTimeframe,
  selectShowVolume,
  selectAutoRefresh,
  selectShowControls,
  setIsFullscreen,
  setShowControls,
} from './graphSlice';
import React, { useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { Time } from 'lightweight-charts';

import { Button } from '@/components/ui/button';

import { HiX, HiChartBar } from 'react-icons/hi';

import type { Candle, Instrument } from '@/types/common-types';
import { useTheme } from '@/components/ThemeProvider';
import { useGetCandlesQuery } from '@/api/instrumentService';
import { formatDate } from '@/lib/functions';
import ChartControls from './components/ChartControls';
import MainChart from './components/MainChart';
import VolumeChart from './components/VolumeChart';
import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import NotFoundScreen from './components/NotFoundScreen';
import GraphHeader from './components/GraphHeader';
import { X } from 'lucide-react';

interface LocationState {
  obj: Instrument;
}

const GraphsPage: React.FC = () => {
  const location = useLocation();

  const { obj } = (location.state as LocationState) || {};
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // State variables
  const dispatch = useAppDispatch();
  const timeframe = useAppSelector(selectTimeframe);
  const showVolume = useAppSelector(selectShowVolume);
  const autoRefresh = useAppSelector(selectAutoRefresh);

  const showControls = useAppSelector(selectShowControls);

  const { data, refetch, isLoading, isError } = useGetCandlesQuery({
    id: obj?.id,
    tf: timeframe,
  });

  // Refs
  const mainChartRef = useRef<any>(null);
  const volumeChartRef = useRef<any>(null);
  const chartSectionRef = useRef<HTMLDivElement>(null);

  const setMainChartTimeScale = useCallback((timeScale: any) => {
    mainChartRef.current = timeScale;
  }, []);

  const setVolumeChartTimeScale = useCallback((timeScale: any) => {
    volumeChartRef.current = timeScale;
  }, []);

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
        .then(() => dispatch(setIsFullscreen(true)))
        .catch(err =>
          console.error(
            `Error attempting to enable fullscreen mode: ${err.message}`
          )
        );
    } else {
      document.exitFullscreen().then(() => dispatch(setIsFullscreen(false)));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      dispatch(setIsFullscreen(!!document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <ErrorScreen />;
  }

  if (!obj) {
    return <NotFoundScreen />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Enhanced Header */}
      <GraphHeader
        data={data}
        obj={obj}
        handleDownload={handleDownload}
        toggleFullscreen={toggleFullscreen}
        refetch={refetch}
      />

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
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-5 border-b border-sidebar-border/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-chart-1 to-chart-2"></div>
                        <h3 className="font-bold text-sidebar-foreground">
                          Settings
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch(setShowControls(false))}
                        className="w-8 h-8 p-0 rounded-lg action-button hover:bg-gradient-to-r hover:from-destructive/20 hover:to-destructive/10 hover:text-destructive"
                      >
                        <HiX className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto scroll-fade scrollbar-hidden">
                      <ChartControls />
                    </div>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
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
                    mode={isDarkMode}
                    obj={obj}
                    setTimeScale={setMainChartTimeScale}
                  />
                </ResizablePanel>

                {/* Enhanced Volume Chart */}
                {showVolume && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={25} minSize={15}>
                      <div className="flex items-center justify-between p-4 border-b border-border/30 ">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-1/10">
                            <HiChartBar className="w-4 h-4 text-chart-1" />
                          </div>
                          <div>
                            <span className="font-bold text-card-foreground">
                              Volume
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(setShowVolume(false))}
                          className="w-8 h-8 p-0 rounded-lg action-button hover:bg-gradient-to-r hover:from-destructive/20 hover:to-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <VolumeChart
                        volumeData={volumeData}
                        mode={isDarkMode}
                        setTimeScale={setVolumeChartTimeScale}
                      />
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
