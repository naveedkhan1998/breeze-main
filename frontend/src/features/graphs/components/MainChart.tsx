import React, { useEffect, useRef, useCallback } from 'react';
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
} from 'lightweight-charts';

import type { Instrument } from '@/types/common-types';
import { useAppSelector } from 'src/app/hooks';
import { selectChartType, selectTimeframe } from '../graphSlice';

interface MainChartProps {
  seriesData: BarData[] | LineData[];
  mode: boolean;
  obj: Instrument;
  setTimeScale: (timeScale: ITimeScaleApi<Time>) => void;
}

const MainChart: React.FC<MainChartProps> = ({
  seriesData,
  mode,
  obj,
  setTimeScale,
}) => {
  const chartType = useAppSelector(selectChartType);
  const timeframe = useAppSelector(selectTimeframe);
  const mainChartContainerRef = useRef<HTMLDivElement | null>(null);
  const mainChartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const prevChartTypeRef = useRef<SeriesType>(chartType);
  const timeframeBadgeRef = useRef<HTMLSpanElement | null>(null);

  const renderMainChart = useCallback(() => {
    if (!mainChartContainerRef.current) return;

    if (!mainChartRef.current) {
      if (!seriesData.length) return;
      mainChartContainerRef.current.innerHTML = '';

      const chart = createChart(mainChartContainerRef.current, {
        layout: {
          textColor: mode ? '#E2E8F0' : '#475569',
          background: { color: 'transparent' },
          fontSize: 12,
          fontFamily: 'Inter, -apple-system, sans-serif',
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: mode ? '#334155' : '#CBD5E1',
        },
        rightPriceScale: {
          borderColor: mode ? '#334155' : '#CBD5E1',
          scaleMargins: {
            top: 0.05,
            bottom: 0.05,
          },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            width: 1,
            color: mode ? '#64748B' : '#94A3B8',
            style: 2,
          },
          horzLine: {
            visible: true,
            labelVisible: true,
            color: mode ? '#64748B' : '#94A3B8',
            width: 1,
            style: 2,
          },
        },
        grid: {
          vertLines: {
            color: mode ? '#1E293B' : '#F1F5F9',
            style: 1,
          },
          horzLines: {
            color: mode ? '#1E293B' : '#F1F5F9',
            style: 1,
          },
        },
        handleScroll: true,
        handleScale: true,
      });

      const mainSeries =
        chartType === 'Candlestick'
          ? chart.addCandlestickSeries({
              upColor: mode ? '#10B981' : '#059669',
              downColor: mode ? '#EF4444' : '#DC2626',
              borderVisible: false,
              wickUpColor: mode ? '#10B981' : '#059669',
              wickDownColor: mode ? '#EF4444' : '#DC2626',
            })
          : chart.addLineSeries({
              color: mode ? '#3B82F6' : '#2563EB',
              lineWidth: 2,
              crosshairMarkerVisible: true,
              crosshairMarkerRadius: 4,
              lastValueVisible: true,
            });

      mainSeries.setData(seriesData);
      seriesRef.current = mainSeries;
      prevChartTypeRef.current = chartType;

      const legendContainer = document.createElement('div');
      legendContainer.className =
        'absolute top-2 left-2 p-2 rounded-lg glass-card shadow-md z-[10] flex items-center flex-wrap gap-x-4 gap-y-1';

      mainChartContainerRef.current.appendChild(legendContainer);

      // Left section: Company name and exchange
      const infoSection = document.createElement('div');
      infoSection.className = 'flex items-center gap-2';

      const companyName = document.createElement('span');
      companyName.className =
        'text-sm font-bold text-slate-900 dark:text-slate-100';
      companyName.textContent = obj?.company_name || '';

      const exchangeBadge = document.createElement('span');
      exchangeBadge.className =
        'text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded';
      exchangeBadge.textContent = obj?.exchange_code || '';

      const timeframeBadge = document.createElement('span');
      timeframeBadge.className =
        'text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 rounded ml-1';
      timeframeBadge.textContent = `${timeframe}m`;
      timeframeBadgeRef.current = timeframeBadge;

      infoSection.appendChild(companyName);
      infoSection.appendChild(exchangeBadge);
      infoSection.appendChild(timeframeBadge);
      legendContainer.appendChild(infoSection);

      // Right section: OHLC values
      const priceSection = document.createElement('div');
      priceSection.className = 'flex items-center gap-3 text-xs';
      legendContainer.appendChild(priceSection);

      const updateLegend = (data: BarData | LineData | null) => {
        if (data) {
          priceSection.innerHTML = '';
          if (chartType === 'Candlestick' && 'open' in data) {
            const { open, high, low, close } = data as BarData;
            const priceItems = [
              { label: 'Open', value: open.toFixed(2) },
              { label: 'High', value: high.toFixed(2) },
              { label: 'Low', value: low.toFixed(2) },
              { label: 'Close', value: close.toFixed(2) },
            ];

            priceItems.forEach(({ label, value }) => {
              const item = document.createElement('div');
              item.className = 'flex items-center';

              const labelSpan = document.createElement('span');
              labelSpan.className =
                'mr-1 font-medium text-slate-500 dark:text-slate-400';
              labelSpan.textContent = label;

              const valueSpan = document.createElement('span');
              valueSpan.className =
                'font-semibold text-slate-900 dark:text-slate-100';
              valueSpan.textContent = value;

              item.appendChild(labelSpan);
              item.appendChild(valueSpan);
              priceSection.appendChild(item);
            });
          } else if (chartType === 'Line' && 'value' in data) {
            const { value } = data as LineData;
            const item = document.createElement('div');
            item.className = 'flex items-center';

            const labelSpan = document.createElement('span');
            labelSpan.className =
              'mr-1 font-medium text-slate-500 dark:text-slate-400';
            labelSpan.textContent = 'Price';

            const valueSpan = document.createElement('span');
            valueSpan.className =
              'font-semibold text-slate-900 dark:text-slate-100';
            valueSpan.textContent = value.toFixed(2);

            item.appendChild(labelSpan);
            item.appendChild(valueSpan);
            priceSection.appendChild(item);
          }
        }
      };

      // Set initial legend with the last data point
      if (seriesData.length > 0) {
        updateLegend(seriesData[seriesData.length - 1]);
      }

      chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
        if (param.time && seriesRef.current) {
          const data = param.seriesData.get(seriesRef.current);
          // Check if data conforms to BarData or LineData
          if (data && ('open' in data || 'value' in data)) {
            updateLegend(data as BarData | LineData);
          } else {
            updateLegend(null);
          }
        } else {
          // When crosshair is off the chart, show the last value
          if (seriesData.length > 0) {
            updateLegend(seriesData[seriesData.length - 1]);
          }
        }
      });

      mainChartRef.current = chart;
      setTimeScale(chart.timeScale());

      const resizeObserver = new ResizeObserver(entries => {
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
          chartType === 'Candlestick'
            ? mainChartRef.current.addCandlestickSeries({
                upColor: mode ? '#10B981' : '#059669',
                downColor: mode ? '#EF4444' : '#DC2626',
                borderVisible: false,
                wickUpColor: mode ? '#10B981' : '#059669',
                wickDownColor: mode ? '#EF4444' : '#DC2626',
              })
            : mainChartRef.current.addLineSeries({
                color: mode ? '#3B82F6' : '#2563EB',
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
          textColor: mode ? '#E2E8F0' : '#475569',
          background: { color: 'transparent' },
        },
        timeScale: {
          borderColor: mode ? '#334155' : '#CBD5E1',
        },
        rightPriceScale: {
          borderColor: mode ? '#334155' : '#CBD5E1',
        },
        crosshair: {
          vertLine: {
            color: mode ? '#64748B' : '#94A3B8',
          },
          horzLine: {
            color: mode ? '#64748B' : '#94A3B8',
          },
        },
        grid: {
          vertLines: {
            color: mode ? '#1E293B' : '#F1F5F9',
          },
          horzLines: {
            color: mode ? '#1E293B' : '#F1F5F9',
          },
        },
      });
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
    const cleanup = renderMainChart();
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [renderMainChart]);

  useEffect(() => {
    if (timeframeBadgeRef.current) {
      timeframeBadgeRef.current.textContent = `${timeframe}m`;
    }
  }, [timeframe]);

  return (
    <div ref={mainChartContainerRef} className="relative w-full h-full">
      {/* Chart will be rendered here */}
    </div>
  );
};
export default MainChart;
