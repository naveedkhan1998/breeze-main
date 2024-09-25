/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useCallback } from "react";
import { createChart, IChartApi, ISeriesApi, Time, HistogramData, ITimeScaleApi } from "lightweight-charts";

interface VolumeChartProps {
  volumeData: any[];
  mode: boolean;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const VolumeChart: React.FC<VolumeChartProps> = ({ volumeData, mode, setTimeScale }) => {
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
      setTimeScale(chart.timeScale());
    } else {
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.setData(volumeData as HistogramData<Time>[]);
      }
    }
  }, [volumeData, mode, setTimeScale]);

  useEffect(() => {
    renderVolumeChart();
  }, [renderVolumeChart]);

  return <div ref={volumeChartContainerRef} className="relative w-full overflow-hidden rounded-lg shadow-lg"></div>;
};

export default VolumeChart;
