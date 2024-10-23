import React, { useEffect, useRef, useCallback } from "react";
import { createChart, IChartApi, SeriesType, ISeriesApi, ITimeScaleApi, Time, BarData, LineData, MouseEventParams } from "lightweight-charts";
import { Instrument } from "../common-types";

interface MAIndicator {
  name: "MA";
  active: boolean;
  data: LineData[];
}

interface BollingerBandsDataItem {
  time: Time;
  upper: number;
  lower: number;
}

interface BollingerBandsIndicator {
  name: "Bollinger Bands";
  active: boolean;
  data: BollingerBandsDataItem[];
}

type Indicator = MAIndicator | BollingerBandsIndicator;

interface MainChartProps {
  seriesData: BarData[] | LineData[];
  chartType: "Candlestick" | "Line";
  indicators: Indicator[];
  mode: boolean;
  obj: Instrument;
  timeframe: number;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const MainChart: React.FC<MainChartProps> = ({ seriesData, chartType, indicators, mode, obj, timeframe, setTimeScale }) => {
  const mainChartContainerRef = useRef<HTMLDivElement | null>(null);
  const mainChartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick" | "Line"> | null>(null);
  const indicatorSeriesRef = useRef<{ [key: string]: ISeriesApi<"Line"> }>({});
  const prevChartTypeRef = useRef<SeriesType>(chartType);

  const renderMainChart = useCallback(() => {
    if (mainChartContainerRef.current && seriesData.length) {
      if (!mainChartRef.current) {
        mainChartContainerRef.current.innerHTML = "";

        const chart = createChart(mainChartContainerRef.current, {
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
        legendContainer.className = `absolute top-4 left-4 p-2 rounded bg-white text-slate-800 dark:bg-slate-800 dark:text-white shadow-md text-sm z-[10]`;

        mainChartContainerRef.current.appendChild(legendContainer);

        const legendRow = document.createElement("div");
        legendRow.className = "mb-1 font-semibold";
        legendRow.innerHTML = `${obj?.company_name} | ${obj?.exchange_code} | Timeframe: ${timeframe}`;

        const ohlcRow = document.createElement("div");
        ohlcRow.innerHTML = "<strong>OHLC:</strong> ";

        legendContainer.appendChild(legendRow);
        legendContainer.appendChild(ohlcRow);

        chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
          let ohlcValues = "";
          if (param.time && seriesRef.current) {
            const data = param.seriesData.get(seriesRef.current);

            if (data) {
              if (chartType === "Candlestick" && "open" in data) {
                const { open, high, low, close } = data as BarData;
                ohlcValues = `<strong>O:</strong> ${open.toFixed(2)} | <strong>H:</strong> ${high.toFixed(2)} | <strong>L:</strong> ${low.toFixed(2)} | <strong>C:</strong> ${close.toFixed(2)}`;
              } else if (chartType === "Line" && "value" in data) {
                const { value } = data as LineData;
                ohlcValues = `<strong>Price:</strong> ${value.toFixed(2)}`;
              }
            }
          }
          legendRow.innerHTML = `${obj?.company_name} | ${obj?.exchange_code} | Timeframe: ${timeframe}`;
          ohlcRow.innerHTML = `<strong>OHLC:</strong> ${ohlcValues}`;
        });

        mainChartRef.current = chart;
        setTimeScale(chart.timeScale());

        // Handle Resize
        const resizeObserver = new ResizeObserver((entries) => {
          if (mainChartContainerRef.current && mainChartRef.current) {
            const { width, height } = entries[0].contentRect;
            mainChartRef.current.applyOptions({ width, height });
          }
        });

        resizeObserver.observe(mainChartContainerRef.current);

        // Clean up on unmount
        return () => {
          resizeObserver.disconnect();
          chart.remove();
          mainChartRef.current = null;
        };
      } else {
        if (prevChartTypeRef.current !== chartType) {
          if (seriesRef.current && mainChartRef.current) {
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
          seriesRef.current?.setData(seriesData);
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
                const maIndicator = indicator as MAIndicator;
                const maSeries = mainChartRef.current!.addLineSeries({
                  color: mode ? "#FBBF24" : "#F59E0B",
                  lineWidth: 2,
                });
                maSeries.setData(maIndicator.data);
                indicatorSeriesRef.current[indicator.name] = maSeries;
                break;
              }
              case "Bollinger Bands": {
                const bbIndicator = indicator as BollingerBandsIndicator;
                const upperBandSeries = mainChartRef.current!.addLineSeries({
                  color: mode ? "#34D399" : "#10B981",
                  lineWidth: 1,
                });
                const lowerBandSeries = mainChartRef.current!.addLineSeries({
                  color: mode ? "#F87171" : "#EF4444",
                  lineWidth: 1,
                });
                upperBandSeries.setData(bbIndicator.data.map((d) => ({ time: d.time, value: d.upper })));
                lowerBandSeries.setData(bbIndicator.data.map((d) => ({ time: d.time, value: d.lower })));
                indicatorSeriesRef.current[`${indicator.name}_upper`] = upperBandSeries;
                indicatorSeriesRef.current[`${indicator.name}_lower`] = lowerBandSeries;
                break;
              }
              default:
                break;
            }
          } else {
            switch (indicator.name) {
              case "MA": {
                const maIndicator = indicator as MAIndicator;
                indicatorSeriesRef.current[indicator.name].applyOptions({
                  color: mode ? "#FBBF24" : "#F59E0B",
                });
                indicatorSeriesRef.current[indicator.name].setData(maIndicator.data);
                break;
              }
              case "Bollinger Bands": {
                const bbIndicator = indicator as BollingerBandsIndicator;
                indicatorSeriesRef.current[`${indicator.name}_upper`].applyOptions({
                  color: mode ? "#34D399" : "#10B981",
                });
                indicatorSeriesRef.current[`${indicator.name}_lower`].applyOptions({
                  color: mode ? "#F87171" : "#EF4444",
                });
                indicatorSeriesRef.current[`${indicator.name}_upper`].setData(bbIndicator.data.map((d) => ({ time: d.time, value: d.upper })));
                indicatorSeriesRef.current[`${indicator.name}_lower`].setData(bbIndicator.data.map((d) => ({ time: d.time, value: d.lower })));
                break;
              }
              default:
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

  return <div ref={mainChartContainerRef} className="relative w-full h-full overflow-hidden rounded-lg shadow-lg"></div>;
};

export default MainChart;
