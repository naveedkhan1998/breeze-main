import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { HiAdjustments, HiClock, HiChartBar, HiRefresh } from "react-icons/hi";
import { SeriesType } from "lightweight-charts";
import { Indicator } from "../common-types";

interface ChartControlsProps {
  timeframe: number;
  chartType: SeriesType;
  showVolume: boolean;
  autoRefresh: boolean;
  indicators: Indicator[];
  onTfChange: (tf: number) => void;
  onChartTypeChange: (type: SeriesType) => void;
  onShowVolumeChange: (show: boolean) => void;
  onAutoRefreshChange: (auto: boolean) => void;
  onToggleIndicator: (name: string) => void;
}

export default function ChartControls({
  timeframe,
  chartType,
  showVolume,
  autoRefresh,
  indicators,
  onTfChange,
  onChartTypeChange,
  onShowVolumeChange,
  onAutoRefreshChange,
  onToggleIndicator,
}: ChartControlsProps) {
  const [isCustomTfDialogOpen, setIsCustomTfDialogOpen] = useState(false);
  const [customTimeframeInput, setCustomTimeframeInput] = useState("");

  const handleCustomTimeframeSubmit = () => {
    const parsedTimeframe = parseInt(customTimeframeInput, 10);
    if (!isNaN(parsedTimeframe) && parsedTimeframe > 0) {
      onTfChange(parsedTimeframe);
      setIsCustomTfDialogOpen(false);
      setCustomTimeframeInput("");
    }
  };

  const timeframeOptions = [5, 15, 30, 60, 240, 1440];
  const chartTypes: SeriesType[] = ["Candlestick"];

  return (
    <div className="flex flex-col flex-grow p-6 space-y-8 rounded-lg shadow-lg ">
      {/* Timeframe Section */}
      <Card className="p-6 border rounded-lg shadow-sm ">
        <div className="flex items-center mb-4">
          <HiClock className="mr-2 text-2xl text-blue-500" />
          <h3 className="text-lg font-semibold ">Timeframe</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {timeframeOptions.map((tf) => (
            <Button key={tf} size="sm" variant={timeframe === tf ? "default" : "outline"} className="rounded-lg" onClick={() => onTfChange(tf)} aria-pressed={timeframe === tf}>
              {tf}m
            </Button>
          ))}
        </div>
        <Button size="sm" className="w-full mt-4 rounded-lg" onClick={() => setIsCustomTfDialogOpen(true)}>
          Custom
        </Button>
      </Card>

      {/* Chart Type Section */}
      <Card className="p-6 border rounded-lg shadow-sm ">
        <div className="flex items-center mb-4">
          <HiChartBar className="mr-2 text-2xl text-green-500" />
          <h3 className="text-lg font-semibold ">Chart Type</h3>
        </div>
        <div className="flex space-x-3">
          {chartTypes.map((type) => (
            <Button key={type} size="sm" variant={chartType === type ? "default" : "outline"} className="rounded-lg" onClick={() => onChartTypeChange(type)} aria-pressed={chartType === type}>
              {type}
            </Button>
          ))}
        </div>
      </Card>

      {/* Indicators Section */}
      <Card className="p-6 border rounded-lg shadow-sm ">
        <div className="flex items-center mb-4">
          <HiAdjustments className="mr-2 text-2xl text-yellow-500" />
          <h3 className="text-lg font-semibold ">Indicators</h3>
        </div>
        <div className="space-y-3">
          {indicators.map((indicator) => (
            <div key={indicator.name} className="flex items-center justify-between">
              <Label htmlFor={`indicator-${indicator.name}`} className="">
                {indicator.name}
              </Label>
              <Switch id={`indicator-${indicator.name}`} checked={indicator.active} onCheckedChange={() => onToggleIndicator(indicator.name)} />
            </div>
          ))}
        </div>
      </Card>

      {/* Display Options Section */}
      <Card className="p-6 border rounded-lg shadow-sm ">
        <h3 className="mb-4 text-lg font-semibold ">Display Options</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-volume" className="">
            Show Volume
          </Label>
          <Switch id="show-volume" checked={showVolume} onCheckedChange={onShowVolumeChange} />
        </div>
      </Card>

      {/* Auto-Refresh Section */}
      <Card className="p-6 border rounded-lg shadow-sm ">
        <div className="flex items-center mb-4">
          <HiRefresh className="mr-2 text-2xl text-purple-500" />
          <h3 className="text-lg font-semibold ">Auto-Refresh</h3>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-refresh" className="">
            Enable
          </Label>
          <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={onAutoRefreshChange} />
        </div>
      </Card>

      {/* Custom Timeframe Dialog */}
      <Dialog open={isCustomTfDialogOpen} onOpenChange={setIsCustomTfDialogOpen}>
        <DialogContent className="p-6 rounded-lg shadow-lg ">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold ">Custom Timeframe</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCustomTimeframeSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="custom-timeframe" className="">
                Enter custom timeframe (minutes):
              </Label>
              <Input type="number" id="custom-timeframe" value={customTimeframeInput} onChange={(e) => setCustomTimeframeInput(e.target.value)} required min={1} className="mt-2" />
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="submit" className="rounded-lg">
                Apply
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsCustomTfDialogOpen(false)} className="rounded-lg">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
