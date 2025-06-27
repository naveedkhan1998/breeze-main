/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ITimeScaleApi,
  Time,
  LineData,
} from 'lightweight-charts';

interface RSIIndicator {
  name: 'RSI';
  active: boolean;
  data: LineData[];
}

interface MACDDataItem {
  time: Time;
  macd: number;
  signal: number;
  histogram: number;
}

interface MACDIndicator {
  name: 'MACD';
  active: boolean;
  data: MACDDataItem[];
}

type Indicator = RSIIndicator | MACDIndicator;

interface IndicatorChartProps {
  indicators: Indicator[];
  mode: boolean;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({
  indicators,
  mode,
  setTimeScale,
}) => {
  const indicatorChartContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorChartRef = useRef<IChartApi | null>(null);
  const indicatorChartSeriesRef = useRef<{ [key: string]: ISeriesApi<any> }>(
    {}
  );
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Create or destroy chart based on active indicators
  useEffect(() => {
    const activeIndicators = indicators.filter(
      ind => ind.active && (ind.name === 'RSI' || ind.name === 'MACD')
    );

    if (!indicatorChartContainerRef.current) return;

    if (activeIndicators.length === 0) {
      // No active indicators, remove chart if it exists
      if (indicatorChartRef.current) {
        indicatorChartRef.current.remove();
        indicatorChartRef.current = null;
        indicatorChartSeriesRef.current = {};
        if (resizeObserverRef.current && indicatorChartContainerRef.current) {
          resizeObserverRef.current.unobserve(
            indicatorChartContainerRef.current
          );
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }
      }
      return;
    }

    if (!indicatorChartRef.current) {
      // Create chart
      const chart = createChart(indicatorChartContainerRef.current, {
        layout: {
          textColor: mode ? '#E5E7EB' : '#1F2937',
          background: { color: mode ? '#111827' : '#FFFFFF' },
          fontSize: 12,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: mode ? '#4B5563' : '#D1D5DB',
        },
        crosshair: {
          mode: 1,
          vertLine: {
            width: 1,
            color: mode ? '#6B7280' : '#9CA3AF',
            style: 1,
          },
          horzLine: {
            visible: true,
            labelVisible: true,
          },
        },
        grid: {
          vertLines: {
            color: mode ? '#374151' : '#E5E7EB',
          },
          horzLines: {
            color: mode ? '#374151' : '#E5E7EB',
          },
        },
      });

      indicatorChartRef.current = chart;
      setTimeScale(chart.timeScale());

      // Handle Resize
      const resizeObserver = new ResizeObserver(entries => {
        if (indicatorChartContainerRef.current && indicatorChartRef.current) {
          const { width, height } = entries[0].contentRect;
          indicatorChartRef.current.applyOptions({ width, height });
        }
      });

      resizeObserver.observe(indicatorChartContainerRef.current);
      resizeObserverRef.current = resizeObserver;
    }

    // Cleanup function to remove chart on unmount
    return () => {
      if (indicatorChartRef.current) {
        indicatorChartRef.current.remove();
        indicatorChartRef.current = null;
        indicatorChartSeriesRef.current = {};
      }
      if (resizeObserverRef.current && indicatorChartContainerRef.current) {
        resizeObserverRef.current.unobserve(indicatorChartContainerRef.current);
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [indicators, mode, setTimeScale]);

  // Update chart options when mode changes
  useEffect(() => {
    if (indicatorChartRef.current) {
      indicatorChartRef.current.applyOptions({
        layout: {
          textColor: mode ? '#E5E7EB' : '#1F2937',
          background: { color: mode ? '#111827' : '#FFFFFF' },
        },
        rightPriceScale: {
          borderColor: mode ? '#4B5563' : '#D1D5DB',
        },
        crosshair: {
          vertLine: {
            color: mode ? '#6B7280' : '#9CA3AF',
          },
        },
        grid: {
          vertLines: {
            color: mode ? '#374151' : '#E5E7EB',
          },
          horzLines: {
            color: mode ? '#374151' : '#E5E7EB',
          },
        },
      });
    }
  }, [mode]);

  // Update indicator series data
  useEffect(() => {
    if (!indicatorChartRef.current) return;

    const activeIndicators = indicators.filter(
      ind => ind.active && (ind.name === 'RSI' || ind.name === 'MACD')
    );

    // Update or add series
    activeIndicators.forEach(indicator => {
      if (indicator.name === 'RSI') {
        if (!indicatorChartSeriesRef.current[indicator.name]) {
          const rsiSeries = indicatorChartRef.current!.addLineSeries({
            color: mode ? '#FBBF24' : '#F59E0B',
            lineWidth: 2,
          });
          rsiSeries.setData(indicator.data);
          indicatorChartSeriesRef.current[indicator.name] = rsiSeries;
        } else {
          indicatorChartSeriesRef.current[indicator.name].applyOptions({
            color: mode ? '#FBBF24' : '#F59E0B',
          });
          indicatorChartSeriesRef.current[indicator.name].setData(
            indicator.data
          );
        }
      } else if (indicator.name === 'MACD') {
        if (!indicatorChartSeriesRef.current[`${indicator.name}_macd`]) {
          const macdSeries = indicatorChartRef.current!.addLineSeries({
            color: mode ? '#60A5FA' : '#3B82F6',
            lineWidth: 2,
          });
          const signalSeries = indicatorChartRef.current!.addLineSeries({
            color: mode ? '#F87171' : '#EF4444',
            lineWidth: 2,
          });
          const histogramSeries = indicatorChartRef.current!.addHistogramSeries(
            {
              color: mode ? '#34D399' : '#10B981',
            }
          );
          macdSeries.setData(
            indicator.data.map(d => ({ time: d.time, value: d.macd }))
          );
          signalSeries.setData(
            indicator.data.map(d => ({ time: d.time, value: d.signal }))
          );
          histogramSeries.setData(
            indicator.data.map(d => ({ time: d.time, value: d.histogram }))
          );
          indicatorChartSeriesRef.current[`${indicator.name}_macd`] =
            macdSeries;
          indicatorChartSeriesRef.current[`${indicator.name}_signal`] =
            signalSeries;
          indicatorChartSeriesRef.current[`${indicator.name}_histogram`] =
            histogramSeries;
        } else {
          indicatorChartSeriesRef.current[
            `${indicator.name}_macd`
          ].applyOptions({
            color: mode ? '#60A5FA' : '#3B82F6',
          });
          indicatorChartSeriesRef.current[
            `${indicator.name}_signal`
          ].applyOptions({
            color: mode ? '#F87171' : '#EF4444',
          });
          indicatorChartSeriesRef.current[
            `${indicator.name}_histogram`
          ].applyOptions({
            color: mode ? '#34D399' : '#10B981',
          });
          indicatorChartSeriesRef.current[`${indicator.name}_macd`].setData(
            indicator.data.map(d => ({ time: d.time, value: d.macd }))
          );
          indicatorChartSeriesRef.current[`${indicator.name}_signal`].setData(
            indicator.data.map(d => ({ time: d.time, value: d.signal }))
          );
          indicatorChartSeriesRef.current[
            `${indicator.name}_histogram`
          ].setData(
            indicator.data.map(d => ({ time: d.time, value: d.histogram }))
          );
        }
      }
    });

    // Remove inactive indicators
    const indicatorNames = ['RSI', 'MACD'];
    const inactiveIndicators = indicatorNames.filter(
      name => !activeIndicators.some(ind => ind.name === name)
    );

    inactiveIndicators.forEach(indicatorName => {
      if (indicatorChartSeriesRef.current[indicatorName]) {
        indicatorChartRef.current!.removeSeries(
          indicatorChartSeriesRef.current[indicatorName]
        );
        delete indicatorChartSeriesRef.current[indicatorName];
      }
      if (indicatorName === 'MACD') {
        ['macd', 'signal', 'histogram'].forEach(suffix => {
          const key = `${indicatorName}_${suffix}`;
          if (indicatorChartSeriesRef.current[key]) {
            indicatorChartRef.current!.removeSeries(
              indicatorChartSeriesRef.current[key]
            );
            delete indicatorChartSeriesRef.current[key];
          }
        });
      }
    });
  }, [indicators, mode]);

  return (
    <>
      {indicators.some(
        ind => ind.active && (ind.name === 'RSI' || ind.name === 'MACD')
      ) && (
        <div
          ref={indicatorChartContainerRef}
          className="relative w-full h-full overflow-hidden rounded-lg shadow-lg"
        ></div>
      )}
    </>
  );
};

export default IndicatorChart;
