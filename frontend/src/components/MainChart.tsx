import React, { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  IChartApi,
  SeriesType,
  ISeriesApi,
  ITimeScaleApi,
  Time,
  BarData,
  LineData,
  MouseEventParams,
} from "lightweight-charts";
import { Instrument } from "../common-types";
import { Card } from "@/components/ui/card";

interface MainChartProps {
  seriesData: BarData[] | LineData[];
  chartType: "Candlestick" | "Line";
  mode: boolean;
  obj: Instrument;
  timeframe: number;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const MainChart: React.FC<MainChartProps> = ({
  seriesData,
  chartType,
  mode,
  obj,
  timeframe,
  setTimeScale,
}) => {
  const mainChartContainerRef = useRef<HTMLDivElement | null>(null);
  const mainChartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick" | "Line"> | null>(null);
  const prevChartTypeRef = useRef<SeriesType>(chartType);

  const renderMainChart = useCallback(() => {
    if (mainChartContainerRef.current && seriesData.length) {
      if (!mainChartRef.current) {
        mainChartContainerRef.current.innerHTML = "";

        const chart = createChart(mainChartContainerRef.current, {
          layout: {
            textColor: mode ? "#E2E8F0" : "#475569",
            background: { color: "transparent" },
            fontSize: 12,
            fontFamily: "Inter, -apple-system, sans-serif",
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: mode ? "#334155" : "#CBD5E1",
          },
          rightPriceScale: {
            borderColor: mode ? "#334155" : "#CBD5E1",
            scaleMargins: {
              top: 0.05,
              bottom: 0.05,
            },
          },
          crosshair: {
            mode: 1,
            vertLine: {
              width: 1,
              color: mode ? "#64748B" : "#94A3B8",
              style: 2,
            },
            horzLine: {
              visible: true,
              labelVisible: true,
              color: mode ? "#64748B" : "#94A3B8",
              width: 1,
              style: 2,
            },
          },
          grid: {
            vertLines: {
              color: mode ? "#1E293B" : "#F1F5F9",
              style: 1,
            },
            horzLines: {
              color: mode ? "#1E293B" : "#F1F5F9",
              style: 1,
            },
          },
          handleScroll: true,
          handleScale: true,
        });

        const mainSeries =
          chartType === "Candlestick"
            ? chart.addCandlestickSeries({
                upColor: mode ? "#10B981" : "#059669",
                downColor: mode ? "#EF4444" : "#DC2626",
                borderVisible: false,
                wickUpColor: mode ? "#10B981" : "#059669",
                wickDownColor: mode ? "#EF4444" : "#DC2626",
              })
            : chart.addLineSeries({
                color: mode ? "#3B82F6" : "#2563EB",
                lineWidth: 2,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
                lastValueVisible: true,
              });

        mainSeries.setData(seriesData);
        seriesRef.current = mainSeries;
        prevChartTypeRef.current = chartType;

        const legendContainer = document.createElement("div");
        legendContainer.className =
          "absolute top-4 left-4 p-4 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl z-[10] min-w-[280px]";

        mainChartContainerRef.current.appendChild(legendContainer);

        const headerRow = document.createElement("div");
        headerRow.className = "flex items-center justify-between mb-3";

        const companyName = document.createElement("span");
        companyName.className = "text-lg font-bold text-slate-900 dark:text-slate-100";
        companyName.textContent = obj?.company_name || "";

        const badgeContainer = document.createElement("div");
        badgeContainer.className = "flex items-center gap-2";

        const exchangeBadge = document.createElement("span");
        exchangeBadge.className =
          "px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        exchangeBadge.textContent = obj?.exchange_code || "";

        const timeframeBadge = document.createElement("span");
        timeframeBadge.className =
          "px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
        timeframeBadge.textContent = `${timeframe}m`;

        badgeContainer.appendChild(exchangeBadge);
        badgeContainer.appendChild(timeframeBadge);

        headerRow.appendChild(companyName);
        headerRow.appendChild(badgeContainer);

        const separator = document.createElement("div");
        separator.className = "h-px my-3 bg-slate-200 dark:bg-slate-700";

        const priceRow = document.createElement("div");
        priceRow.className = "grid grid-cols-2 gap-3 text-sm";

        legendContainer.appendChild(headerRow);
        legendContainer.appendChild(separator);
        legendContainer.appendChild(priceRow);

        chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
          if (param.time && seriesRef.current) {
            const data = param.seriesData.get(seriesRef.current);

            if (data) {
              priceRow.innerHTML = "";
              if (chartType === "Candlestick" && "open" in data) {
                const { open, high, low, close } = data as BarData;
                const priceItems = [
                  { label: "Open", value: open.toFixed(2) },
                  { label: "High", value: high.toFixed(2) },
                  { label: "Low", value: low.toFixed(2) },
                  { label: "Close", value: close.toFixed(2) },
                ];

                priceItems.forEach(({ label, value }) => {
                  const item = document.createElement("div");
                  item.className = "flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50";
                  
                  const labelSpan = document.createElement("span");
                  labelSpan.className = "text-slate-600 dark:text-slate-400 font-medium";
                  labelSpan.textContent = label;
                  
                  const valueSpan = document.createElement("span");
                  valueSpan.className = "font-semibold text-slate-900 dark:text-slate-100";
                  valueSpan.textContent = value;
                  
                  item.appendChild(labelSpan);
                  item.appendChild(valueSpan);
                  priceRow.appendChild(item);
                });
              } else if (chartType === "Line" && "value" in data) {
                const { value } = data as LineData;
                const item = document.createElement("div");
                item.className = "flex items-center justify-between col-span-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50";
                
                const labelSpan = document.createElement("span");
                labelSpan.className = "text-slate-600 dark:text-slate-400 font-medium";
                labelSpan.textContent = "Price";
                
                const valueSpan = document.createElement("span");
                valueSpan.className = "font-semibold text-slate-900 dark:text-slate-100";
                valueSpan.textContent = value.toFixed(2);
                
                item.appendChild(labelSpan);
                item.appendChild(valueSpan);
                priceRow.appendChild(item);
              }
            }
          }
        });

        mainChartRef.current = chart;
        setTimeScale(chart.timeScale());

        const resizeObserver = new ResizeObserver((entries) => {
          if (mainChartContainerRef.current && mainChartRef.current) {
            const { width, height } = entries[0].contentRect;
            mainChartRef.current.applyOptions({ width, height });
          }
        });

        resizeObserver.observe(mainChartContainerRef.current);

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
                  upColor: mode ? "#10B981" : "#059669",
                  downColor: mode ? "#EF4444" : "#DC2626",
                  borderVisible: false,
                  wickUpColor: mode ? "#10B981" : "#059669",
                  wickDownColor: mode ? "#EF4444" : "#DC2626",
                })
              : mainChartRef.current.addLineSeries({
                  color: mode ? "#3B82F6" : "#2563EB",
                  lineWidth: 2,
                  crosshairMarkerVisible: true,
                  crosshairMarkerRadius: 4,
                  lastValueVisible: true,
                });

          mainSeries.setData(seriesData);
          seriesRef.current = mainSeries;
          prevChartTypeRef.current = chartType;
        } else {
          seriesRef.current?.setData(seriesData);
        }

        mainChartRef.current.applyOptions({
          layout: {
            textColor: mode ? "#E2E8F0" : "#475569",
            background: { color: "transparent" },
          },
          timeScale: {
            borderColor: mode ? "#334155" : "#CBD5E1",
          },
          rightPriceScale: {
            borderColor: mode ? "#334155" : "#CBD5E1",
          },
          crosshair: {
            vertLine: {
              color: mode ? "#64748B" : "#94A3B8",
            },
            horzLine: {
              color: mode ? "#64748B" : "#94A3B8",
            },
          },
          grid: {
            vertLines: {
              color: mode ? "#1E293B" : "#F1F5F9",
            },
            horzLines: {
              color: mode ? "#1E293B" : "#F1F5F9",
            },
          },
        });
      }
    }
  }, [
    seriesData,
    mode,
    obj?.company_name,
    obj?.exchange_code,
    timeframe,
    chartType,
    setTimeScale,
  ]);

  useEffect(() => {
    renderMainChart();
  }, [renderMainChart]);

  return (
    <Card className="w-full h-full">
      <div ref={mainChartContainerRef} className="relative w-full h-full ">
        {/* Chart will be rendered here */}
      </div>
    </Card>
  );
};

export default MainChart;
