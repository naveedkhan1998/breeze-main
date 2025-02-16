import React, { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  HistogramData,
  ITimeScaleApi,
} from "lightweight-charts";

interface VolumeChartProps {
  volumeData: HistogramData<Time>[];
  mode: boolean;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const VolumeChart: React.FC<VolumeChartProps> = ({
  volumeData,
  mode,
  setTimeScale,
}) => {
  const volumeChartContainerRef = useRef<HTMLDivElement | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Create chart on mount
  useEffect(() => {
    if (!volumeChartContainerRef.current) return;

    const chart = createChart(volumeChartContainerRef.current, {
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
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "right",
      color: mode ? "#60A5FA" : "#3B82F6",
    });

    volumeSeries.setData(volumeData);
    volumeSeriesRef.current = volumeSeries;
    volumeChartRef.current = chart;
    setTimeScale(chart.timeScale());

    // Handle Resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (volumeChartContainerRef.current && volumeChartRef.current) {
        const { width, height } = entries[0].contentRect;
        volumeChartRef.current.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(volumeChartContainerRef.current);

    // Clean up on unmount
    return () => {
      resizeObserver.disconnect();
      chart.remove();
      volumeChartRef.current = null;
    };
  }, [mode, setTimeScale, volumeData]);

  // Update chart options when mode changes
  useEffect(() => {
    if (volumeChartRef.current) {
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
    }

    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({
        color: mode ? "#60A5FA" : "#3B82F6",
      });
    }
  }, [mode]);

  // Update data when volumeData changes
  useEffect(() => {
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(volumeData);
    }
  }, [volumeData]);

  return (
    <div
      ref={volumeChartContainerRef}
      className="relative w-full h-full overflow-hidden rounded-lg shadow-lg"
    ></div>
  );
};

export default VolumeChart;
