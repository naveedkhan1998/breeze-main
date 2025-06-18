import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HiClock, HiChartBar, HiPlay, HiPause } from "react-icons/hi";
import { SeriesType } from "lightweight-charts";

interface ChartControlsProps {
  timeframe: number;
  chartType: SeriesType;
  showVolume: boolean;
  autoRefresh: boolean;
  onTfChange: (tf: number) => void;
  onChartTypeChange: (type: SeriesType) => void;
  onShowVolumeChange: (show: boolean) => void;
  onAutoRefreshChange: (auto: boolean) => void;
}

export default function ChartControls({
  timeframe,
  chartType,
  showVolume,
  autoRefresh,
  onTfChange,
  onChartTypeChange,
  onShowVolumeChange,
  onAutoRefreshChange,
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

  const timeframeOptions = [
    { value: 1, label: "1m" },
    { value: 5, label: "5m" },
    { value: 15, label: "15m" },
    { value: 30, label: "30m" },
    { value: 60, label: "1h" },
    { value: 240, label: "4h" },
    { value: 1440, label: "1D" },
  ];

  const chartTypes: { value: SeriesType; label: string }[] = [
    { value: "Candlestick", label: "Candles" },
    { value: "Line", label: "Line" },
  ];

  return (
    <div className="space-y-6">
      {/* Timeframe Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HiClock className="h-4 w-4 text-chart-1" />
          <h4 className="text-sm font-semibold text-foreground">
            Timeframe
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {timeframeOptions.map((tf) => (
            <Button
              key={tf.value}
              size="sm"
              variant={timeframe === tf.value ? "default" : "outline"}
              className="h-8 text-xs transition-all hover:scale-105"
              onClick={() => onTfChange(tf.value)}
            >
              {tf.label}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="w-full h-8 text-xs border border-dashed"
          onClick={() => setIsCustomTfDialogOpen(true)}
        >
          Custom
        </Button>
      </div>

      <Separator />

      {/* Chart Type Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <HiChartBar className="h-4 w-4 text-chart-2" />
          <h4 className="text-sm font-semibold text-foreground">
            Chart Type
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map((type) => (
            <Button
              key={type.value}
              size="sm"
              variant={chartType === type.value ? "default" : "outline"}
              className="h-8 text-xs transition-all hover:scale-105"
              onClick={() => onChartTypeChange(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Display Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Display Options
        </h4>
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <Label htmlFor="show-volume" className="text-sm">
            Volume Chart
          </Label>
          <Switch
            id="show-volume"
            checked={showVolume}
            onCheckedChange={onShowVolumeChange}
          />
        </div>
      </div>

      <Separator />

      {/* Auto-Refresh Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {autoRefresh ? (
              <HiPause className="h-4 w-4 text-chart-4" />
            ) : (
              <HiPlay className="h-4 w-4 text-chart-2" />
            )}
            <h4 className="text-sm font-semibold text-foreground">
              Auto-Refresh
            </h4>
          </div>
          {autoRefresh && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              Live
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <Label htmlFor="auto-refresh" className="text-sm">
            Enable Live Updates
          </Label>
          <Switch
            id="auto-refresh"
            checked={autoRefresh}
            onCheckedChange={onAutoRefreshChange}
          />
        </div>
        {autoRefresh && (
          <p className="text-xs text-muted-foreground">
            Data refreshes every second
          </p>
        )}
      </div>

      {/* Custom Timeframe Dialog */}
      <Dialog
        open={isCustomTfDialogOpen}
        onOpenChange={setIsCustomTfDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Custom Timeframe
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCustomTimeframeSubmit();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="custom-timeframe" className="text-sm font-medium">
                Enter timeframe in minutes:
              </Label>
              <Input
                type="number"
                id="custom-timeframe"
                value={customTimeframeInput}
                onChange={(e) => setCustomTimeframeInput(e.target.value)}
                placeholder="e.g., 45"
                required
                min={1}
                className="h-9"
              />
              <p className="text-xs text-slate-500">
                Examples: 3, 7, 45, 120, etc.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomTfDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Apply
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
