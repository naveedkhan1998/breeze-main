/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Dropdown, Card, Tooltip, ToggleSwitch } from "flowbite-react";
import { createChart, IChartApi, SeriesType, ISeriesApi, Time, ITimeScaleApi, LineData, HistogramData } from "lightweight-charts";
import { useGetCandlesQuery, useLoadInstrumentCandlesMutation } from "../services/instrumentService";
import { formatDate, calculateMA, calculateBollingerBands, calculateRSI, calculateMACD } from "../common-functions";
import { Candle, Indicator, Instrument } from "../common-types";
import { useAppSelector } from "../app/hooks";
import { getMode } from "../features/darkModeSlice";
import { HiArrowLeft, HiRefresh, HiClock, HiDownload, HiInformationCircle } from "react-icons/hi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

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

  const mainChartContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorChartContainerRef = useRef<HTMLDivElement | null>(null);
  const volumeChartContainerRef = useRef<HTMLDivElement | null>(null);

  const mainChartRef = useRef<IChartApi | null>(null);
  const indicatorChartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);

  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const indicatorSeriesRef = useRef<{ [key: string]: ISeriesApi<any> }>({});
  const indicatorChartSeriesRef = useRef<{ [key: string]: ISeriesApi<any> }>({});
  const prevChartTypeRef = useRef<SeriesType>(chartType);

  const [loadInstrumentCandles] = useLoadInstrumentCandlesMutation();

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
        let data:
          | LineData<Time>[]
          | { time: string | undefined; upper: number; middle: number; lower: number }[]
          | { time: string | undefined; value: number }[]
          | { time: string | undefined; macd: number; signal: number; histogram: number }[] = [];
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

  const handleResize = useCallback(() => {
    if (mainChartRef.current && mainChartContainerRef.current) {
      const height = window.innerHeight * 0.5;
      mainChartRef.current.applyOptions({
        width: mainChartContainerRef.current.clientWidth,
        height,
      });
      mainChartContainerRef.current.style.height = `${height}px`;
    }
    if (indicatorChartRef.current && indicatorChartContainerRef.current) {
      const height = window.innerHeight * 0.2;
      indicatorChartRef.current.applyOptions({
        width: indicatorChartContainerRef.current.clientWidth,
        height,
      });
      indicatorChartContainerRef.current.style.height = `${height}px`;
    }
    if (volumeChartRef.current && volumeChartContainerRef.current) {
      const height = window.innerHeight * 0.2;
      volumeChartRef.current.applyOptions({
        width: volumeChartContainerRef.current.clientWidth,
        height,
      });
      volumeChartContainerRef.current.style.height = `${height}px`;
    }
  }, []);
  //@ts-expect-error suiiiii
  const syncCharts = useCallback((mainTimeScale: ITimeScaleApi, ...otherTimeScales: ITimeScaleApi[]) => {
    const handleVisibleTimeRangeChange = () => {
      const mainVisibleRange = mainTimeScale.getVisibleRange();
      otherTimeScales.forEach((timeScale) => {
        timeScale.setVisibleRange(mainVisibleRange);
      });
    };

    mainTimeScale.subscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);

    return () => {
      mainTimeScale.unsubscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange);
    };
  }, []);

  const renderMainChart = useCallback(() => {
    if (mainChartContainerRef.current && seriesData.length) {
      if (!mainChartRef.current) {
        mainChartContainerRef.current.innerHTML = "";
        const height = window.innerHeight * 0.5;
        const chart = createChart(mainChartContainerRef.current, {
          width: mainChartContainerRef.current.clientWidth,
          height,
          layout: {
            textColor: mode ? "#FFFFFF" : "#191919",
            background: { color: mode ? "#1F2937" : "#F3F4F6" },
            fontSize: 12,
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
          rightPriceScale: {
            borderColor: mode ? "#374151" : "#D1D5DB",
          },
          crosshair: {
            mode: 1,
            vertLine: {
              width: 1,
              color: mode ? "#4B5563" : "#9CA3AF",
              style: 1,
            },
            horzLine: {
              visible: true,
              labelVisible: true,
            },
          },
          grid: {
            vertLines: {
              color: mode ? "#374151" : "#E5E7EB",
            },
            horzLines: {
              color: mode ? "#374151" : "#E5E7EB",
            },
          },
        });

        const mainSeries =
          chartType === "Candlestick"
            ? chart.addCandlestickSeries({
                upColor: "#10B981",
                downColor: "#EF4444",
                borderVisible: false,
                wickUpColor: "#10B981",
                wickDownColor: "#EF4444",
              })
            : chart.addLineSeries({
                color: "#3B82F6",
                lineWidth: 2,
              });

        mainSeries.setData(seriesData);
        seriesRef.current = mainSeries;
        prevChartTypeRef.current = chartType;

        indicators.forEach((indicator) => {
          if (indicator.active) {
            switch (indicator.name) {
              case "MA": {
                const maSeries = chart.addLineSeries({
                  color: "#F59E0B",
                  lineWidth: 2,
                });
                maSeries.setData(indicator.data);
                indicatorSeriesRef.current[indicator.name] = maSeries;
                break;
              }
              case "Bollinger Bands": {
                const upperBandSeries = chart.addLineSeries({
                  color: "#10B981",
                  lineWidth: 1,
                });
                const lowerBandSeries = chart.addLineSeries({
                  color: "#EF4444",
                  lineWidth: 1,
                });
                upperBandSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.upper })));
                lowerBandSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.lower })));
                indicatorSeriesRef.current[`${indicator.name}_upper`] = upperBandSeries;
                indicatorSeriesRef.current[`${indicator.name}_lower`] = lowerBandSeries;
                break;
              }
            }
          }
        });

        const legendContainer = document.createElement("div");
        legendContainer.className = `absolute top-4 left-4 bg-white dark:bg-gray-800 dark:text-white p-2 rounded shadow-md text-sm z-[10]`;

        mainChartContainerRef.current.appendChild(legendContainer);

        const legendRow = document.createElement("div");
        legendRow.className = "mb-1 font-semibold";
        legendRow.innerHTML = `${obj?.company_name} | ${obj?.exchange_code} | Timeframe: ${timeframe}`;

        const ohlcRow = document.createElement("div");
        ohlcRow.innerHTML = "<strong>OHLC:</strong> ";

        legendContainer.appendChild(legendRow);
        legendContainer.appendChild(ohlcRow);

        chart.subscribeCrosshairMove((param) => {
          let ohlcValues = "";
          if (param.time) {
            const data = param.seriesData.get(mainSeries) as any;
            if (data) {
              if (chartType === "Candlestick") {
                const { open, high, low, close } = data;
                ohlcValues = `<strong>O:</strong> ${open.toFixed(2)} | <strong>H:</strong> ${high.toFixed(2)} | <strong>L:</strong> ${low.toFixed(2)} | <strong>C:</strong> ${close.toFixed(2)}`;
              } else {
                ohlcValues = `<strong>Price:</strong> ${data.value.toFixed(2)}`;
              }
            }
          }
          legendRow.innerHTML = `${obj?.company_name} | ${obj?.exchange_code} | Timeframe: ${timeframe}`;
          ohlcRow.innerHTML = `<strong>OHLC:</strong> ${ohlcValues}`;
        });

        mainChartRef.current = chart;
      } else {
        if (prevChartTypeRef.current !== chartType) {
          if (seriesRef.current) {
            mainChartRef.current.removeSeries(seriesRef.current);
          }

          const mainSeries =
            chartType === "Candlestick"
              ? mainChartRef.current.addCandlestickSeries({
                  upColor: "#10B981",
                  downColor: "#EF4444",
                  borderVisible: false,
                  wickUpColor: "#10B981",
                  wickDownColor: "#EF4444",
                })
              : mainChartRef.current.addLineSeries({
                  color: "#3B82F6",
                  lineWidth: 2,
                });

          mainSeries.setData(seriesData);
          seriesRef.current = mainSeries;
          prevChartTypeRef.current = chartType;
        } else {
          seriesRef.current!.setData(seriesData);
        }

        indicators.forEach((indicator) => {
          if (indicator.active) {
            if (!indicatorSeriesRef.current[indicator.name]) {
              switch (indicator.name) {
                case "MA": {
                  const maSeries = mainChartRef.current!.addLineSeries({
                    color: "#F59E0B",
                    lineWidth: 2,
                  });
                  maSeries.setData(indicator.data);
                  indicatorSeriesRef.current[indicator.name] = maSeries;
                  break;
                }
                case "Bollinger Bands": {
                  const upperBandSeries = mainChartRef.current!.addLineSeries({
                    color: "#10B981",
                    lineWidth: 1,
                  });
                  const lowerBandSeries = mainChartRef.current!.addLineSeries({
                    color: "#EF4444",
                    lineWidth: 1,
                  });
                  upperBandSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.upper })));
                  lowerBandSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.lower })));
                  indicatorSeriesRef.current[`${indicator.name}_upper`] = upperBandSeries;
                  indicatorSeriesRef.current[`${indicator.name}_lower`] = lowerBandSeries;
                  break;
                }
              }
            } else {
              switch (indicator.name) {
                case "MA":
                  indicatorSeriesRef.current[indicator.name].setData(indicator.data);
                  break;
                case "Bollinger Bands":
                  indicatorSeriesRef.current[`${indicator.name}_upper`].setData(indicator.data.map((d: any) => ({ time: d.time, value: d.upper })));
                  indicatorSeriesRef.current[`${indicator.name}_lower`].setData(indicator.data.map((d: any) => ({ time: d.time, value: d.lower })));
                  break;
              }
            }
          } else {
            if (indicatorSeriesRef.current[indicator.name]) {
              mainChartRef.current!.removeSeries(indicatorSeriesRef.current[indicator.name]);
              delete indicatorSeriesRef.current[indicator.name];
            }
            if (indicator.name === "Bollinger Bands") {
              if (indicatorSeriesRef.current[`${indicator.name}_upper`]) {
                mainChartRef.current!.removeSeries(indicatorSeriesRef.current[`${indicator.name}_upper`]);
                delete indicatorSeriesRef.current[`${indicator.name}_upper`];
              }
              if (indicatorSeriesRef.current[`${indicator.name}_lower`]) {
                mainChartRef.current!.removeSeries(indicatorSeriesRef.current[`${indicator.name}_lower`]);
                delete indicatorSeriesRef.current[`${indicator.name}_lower`];
              }
            }
          }
        });
      }
    }
  }, [seriesData, mode, obj?.company_name, obj?.exchange_code, timeframe, chartType, indicators]);

  const renderIndicatorChart = useCallback(() => {
    const activeIndicators = indicators.filter((ind) => ind.active && (ind.name === "RSI" || ind.name === "MACD"));
    if (indicatorChartContainerRef.current && activeIndicators.length > 0) {
      if (!indicatorChartRef.current) {
        indicatorChartContainerRef.current.innerHTML = "";
        const height = window.innerHeight * 0.2;
        const chart = createChart(indicatorChartContainerRef.current, {
          width: indicatorChartContainerRef.current.clientWidth,
          height,
          layout: {
            textColor: mode ? "#FFFFFF" : "#191919",
            background: { color: mode ? "#1F2937" : "#F3F4F6" },
            fontSize: 12,
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
          rightPriceScale: {
            borderColor: mode ? "#374151" : "#D1D5DB",
          },
          crosshair: {
            mode: 1,
            vertLine: {
              width: 1,
              color: mode ? "#4B5563" : "#9CA3AF",
              style: 1,
            },
            horzLine: {
              visible: true,
              labelVisible: true,
            },
          },
          grid: {
            vertLines: {
              color: mode ? "#374151" : "#E5E7EB",
            },
            horzLines: {
              color: mode ? "#374151" : "#E5E7EB",
            },
          },
        });

        activeIndicators.forEach((indicator) => {
          if (indicator.name === "RSI") {
            const rsiSeries = chart.addLineSeries({
              color: "#F59E0B",
              lineWidth: 2,
            });
            rsiSeries.setData(indicator.data);
            indicatorChartSeriesRef.current[indicator.name] = rsiSeries;
          } else if (indicator.name === "MACD") {
            const macdSeries = chart.addLineSeries({
              color: "#3B82F6",
              lineWidth: 2,
            });
            const signalSeries = chart.addLineSeries({
              color: "#EF4444",
              lineWidth: 2,
            });
            const histogramSeries = chart.addHistogramSeries({
              color: "#10B981",
            });

            macdSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.macd })));
            signalSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.signal })));
            histogramSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.histogram })));

            indicatorChartSeriesRef.current[`${indicator.name}_macd`] = macdSeries;
            indicatorChartSeriesRef.current[`${indicator.name}_signal`] = signalSeries;
            indicatorChartSeriesRef.current[`${indicator.name}_histogram`] = histogramSeries;
          }
        });

        indicatorChartRef.current = chart;
      } else {
        activeIndicators.forEach((indicator) => {
          if (indicator.name === "RSI") {
            if (!indicatorChartSeriesRef.current[indicator.name]) {
              const rsiSeries = indicatorChartRef.current!.addLineSeries({
                color: "#F59E0B",
                lineWidth: 2,
              });
              rsiSeries.setData(indicator.data);
              indicatorChartSeriesRef.current[indicator.name] = rsiSeries;
            } else {
              indicatorChartSeriesRef.current[indicator.name].setData(indicator.data);
            }
          } else if (indicator.name === "MACD") {
            if (!indicatorChartSeriesRef.current[`${indicator.name}_macd`]) {
              const macdSeries = indicatorChartRef.current!.addLineSeries({
                color: "#3B82F6",
                lineWidth: 2,
              });
              const signalSeries = indicatorChartRef.current!.addLineSeries({
                color: "#EF4444",
                lineWidth: 2,
              });
              const histogramSeries = indicatorChartRef.current!.addHistogramSeries({
                color: "#10B981",
              });
              macdSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.macd })));
              signalSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.signal })));
              histogramSeries.setData(indicator.data.map((d: any) => ({ time: d.time, value: d.histogram })));
              indicatorChartSeriesRef.current[`${indicator.name}_macd`] = macdSeries;
              indicatorChartSeriesRef.current[`${indicator.name}_signal`] = signalSeries;
              indicatorChartSeriesRef.current[`${indicator.name}_histogram`] = histogramSeries;
            } else {
              indicatorChartSeriesRef.current[`${indicator.name}_macd`].setData(indicator.data.map((d: any) => ({ time: d.time, value: d.macd })));
              indicatorChartSeriesRef.current[`${indicator.name}_signal`].setData(indicator.data.map((d: any) => ({ time: d.time, value: d.signal })));
              indicatorChartSeriesRef.current[`${indicator.name}_histogram`].setData(indicator.data.map((d: any) => ({ time: d.time, value: d.histogram })));
            }
          }
        });

        const inactiveIndicators = ["RSI", "MACD"].filter((name) => !activeIndicators.some((ind) => ind.name === name));
        inactiveIndicators.forEach((indicatorName) => {
          if (indicatorChartSeriesRef.current[indicatorName]) {
            indicatorChartRef.current!.removeSeries(indicatorChartSeriesRef.current[indicatorName]);
            delete indicatorChartSeriesRef.current[indicatorName];
          }
          if (indicatorName === "MACD") {
            ["macd", "signal", "histogram"].forEach((suffix) => {
              const key = `${indicatorName}_${suffix}`;
              if (indicatorChartSeriesRef.current[key]) {
                indicatorChartRef.current!.removeSeries(indicatorChartSeriesRef.current[key]);
                delete indicatorChartSeriesRef.current[key];
              }
            });
          }
        });
      }
    } else {
      if (indicatorChartRef.current) {
        indicatorChartRef.current.remove();
        indicatorChartRef.current = null;
        indicatorChartSeriesRef.current = {};
      }
    }
  }, [indicators, mode]);

  const renderVolumeChart = useCallback(() => {
    if (!volumeChartContainerRef.current || !volumeData.length) return;

    if (!showVolume) {
      if (volumeChartRef.current) {
        volumeChartRef.current.remove();
        volumeChartRef.current = null;
        volumeSeriesRef.current = null;
      }
      return;
    }

    const allVolumesAreZero = volumeData.every((item: { value: number }) => item.value === 0);
    if (allVolumesAreZero) {
      setShowVolume(false);
      toast.warning("No Volume Data for selected Instrument");
      return;
    }

    if (!volumeChartRef.current) {
      volumeChartContainerRef.current.innerHTML = "";

      const chartHeight = window.innerHeight * 0.2;
      const chartOptions = {
        width: volumeChartContainerRef.current.clientWidth,
        height: chartHeight,
        layout: {
          textColor: mode ? "#FFFFFF" : "#191919",
          background: { color: mode ? "#1F2937" : "#F3F4F6" },
          fontSize: 12,
        },
        timeScale: {
          visible: true,
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: mode ? "#374151" : "#D1D5DB",
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            color: mode ? "#374151" : "#E5E7EB",
          },
        },
      };

      const chart = createChart(volumeChartContainerRef.current, chartOptions);

      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "right",
      });

      volumeSeries.setData(volumeData as HistogramData<Time>[]);
      volumeSeriesRef.current = volumeSeries;
      volumeChartRef.current = chart;
    } else {
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(volumeData as HistogramData<Time>[]);
      }
    }
  }, [volumeData, mode, showVolume]);

  useEffect(() => {
    renderMainChart();
    renderIndicatorChart();
    renderVolumeChart();

    if (mainChartRef.current) {
      const chartsToSync = [indicatorChartRef.current, volumeChartRef.current].filter((chart): chart is IChartApi => chart !== null);

      const cleanupFunctions = chartsToSync.map((chart) => syncCharts(mainChartRef.current!.timeScale(), chart.timeScale()));

      return () => {
        cleanupFunctions.forEach((cleanup) => cleanup());
      };
    }
  }, [renderMainChart, renderIndicatorChart, renderVolumeChart, syncCharts]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

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

  const handleTfChange = (tf: number) => {
    setTimeFrame(tf);
    if (timeframe === tf) {
      refetch();
    }
  };

  const handleClick = (id: number) => {
    loadInstrumentCandles({ id });
    refetch();
  };

  const handleDownload = () => {
    const headers = "Date,Open,High,Low,Close,Volume";
    const csvData = seriesData.map((row: any) => `${row.time},${row.open},${row.high},${row.low},${row.close},${row.value}`);
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
    <div className="flex flex-col items-center justify-start min-h-screen p-4 overflow-x-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-7xl">
        <Card>
          <div className="flex flex-col items-center justify-between mb-6 space-y-4 sm:flex-row sm:space-y-0">
            <Button color="light" onClick={() => navigate(-1)}>
              <HiArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            <h2 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 sm:text-2xl sm:text-left">{obj.exchange_code} Chart</h2>
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

          <div className="z-20 flex flex-wrap justify-center gap-4 mb-6">
            <Dropdown label={`Timeframe: ${timeframe}`} size="sm">
              {[5, 10, 15, 30, 60, 240, 1440].map((tf) => (
                <Dropdown.Item key={tf} onClick={() => handleTfChange(tf)}>
                  {tf}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => {
                  const customTimeFrame = prompt("Enter custom time frame (in minutes):");
                  if (customTimeFrame !== null) {
                    const parsedTimeFrame = parseInt(customTimeFrame, 10);
                    if (!isNaN(parsedTimeFrame) && parsedTimeFrame > 0) {
                      handleTfChange(parsedTimeFrame);
                    } else {
                      toast.error("Invalid input. Please enter a positive number.");
                    }
                  }
                }}
              >
                Custom +
              </Dropdown.Item>
            </Dropdown>

            <Button size="sm" onClick={() => obj && handleClick(obj.id)} disabled>
              <HiClock className="w-4 h-4 mr-2" /> Load Candles
            </Button>

            <Dropdown label={`Chart: ${chartType}`} size="sm">
              <Dropdown.Item onClick={() => setChartType("Candlestick")}>Candlestick</Dropdown.Item>
              <Dropdown.Item onClick={() => setChartType("Line")}>Line</Dropdown.Item>
            </Dropdown>

            <Dropdown label="Indicators" size="sm" dismissOnClick={false}>
              {indicators.map((indicator) => (
                <Dropdown.Item key={indicator.name}>
                  <div className="flex items-center justify-between w-full">
                    <span>{indicator.name}</span>
                    <ToggleSwitch checked={indicator.active} onChange={() => toggleIndicator(indicator.name)} />
                  </div>
                </Dropdown.Item>
              ))}
            </Dropdown>

            <div className="flex items-center space-x-2">
              <ToggleSwitch checked={showVolume} onChange={(checked) => setShowVolume(checked)} label="Show Volume" />
            </div>

            <div className="flex items-center space-x-2">
              <ToggleSwitch checked={autoRefresh} onChange={(checked) => setAutoRefresh(checked)} label="Auto-Refresh" />
            </div>
          </div>

          <div ref={mainChartContainerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg"></div>
          {showVolume && <div ref={volumeChartContainerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg"></div>}
          {indicators.some((ind) => ind.active && (ind.name === "RSI" || ind.name === "MACD")) && (
            <div ref={indicatorChartContainerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg"></div>
          )}
        </Card>

        <div className="flex items-center mt-4 text-sm text-center text-gray-600 dark:text-gray-400 sm:text-left">
          <HiInformationCircle className="w-4 h-4 mr-1" />
          <span>Chart data is for educational purposes only. Not financial advice.</span>
        </div>
      </motion.div>
    </div>
  );
};

export default GraphsPage;
