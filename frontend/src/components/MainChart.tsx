/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useCallback } from "react";
import { createChart, IChartApi, SeriesType, ISeriesApi, ITimeScaleApi, Time } from "lightweight-charts";
import { Indicator, Instrument } from "../common-types";

interface MainChartProps {
  seriesData: any[];
  chartType: SeriesType;
  indicators: Indicator[];
  width: number;
  height: number;
  mode: boolean;
  obj: Instrument;
  timeframe: number;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const MainChart: React.FC<MainChartProps> = ({ seriesData, chartType, indicators, width, height, mode, obj, timeframe, setTimeScale }) => {
  const mainChartContainerRef = useRef<HTMLDivElement | null>(null);
  const mainChartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const indicatorSeriesRef = useRef<{ [key: string]: ISeriesApi<any> }>({});
  const prevChartTypeRef = useRef<SeriesType>(chartType);

  const renderMainChart = useCallback(() => {
    if (mainChartContainerRef.current && seriesData.length) {
      if (!mainChartRef.current) {
        mainChartContainerRef.current.innerHTML = "";
        const height = window.innerHeight * 0.5;
        const chart = createChart(mainChartContainerRef.current, {
          width: mainChartContainerRef.current.clientWidth,
          height,
          layout: {
            textColor: mode ? "#E5E7EB" : "#1F2937",
            background: { color: mode ? "#111827" : "#FFFFFF" },
            fontSize: 12,
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
          rightPriceScale: {
            borderColor: mode ? "#4B5563" : "#D1D5DB",
          },
          crosshair: {
            mode: 1,
            vertLine: {
              width: 1,
              color: mode ? "#6B7280" : "#9CA3AF",
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
                upColor: mode ? "#34D399" : "#10B981",
                downColor: mode ? "#F87171" : "#EF4444",
                borderVisible: false,
                wickUpColor: mode ? "#34D399" : "#10B981",
                wickDownColor: mode ? "#F87171" : "#EF4444",
              })
            : chart.addLineSeries({
                color: mode ? "#60A5FA" : "#3B82F6",
                lineWidth: 2,
              });

        mainSeries.setData(seriesData);
        seriesRef.current = mainSeries;
        prevChartTypeRef.current = chartType;

        const legendContainer = document.createElement("div");
        legendContainer.className = `absolute top-4 left-4 ${mode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-2 rounded shadow-md text-sm z-[10]`;

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
        setTimeScale(chart.timeScale());
      } else {
        if (prevChartTypeRef.current !== chartType) {
          if (seriesRef.current) {
            mainChartRef.current.removeSeries(seriesRef.current);
          }

          const mainSeries =
            chartType === "Candlestick"
              ? mainChartRef.current.addCandlestickSeries({
                  upColor: mode ? "#34D399" : "#10B981",
                  downColor: mode ? "#F87171" : "#EF4444",
                  borderVisible: false,
                  wickUpColor: mode ? "#34D399" : "#10B981",
                  wickDownColor: mode ? "#F87171" : "#EF4444",
                })
              : mainChartRef.current.addLineSeries({
                  color: mode ? "#60A5FA" : "#3B82F6",
                  lineWidth: 2,
                });

          mainSeries.setData(seriesData);
          seriesRef.current = mainSeries;
          prevChartTypeRef.current = chartType;
        } else {
          seriesRef.current!.setData(seriesData);
        }

        // Update chart colors based on mode
        mainChartRef.current.applyOptions({
          layout: {
            textColor: mode ? "#E5E7EB" : "#1F2937",
            background: { color: mode ? "#111827" : "#FFFFFF" },
          },
          rightPriceScale: {
            borderColor: mode ? "#4B5563" : "#D1D5DB",
          },
          crosshair: {
            vertLine: {
              color: mode ? "#6B7280" : "#9CA3AF",
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
      }

      // Update indicators
      indicators.forEach((indicator) => {
        if (indicator.active) {
          if (!indicatorSeriesRef.current[indicator.name]) {
            switch (indicator.name) {
              case "MA": {
                const maSeries = mainChartRef.current!.addLineSeries({
                  color: mode ? "#FBBF24" : "#F59E0B",
                  lineWidth: 2,
                });
                maSeries.setData(indicator.data);
                indicatorSeriesRef.current[indicator.name] = maSeries;
                break;
              }
              case "Bollinger Bands": {
                const upperBandSeries = mainChartRef.current!.addLineSeries({
                  color: mode ? "#34D399" : "#10B981",
                  lineWidth: 1,
                });
                const lowerBandSeries = mainChartRef.current!.addLineSeries({
                  color: mode ? "#F87171" : "#EF4444",
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
                indicatorSeriesRef.current[indicator.name].applyOptions({ color: mode ? "#FBBF24" : "#F59E0B" });
                indicatorSeriesRef.current[indicator.name].setData(indicator.data);
                break;
              case "Bollinger Bands":
                indicatorSeriesRef.current[`${indicator.name}_upper`].applyOptions({ color: mode ? "#34D399" : "#10B981" });
                indicatorSeriesRef.current[`${indicator.name}_lower`].applyOptions({ color: mode ? "#F87171" : "#EF4444" });
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
  }, [seriesData, mode, obj?.company_name, obj?.exchange_code, timeframe, chartType, indicators, setTimeScale]);

  // Update chart size when width or height changes
  useEffect(() => {
    if (mainChartRef.current) {
      mainChartRef.current.applyOptions({ width, height });
      mainChartRef.current.timeScale().fitContent();
    }
  }, [width, height]);

  useEffect(() => {
    renderMainChart();
  }, [renderMainChart]);

  return <div ref={mainChartContainerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg"></div>;
};

export default MainChart;
