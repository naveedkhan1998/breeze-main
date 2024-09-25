/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useCallback } from "react";
import { createChart, IChartApi, ISeriesApi, ITimeScaleApi, Time } from "lightweight-charts";
import { Indicator } from "../common-types";

interface IndicatorChartProps {
  indicators: Indicator[];
  mode: boolean;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ indicators, mode, setTimeScale }) => {
  const indicatorChartContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorChartRef = useRef<IChartApi | null>(null);
  const indicatorChartSeriesRef = useRef<{ [key: string]: ISeriesApi<any> }>({});

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
        setTimeScale(chart.timeScale());
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
  }, [indicators, mode, setTimeScale]);

  useEffect(() => {
    renderIndicatorChart();
  }, [renderIndicatorChart]);

  return (
    <>
      {indicators.some((ind) => ind.active && (ind.name === "RSI" || ind.name === "MACD")) && (
        <div ref={indicatorChartContainerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg"></div>
      )}
    </>
  );
};

export default IndicatorChart;
