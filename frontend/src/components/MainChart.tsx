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
            textColor: mode ? "#E5E7EB" : "#1F2937",
            background: { color: mode ? "#111827" : "#FFFFFF" },
            fontSize: 12,
            fontFamily: "Inter, -apple-system, system-ui, sans-serif",
          },
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
            borderColor: mode ? "#374151" : "#E5E7EB",
          },
          rightPriceScale: {
            borderColor: mode ? "#4B5563" : "#D1D5DB",
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
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
              color: mode ? "#6B7280" : "#9CA3AF",
              width: 1,
              style: 1,
            },
          },
          grid: {
            vertLines: {
              color: mode ? "#374151" : "#E5E7EB",
              style: 1,
            },
            horzLines: {
              color: mode ? "#374151" : "#E5E7EB",
              style: 1,
            },
          },
          handleScroll: true,
          handleScale: true,
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
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
                lastValueVisible: true,
              });

        mainSeries.setData(seriesData);
        seriesRef.current = mainSeries;
        prevChartTypeRef.current = chartType;

        const legendContainer = document.createElement("div");
        legendContainer.className =
          "absolute top-4 left-4 p-3 rounded-lg bg-card text-card-foreground shadow-lg border z-[10] min-w-[240px]";

        mainChartContainerRef.current.appendChild(legendContainer);

        const headerRow = document.createElement("div");
        headerRow.className = "flex items-center gap-2 mb-2";

        const companyName = document.createElement("span");
        companyName.className = "text-sm font-semibold";
        companyName.textContent = obj?.company_name || "";

        const exchangeBadge = document.createElement("span");
        exchangeBadge.className =
          "px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary";
        exchangeBadge.textContent = obj?.exchange_code || "";

        const timeframeBadge = document.createElement("span");
        timeframeBadge.className =
          "px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary ml-auto";
        timeframeBadge.textContent = `${timeframe}`;

        headerRow.appendChild(companyName);
        headerRow.appendChild(exchangeBadge);
        headerRow.appendChild(timeframeBadge);

        const separator = document.createElement("div");
        separator.className = "h-px my-2 bg-border";

        const priceRow = document.createElement("div");
        priceRow.className = "grid grid-cols-2 gap-2 text-xs";

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
                  item.className = "flex items-center justify-between";
                  item.innerHTML = `
                    <span class="text-muted-foreground">${label}</span>
                    <span class="font-medium">${value}</span>
                  `;
                  priceRow.appendChild(item);
                });
              } else if (chartType === "Line" && "value" in data) {
                const { value } = data as LineData;
                const item = document.createElement("div");
                item.className = "flex items-center justify-between col-span-2";
                item.innerHTML = `
                  <span class="text-muted-foreground">Price</span>
                  <span class="font-medium">${value.toFixed(2)}</span>
                `;
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
                  upColor: mode ? "#34D399" : "#10B981",
                  downColor: mode ? "#F87171" : "#EF4444",
                  borderVisible: false,
                  wickUpColor: mode ? "#34D399" : "#10B981",
                  wickDownColor: mode ? "#F87171" : "#EF4444",
                })
              : mainChartRef.current.addLineSeries({
                  color: mode ? "#60A5FA" : "#3B82F6",
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
            horzLine: {
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
