// components/chart/ChartSettings.tsx
import React from "react";

import { Button } from "@/components/ui/button";

import { useChart } from "./ChartContext";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface ChartSettingsProps {
  onClose?: () => void;
}

export const ChartSettings: React.FC<ChartSettingsProps> = ({ onClose }) => {
  const {
    chartType,
    setChartType,
    timeframe,
    setTimeframe,
    showVolume,
    toggleVolume,
    indicators,
    toggleIndicator,
  } = useChart();

  const timeframeOptions = [
    { value: 1, label: "1 Minute" },
    { value: 5, label: "5 Minutes" },
    { value: 15, label: "15 Minutes" },
    { value: 30, label: "30 Minutes" },
    { value: 60, label: "1 Hour" },
    { value: 240, label: "4 Hours" },
    { value: 1440, label: "1 Day" },
  ];

  const chartTypeOptions = [
    { value: "Candlestick", label: "Candlestick" },
    { value: "Line", label: "Line" },
    { value: "Area", label: "Area" },
    { value: "Bar", label: "Bar" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chart Settings</h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        )}
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="general"
        className="w-full"
      >
        {/* General Settings */}
        <AccordionItem value="general">
          <AccordionTrigger>General</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chart-type">Chart Type</Label>
              <Select
                value={chartType}
                onValueChange={(value) => setChartType(value as never)}
              >
                <SelectTrigger id="chart-type">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  {chartTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select
                value={timeframe.toString()}
                onValueChange={(value) =>
                  setTimeframe(parseInt(value) as never)
                }
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="show-volume">Show Volume</Label>
              <Switch
                id="show-volume"
                checked={showVolume}
                onCheckedChange={toggleVolume}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Indicators Settings */}
        <AccordionItem value="indicators">
          <AccordionTrigger>Indicators</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="ma-indicator">Moving Average (20)</Label>
              <Switch
                id="ma-indicator"
                checked={indicators.ma}
                onCheckedChange={() => toggleIndicator("ma")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="bollinger-indicator">Bollinger Bands</Label>
              <Switch
                id="bollinger-indicator"
                checked={indicators.bollinger}
                onCheckedChange={() => toggleIndicator("bollinger")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="rsi-indicator">RSI (14)</Label>
              <Switch
                id="rsi-indicator"
                checked={indicators.rsi}
                onCheckedChange={() => toggleIndicator("rsi")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="macd-indicator">MACD</Label>
              <Switch
                id="macd-indicator"
                checked={indicators.macd}
                onCheckedChange={() => toggleIndicator("macd")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="volume-indicator">Volume</Label>
              <Switch
                id="volume-indicator"
                checked={indicators.volume}
                onCheckedChange={() => toggleIndicator("volume")}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Display Settings */}
        <AccordionItem value="display">
          <AccordionTrigger>Display</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="grid-lines">Grid Lines</Label>
                <Switch id="grid-lines" defaultChecked />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chart Zoom</Label>
              <Slider defaultValue={[50]} max={100} step={1} className="py-4" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="crosshair">Crosshair</Label>
                <Switch id="crosshair" defaultChecked />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
