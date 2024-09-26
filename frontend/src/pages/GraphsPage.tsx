/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Tooltip } from "flowbite-react";
import { useGetCandlesQuery } from "../services/instrumentService";
import { formatDate, calculateMA, calculateBollingerBands, calculateRSI, calculateMACD } from "../common-functions";
import { Candle, Indicator, Instrument } from "../common-types";
import { useAppSelector } from "../app/hooks";
import { getMode } from "../features/darkModeSlice";
import { HiArrowLeft, HiRefresh, HiDownload, HiInformationCircle } from "react-icons/hi";
import { ITimeScaleApi, SeriesType, Time } from "lightweight-charts";
import ChartControls from "../components/ChartControls";
import MainChart from "../components/MainChart";
import VolumeChart from "../components/VolumeChart";
import IndicatorChart from "../components/IndicatorChart";

interface LocationState {
  obj: Instrument;
}

const GraphsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = useAppSelector(getMode);
  const { obj } = (location.state as LocationState) || {};
  const [timeframe, setTimeFrame] = useState<number>(15);
  const [chartType, setChartType] = useState<SeriesType>("Candlestick");
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [indicators, setIndicators] = useState<Indicator[]>([
    { name: "MA", active: false, data: [] },
    { name: "Bollinger Bands", active: false, data: [] },
    { name: "RSI", active: false, data: [] },
    { name: "MACD", active: true, data: [] },
  ]);

  const { data, refetch } = useGetCandlesQuery({
    id: obj?.id,
    tf: timeframe,
  });

  const mainChartRef = useRef<ITimeScaleApi<Time> | null>(null);
  const volumeChartRef = useRef<ITimeScaleApi<Time> | null>(null);
  const indicatorChartRef = useRef<ITimeScaleApi<Time> | null>(null);

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
        }
        return { ...indicator, data };
      });
      setIndicators(updatedIndicators);
    }
  }, [seriesData]);

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

  function convertUnixToLocalTime(unixTimestamp:number) {
    // Convert Unix timestamp (in seconds) to milliseconds by multiplying by 1000
    const date = new Date(unixTimestamp * 1000);

    // Use toLocaleString() to convert the date to the local time string
    const localTime = date.toLocaleString();

    return localTime;
}

  const handleDownload = () => {
    const headers = "Date,Open,High,Low,Close,Volume";
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

  const toggleIndicator = (name: string) => {
    setIndicators((prevIndicators) => prevIndicators.map((ind) => (ind.name === name ? { ...ind, active: !ind.active } : ind)));
  };

  if (!obj) {
    return <div>No instrument data available.</div>;
  }

  return (
    <div className="flex flex-col items-stretch justify-start min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="p-4 bg-white shadow-md dark:bg-gray-800">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
          <Button color="light" onClick={() => navigate(-1)}>
            <HiArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{obj?.exchange_code} Chart</h1>
          <div className="flex space-x-2">
            <Tooltip content="Refresh data">
              <Button color="light" onClick={() => refetch()}>
                <HiRefresh className="w-5 h-5" />
              </Button>
            </Tooltip>
            <Tooltip content="Download CSV">
              <Button color="light" onClick={handleDownload}>
                <HiDownload className="w-5 h-5" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="mx-auto max-w-7xl">
          <Card className="mb-4">
            <ChartControls
              timeframe={timeframe}
              chartType={chartType}
              showVolume={showVolume}
              autoRefresh={autoRefresh}
              indicators={indicators}
              onTfChange={handleTfChange}
              onChartTypeChange={setChartType}
              onShowVolumeChange={setShowVolume}
              onAutoRefreshChange={setAutoRefresh}
              onToggleIndicator={toggleIndicator}
            />
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Card className="col-span-1">
              <MainChart
                seriesData={seriesData}
                chartType={chartType}
                indicators={indicators}
                mode={mode}
                obj={obj}
                timeframe={timeframe}
                setTimeScale={(timeScale) => (mainChartRef.current = timeScale)}
              />
            </Card>

            {showVolume && (
              <Card className="col-span-1">
                <VolumeChart volumeData={volumeData} mode={mode} setTimeScale={(timeScale) => (volumeChartRef.current = timeScale)} />
              </Card>
            )}

            <Card className="col-span-1">
              <IndicatorChart indicators={indicators} mode={mode} setTimeScale={(timeScale) => (indicatorChartRef.current = timeScale)} />
            </Card>
          </div>
        </div>
      </main>

      <footer className="p-4 mt-4 bg-white shadow-md dark:bg-gray-800">
        <div className="flex items-center justify-center mx-auto text-sm text-gray-600 max-w-7xl dark:text-gray-400">
          <HiInformationCircle className="w-4 h-4 mr-1" />
          <span>Chart data is for educational purposes only. Not financial advice.</span>
        </div>
      </footer>
    </div>
  );
};

export default GraphsPage;
