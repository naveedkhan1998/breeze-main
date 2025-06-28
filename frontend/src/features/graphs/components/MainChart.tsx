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

import { Card } from '@/components/ui/card';
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

  const renderMainChart = useCallback(() => {
    if (mainChartContainerRef.current && seriesData.length) {
      if (!mainChartRef.current) {
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
          'absolute top-6 left-6 p-5 rounded-2xl glass-card min-w-[320px] max-w-[400px] shadow-2xl z-[10] transition-all duration-300 hover:shadow-3xl';

        mainChartContainerRef.current.appendChild(legendContainer);

        const headerRow = document.createElement('div');
        headerRow.className = 'flex items-center justify-between mb-4';

        const companyName = document.createElement('span');
        companyName.className =
          'text-xl font-bold text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text';
        companyName.textContent = obj?.company_name || '';

        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'flex items-center gap-3';

        const exchangeBadge = document.createElement('span');
        exchangeBadge.className =
          'status-badge px-3 py-1.5 text-xs font-semibold text-blue-700 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg dark:from-blue-900/40 dark:to-blue-800/30 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/30';
        exchangeBadge.textContent = obj?.exchange_code || '';

        const timeframeBadge = document.createElement('span');
        timeframeBadge.className =
          'status-badge px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 dark:from-slate-800/60 dark:to-slate-700/40 dark:text-slate-300 border-slate-200/50 dark:border-slate-600/30';
        timeframeBadge.textContent = `${timeframe}m`;

        badgeContainer.appendChild(exchangeBadge);
        badgeContainer.appendChild(timeframeBadge);

        headerRow.appendChild(companyName);
        headerRow.appendChild(badgeContainer);

        const separator = document.createElement('div');
        separator.className =
          'h-px my-4 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent';

        const priceRow = document.createElement('div');
        priceRow.className = 'grid grid-cols-2 gap-3 text-sm';

        legendContainer.appendChild(headerRow);
        legendContainer.appendChild(separator);
        legendContainer.appendChild(priceRow);

        chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
          if (param.time && seriesRef.current) {
            const data = param.seriesData.get(seriesRef.current);

            if (data) {
              priceRow.innerHTML = '';
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
                  item.className = 'price-item';

                  const labelSpan = document.createElement('span');
                  labelSpan.className =
                    'block mb-1 text-xs font-medium text-slate-500 dark:text-slate-400';
                  labelSpan.textContent = label;

                  const valueSpan = document.createElement('span');
                  valueSpan.className =
                    'block text-base font-bold text-slate-900 dark:text-slate-100';
                  valueSpan.textContent = value;

                  item.appendChild(labelSpan);
                  item.appendChild(valueSpan);
                  priceRow.appendChild(item);
                });
              } else if (chartType === 'Line' && 'value' in data) {
                const { value } = data as LineData;
                const item = document.createElement('div');
                item.className = 'col-span-2 price-item';

                const labelSpan = document.createElement('span');
                labelSpan.className =
                  'block mb-1 text-xs font-medium text-slate-500 dark:text-slate-400';
                labelSpan.textContent = 'Price';

                const valueSpan = document.createElement('span');
                valueSpan.className =
                  'block text-lg font-bold text-slate-900 dark:text-slate-100';
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
    <Card className="w-full h-full border-0 chart-container glass-card">
      <div ref={mainChartContainerRef} className="relative w-full h-full">
        {/* Chart will be rendered here */}
      </div>
    </Card>
  );
};

export default MainChart;
