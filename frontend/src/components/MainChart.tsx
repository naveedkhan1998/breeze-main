/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useCallback } from "react";
import { createChart, IChartApi, SeriesType, ISeriesApi, ITimeScaleApi, Time } from "lightweight-charts";
import { Indicator, Instrument } from "../common-types";

interface MainChartProps {
  seriesData: any[];
  chartType: SeriesType;
  indicators: Indicator[];
  mode: boolean;
  obj: Instrument;
  timeframe: number;
  setTimeScale: (timeScale: ITimeScaleApi<Time> ) => void;
}

const MainChart: React.FC<MainChartProps> = ({ seriesData, chartType, indicators, mode, obj, timeframe, setTimeScale }) => {
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
        setTimeScale(chart.timeScale());
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
      }

      // Update indicators
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
  }, [seriesData, mode, obj?.company_name, obj?.exchange_code, timeframe, chartType, indicators, setTimeScale]);

  useEffect(() => {
    renderMainChart();
  }, [renderMainChart]);

  return <div ref={mainChartContainerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg"></div>;
};

export default MainChart;
