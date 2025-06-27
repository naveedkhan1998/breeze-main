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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HiClock,
  HiChartBar,
  HiPlay,
  HiPause,
  HiEye,
  HiTrendingUp,
  HiCog,
  HiLightningBolt,
  HiViewGrid,
  HiSparkles,
  HiChartSquareBar,
  HiAdjustments,
} from "react-icons/hi";
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
    { value: 1, label: "1m", category: "Short Term" },
    { value: 5, label: "5m", category: "Short Term" },
    { value: 15, label: "15m", category: "Short Term" },
    { value: 30, label: "30m", category: "Medium Term" },
    { value: 60, label: "1h", category: "Medium Term" },
    { value: 240, label: "4h", category: "Long Term" },
    { value: 1440, label: "1D", category: "Long Term" },
  ];

  const chartTypes: {
    value: SeriesType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      value: "Candlestick",
      label: "Candlestick",
      icon: <HiChartBar className="w-4 h-4" />,
      description: "OHLC data visualization",
    },
    {
      value: "Line",
      label: "Line Chart",
      icon: <HiTrendingUp className="w-4 h-4" />,
      description: "Price trend line",
    },
  ];

  const shortTermTFs = timeframeOptions.filter(
    (tf) => tf.category === "Short Term",
  );
  const mediumTermTFs = timeframeOptions.filter(
    (tf) => tf.category === "Medium Term",
  );
  const longTermTFs = timeframeOptions.filter(
    (tf) => tf.category === "Long Term",
  );

  return (
    <div className="space-y-6 scrollbar-hidden">
      {/* Timeframe Section */}
      <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 border rounded-lg bg-chart-1/10 text-chart-1 border-chart-1/20">
              <HiClock className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-card-foreground">
                Timeframe
              </span>
              <span className="text-xs text-muted-foreground">
                Select chart interval
              </span>
            </div>
            {timeframe && (
              <Badge
                variant="secondary"
                className="ml-auto text-xs border bg-chart-1/10 text-chart-1 border-chart-1/20"
              >
                {timeframe}m
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Short Term */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-2"></div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Short Term
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {shortTermTFs.map((tf) => (
                <Button
                  key={tf.value}
                  size="sm"
                  variant={timeframe === tf.value ? "default" : "outline"}
                  className={`h-9 text-xs font-semibold transition-all duration-300 ${
                    timeframe === tf.value
                      ? "shadow-lg scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:scale-105 hover:shadow-md border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => onTfChange(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Medium Term */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-3"></div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Medium Term
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {mediumTermTFs.map((tf) => (
                <Button
                  key={tf.value}
                  size="sm"
                  variant={timeframe === tf.value ? "default" : "outline"}
                  className={`h-9 text-xs font-semibold transition-all duration-300 ${
                    timeframe === tf.value
                      ? "shadow-lg scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:scale-105 hover:shadow-md border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => onTfChange(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Long Term */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-4"></div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Long Term
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {longTermTFs.map((tf) => (
                <Button
                  key={tf.value}
                  size="sm"
                  variant={timeframe === tf.value ? "default" : "outline"}
                  className={`h-9 text-xs font-semibold transition-all duration-300 ${
                    timeframe === tf.value
                      ? "shadow-lg scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:scale-105 hover:shadow-md border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => onTfChange(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="w-full h-10 text-xs font-medium transition-all duration-300 border-2 border-dashed border-border hover:bg-accent hover:text-accent-foreground"
            onClick={() => setIsCustomTfDialogOpen(true)}
          >
            <HiCog className="w-3 h-3 mr-2" />
            Custom Timeframe
          </Button>
        </CardContent>
      </Card>

      {/* Chart Type Section */}
      <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 border rounded-lg bg-chart-5/10 text-chart-5 border-chart-5/20">
              <HiViewGrid className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-card-foreground">
                Chart Style
              </span>
              <span className="text-xs text-muted-foreground">
                Choose visualization type
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chartTypes.map((type) => (
            <div
              key={type.value}
              className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                chartType === type.value
                  ? "border-primary bg-primary/5 shadow-lg transform scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
              onClick={() => onChartTypeChange(type.value)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    chartType === type.value
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {type.icon}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-semibold text-sm ${
                      chartType === type.value
                        ? "text-foreground"
                        : "text-card-foreground"
                    }`}
                  >
                    {type.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {type.description}
                  </div>
                </div>
                {chartType === type.value && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 border rounded-lg bg-chart-2/10 text-chart-2 border-chart-2/20">
              <HiEye className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-card-foreground">
                Display Options
              </span>
              <span className="text-xs text-muted-foreground">
                Configure chart visibility
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 ${
              showVolume
                ? "border-chart-2/30 bg-chart-2/5"
                : "border-border bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  showVolume
                    ? "bg-chart-2/10 text-chart-2"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <HiChartSquareBar className="w-3 h-3" />
              </div>
              <div>
                <Label
                  htmlFor="show-volume"
                  className="text-sm font-semibold cursor-pointer text-card-foreground"
                >
                  Volume Chart
                </Label>
                <div className="text-xs text-muted-foreground">
                  Show trading volume data
                </div>
              </div>
            </div>
            <Switch
              id="show-volume"
              checked={showVolume}
              onCheckedChange={onShowVolumeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Refresh Section */}
      <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div
              className={`p-2 rounded-lg transition-all duration-300 ${
                autoRefresh
                  ? "bg-chart-2/10 text-chart-2 animate-pulse border border-chart-2/20"
                  : "bg-chart-4/10 text-chart-4 border border-chart-4/20"
              }`}
            >
              {autoRefresh ? (
                <HiPause className="w-4 h-4" />
              ) : (
                <HiPlay className="w-4 h-4" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-card-foreground">
                  Live Updates
                </span>
                {autoRefresh && (
                  <Badge
                    variant="default"
                    className="text-xs border bg-chart-2/10 text-chart-2 animate-pulse border-chart-2/20"
                  >
                    <div className="w-1.5 h-1.5 bg-chart-2 rounded-full mr-1"></div>
                    Live
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {autoRefresh
                  ? "Data refreshes every second"
                  : "Manual refresh mode"}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 ${
              autoRefresh
                ? "border-chart-2/30 bg-chart-2/5"
                : "border-border bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg transition-all duration-300 ${
                  autoRefresh
                    ? "bg-chart-2/10 text-chart-2 animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <HiLightningBolt className="w-3 h-3" />
              </div>
              <div>
                <Label
                  htmlFor="auto-refresh"
                  className="text-sm font-semibold cursor-pointer text-card-foreground"
                >
                  Auto-Refresh Data
                </Label>
                <div className="text-xs text-muted-foreground">
                  {autoRefresh
                    ? "Real-time market data"
                    : "Click to enable live data"}
                </div>
              </div>
            </div>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={onAutoRefreshChange}
            />
          </div>

          {autoRefresh && (
            <div className="flex items-center gap-2 p-2 border rounded-lg bg-chart-2/5 border-chart-2/20">
              <div className="w-2 h-2 rounded-full bg-chart-2 animate-ping"></div>
              <span className="text-xs font-medium text-chart-2">
                Connected • Real-time updates active
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <HiAdjustments className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-card-foreground">
                Advanced
              </span>
              <span className="text-xs text-muted-foreground">
                Additional settings
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-muted">
              <HiSparkles className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              More features coming soon
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Timeframe Dialog */}
      <Dialog
        open={isCustomTfDialogOpen}
        onOpenChange={setIsCustomTfDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] bg-popover/95 backdrop-blur-md border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="p-2 rounded-lg bg-chart-1/10 text-chart-1">
                <HiClock className="w-4 h-4" />
              </div>
              Custom Timeframe
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCustomTimeframeSubmit();
            }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <Label
                htmlFor="custom-timeframe"
                className="text-sm font-semibold text-popover-foreground"
              >
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
                className="text-lg font-semibold text-center transition-all duration-200 border-2 h-11 focus:border-ring"
              />
              <div className="p-3 border rounded-lg bg-chart-1/5 border-chart-1/20">
                <p className="text-xs font-medium text-chart-1">
                  💡 Examples: 3, 7, 45, 120, 360, etc.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter any positive number for minutes
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomTfDialogOpen(false)}
                className="px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="px-6 shadow-lg h-9 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Apply Timeframe
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
