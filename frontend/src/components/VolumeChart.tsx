/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useCallback } from "react";
import { createChart, IChartApi, ISeriesApi, Time, HistogramData, ITimeScaleApi } from "lightweight-charts";

interface VolumeChartProps {
  volumeData: any[];
  mode: boolean;
  width: number;
  height: number;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ volumeData, mode,width,height, setTimeScale }) => {
  const volumeChartContainerRef = useRef<HTMLDivElement | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const renderVolumeChart = useCallback(() => {
    if (!volumeChartContainerRef.current || !volumeData.length) return;

    if (!volumeChartRef.current) {
      volumeChartContainerRef.current.innerHTML = "";

      const chartHeight = window.innerHeight * 0.2;
      const chartOptions = {
        width: volumeChartContainerRef.current.clientWidth,
        height: chartHeight,
        layout: {
          textColor: mode ? "#E5E7EB" : "#1F2937",
          background: { color: mode ? "#111827" : "#FFFFFF" },
          fontSize: 12,
        },
        timeScale: {
          visible: true,
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: mode ? "#4B5563" : "#D1D5DB",
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            color: mode ? "#374151" : "#E5E7EB",
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
          },
        },
      };
      //@ts-expect-error check later
      const chart = createChart(volumeChartContainerRef.current, chartOptions);

      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "right",
        color: mode ? "#60A5FA" : "#3B82F6",
      });

      volumeSeries.setData(volumeData as HistogramData<Time>[]);
      volumeSeriesRef.current = volumeSeries;
      volumeChartRef.current = chart;
      setTimeScale(chart.timeScale());
    } else {
      // Update chart colors based on mode
      volumeChartRef.current.applyOptions({
        layout: {
          textColor: mode ? "#E5E7EB" : "#1F2937",
          background: { color: mode ? "#111827" : "#FFFFFF" },
        },
        rightPriceScale: {
          borderColor: mode ? "#4B5563" : "#D1D5DB",
        },
        grid: {
          horzLines: {
            color: mode ? "#374151" : "#E5E7EB",
          },
        },
        crosshair: {
          vertLine: {
            color: mode ? "#6B7280" : "#9CA3AF",
          },
        },
      });

      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.applyOptions({
          color: mode ? "#60A5FA" : "#3B82F6",
        });
        volumeSeriesRef.current.setData(volumeData as HistogramData<Time>[]);
      }
    }
  }, [volumeData, mode, setTimeScale]);

  // Update chart size when width or height changes
  useEffect(() => {
    volumeChartRef.current?.applyOptions({ width, height });
    volumeChartRef.current?.timeScale().fitContent();
  }, [width, height]);

  useEffect(() => {
    renderVolumeChart();
  }, [renderVolumeChart]);

  return <div ref={volumeChartContainerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg"></div>;
};

export default VolumeChart;
