/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Tooltip } from "flowbite-react";
import { useGetCandlesQuery } from "../services/instrumentService";
import { formatDate, calculateMA, calculateBollingerBands, calculateRSI, calculateMACD } from "../common-functions";
import { Candle, Instrument } from "../common-types";
import { useAppSelector } from "../app/hooks";
import { getMode } from "../features/darkModeSlice";
import { HiArrowLeft, HiInformationCircle, HiXMark } from "react-icons/hi2";
import { HiArrowsExpand, HiDownload, HiRefresh } from "react-icons/hi";
import { SeriesOptionsMap, Time } from "lightweight-charts";
import ChartControls from "../components/ChartControls";
import MainChart from "../components/MainChart";
import VolumeChart from "../components/VolumeChart";
import IndicatorChart from "../components/IndicatorChart";
import ResponsiveSidebar from "../components/ResponsiveSidebar";

interface LocationState {
  obj: Instrument;
}

// Custom hook to get window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

const GraphsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = useAppSelector(getMode);
  const { obj } = (location.state as LocationState) || {};
  const [timeframe, setTimeFrame] = useState<number>(15);
  const [chartType, setChartType] = useState<"Candlestick" | "Line">("Candlestick");
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [indicators, setIndicators] = useState<any[]>([
    { name: "MA", active: false, data: [] },
    { name: "Bollinger Bands", active: false, data: [] },
    { name: "RSI", active: false, data: [] },
    { name: "MACD", active: true, data: [] },
  ]);

  const { data, refetch, isLoading, isError } = useGetCandlesQuery({
    id: obj?.id,
    tf: timeframe,
  });

  // Refs for charts
  const mainChartRef = useRef<any>(null);
  const volumeChartRef = useRef<any>(null);
  const indicatorChartRef = useRef<any>(null);

  // State for fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Use custom hook to get window size
  const windowSize = useWindowSize();

  // Handle fullscreen toggle
  const chartSectionRef = useRef<HTMLDivElement>(null);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartSectionRef.current
        ?.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
        });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Listen for fullscreen changes to update state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen]);

  const seriesData = useMemo(() => {
    if (!data) return [];
    return data.data.map(({ date, open, high, low, close, volume = 0 }: Candle) => ({
      time: formatDate(date) as Time,
      open,
      high,
      low,
      close,
      value: volume,
    }));
  }, [data]);

  const volumeData = useMemo(() => {
    if (!data) return [];
    return data.data.map(({ date, close, volume = 0 }: Candle, index: number, array: Candle[]) => {
      const previousClose = index > 0 ? array[index - 1].close : close;
      const color = close >= previousClose ? "rgba(76, 175, 80, 0.5)" : "rgba(255, 82, 82, 0.5)";
      return {
        time: formatDate(date) as Time,
        value: volume,
        color,
      };
    });
  }, [data]);

  // Update indicators based on seriesData
  useEffect(() => {
    if (seriesData.length > 0) {
      const updatedIndicators = indicators.map((indicator) => {
        let data: any = [];
        switch (indicator.name) {
          case "MA":
            data = calculateMA(seriesData, 20);
            break;
          case "Bollinger Bands":
            data = calculateBollingerBands(seriesData);
            break;
          case "RSI":
            data = calculateRSI(seriesData);
            break;
          case "MACD":
            data = calculateMACD(seriesData);
            break;
          default:
            break;
        }
        return { ...indicator, data };
      });
      setIndicators(updatedIndicators);
    }
    // We include indicators in dependency array to update when their active state changes
  }, [seriesData]);

  // Handle auto-refresh
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

  // Synchronize charts
  const syncCharts = useCallback(() => {
    if (!mainChartRef.current) return;

    const getChartsToSync = () => {
      const charts = [];
      if (showVolume && volumeChartRef.current) charts.push(volumeChartRef.current);
      if (indicators.some((ind) => ind.active) && indicatorChartRef.current) charts.push(indicatorChartRef.current);
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
      mainChartRef.current?.subscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
    };

    // Initial sync
    handleVisibleTimeRangeChange();

    // Subscribe after a short delay to ensure all charts are ready
    const timeoutId = setTimeout(subscribeToMainChart, 100);

    return () => {
      clearTimeout(timeoutId);
      mainChartRef.current?.unsubscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
    };
  }, [showVolume, indicators]);

  useEffect(() => {
    const cleanup = syncCharts();
    return () => {
      if (cleanup) cleanup();
    };
  }, [syncCharts, seriesData, showVolume, indicators]);

  const handleTfChange = (tf: number) => {
    setTimeFrame(tf);
    if (timeframe === tf) {
      refetch();
    }
  };

  // Convert Unix timestamp to local time
  function convertUnixToLocalTime(unixTimestamp: number) {
    const date = new Date(unixTimestamp * 1000);
    const localTime = date.toLocaleString();
    return localTime;
  }

  // Handle CSV download
  const handleDownload = () => {
    const headers = "Date,Time,Open,High,Low,Close,Volume";
    const csvData = seriesData.map((row: any) => `${convertUnixToLocalTime(row.time)},${row.open},${row.high},${row.low},${row.close},${row.value}`);
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${csvData.join("\n")}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${obj?.company_name}_${timeframe}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle indicator activation
  const toggleIndicator = (name: string) => {
    setIndicators((prevIndicators) => prevIndicators.map((ind) => (ind.name === name ? { ...ind, active: !ind.active } : ind)));
  };

  // Loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-gray-700 dark:text-gray-300">Loading chart data...</div>;
  }

  // Error state
  if (isError) {
    return <div className="flex items-center justify-center h-screen text-red-500">Failed to load chart data. Please try again later.</div>;
  }

  // No data state
  if (!obj) {
    return <div className="flex items-center justify-center h-screen text-gray-700 dark:text-gray-300">No instrument data available.</div>;
  }

  return (
    <div className="flex flex-col h-screen transition-all ease-in-out delay-100 bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky z-10 w-full m-auto bg-white shadow-md top-16 dark:bg-gray-800">
        <div className="flex items-center justify-between max-w-full p-2 mx-auto">
          <Button color="light" onClick={() => navigate(-1)} className="md:hidden" aria-label="Go Back">
            <HiArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800 truncate dark:text-white">{obj?.exchange_code} Chart</h1>
          <div className="flex space-x-2">
            <Tooltip placement="bottom-start" content="Refresh data">
              <Button color="light" onClick={() => refetch()} aria-label="Refresh Data">
                <HiRefresh className="w-5 h-5" />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom-start" content="Download CSV">
              <Button color="light" onClick={handleDownload} aria-label="Download CSV">
                <HiDownload className="w-5 h-5" />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom-start" content={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <Button color="light" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                {isFullscreen ? <HiXMark className="w-5 h-5" /> : <HiArrowsExpand className="w-5 h-5" />}
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-grow overflow-hidden">
        <div ref={chartSectionRef} className="flex flex-grow">
          {/* Sidebar Section */}
          <ResponsiveSidebar isFullscreen={isFullscreen}>
            <ChartControls
              timeframe={timeframe}
              chartType={chartType}
              showVolume={showVolume}
              autoRefresh={autoRefresh}
              indicators={indicators}
              onTfChange={handleTfChange}
              onChartTypeChange={(type: keyof SeriesOptionsMap) => setChartType(type as "Candlestick" | "Line")}
              onShowVolumeChange={setShowVolume}
              onAutoRefreshChange={setAutoRefresh}
              onToggleIndicator={toggleIndicator}
            />
          </ResponsiveSidebar>

          {/* Charts Section */}
          <div className="flex flex-col flex-grow overflow-auto">
            <Card className="flex-grow">
              <MainChart
                seriesData={seriesData}
                chartType={chartType}
                indicators={indicators}
                mode={mode}
                obj={obj}
                timeframe={timeframe}
                width={isFullscreen ? windowSize.width * 0.95 : windowSize.width * 0.8}
                height={windowSize.height * 0.75} // Adjust height as needed
                setTimeScale={(timeScale: any) => (mainChartRef.current = timeScale)}
              />
            </Card>

            <div className="flex flex-grow space-x-1">
              {showVolume && (
                <Card className="flex-1">
                  <VolumeChart
                    volumeData={volumeData}
                    mode={mode}
                    width={isFullscreen ? windowSize.width * 0.475 : windowSize.width * 0.4}
                    height={windowSize.height * 0.25} // Adjust height as needed
                    setTimeScale={(timeScale: any) => (volumeChartRef.current = timeScale)}
                  />
                </Card>
              )}

              <Card className="flex-1">
                <IndicatorChart
                  indicators={indicators}
                  mode={mode}
                  width={isFullscreen ? windowSize.width * 0.475 : windowSize.width * 0.4}
                  height={windowSize.height * 0.25} // Adjust height as needed
                  setTimeScale={(timeScale: any) => (indicatorChartRef.current = timeScale)}
                />
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-white shadow-md dark:bg-gray-800">
        <div className="flex items-center justify-center mx-auto text-sm text-gray-600 max-w-7xl dark:text-gray-400">
          <HiInformationCircle className="w-4 h-4 mr-1" />
          <span>Chart data is for educational purposes only. Not financial advice.</span>
        </div>
      </footer>
    </div>
  );
};

export default GraphsPage;
