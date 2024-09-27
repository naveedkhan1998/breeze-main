import { useState } from "react";
import { Button, Modal, ToggleSwitch, Card, Label, TextInput } from "flowbite-react";
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
  const [isCustomTfModalOpen, setIsCustomTfModalOpen] = useState(false);
  const [customTimeframeInput, setCustomTimeframeInput] = useState("");

  const handleCustomTimeframeSubmit = () => {
    const parsedTimeframe = parseInt(customTimeframeInput, 10);
    if (!isNaN(parsedTimeframe) && parsedTimeframe > 0) {
      onTfChange(parsedTimeframe);
      setIsCustomTfModalOpen(false);
      setCustomTimeframeInput("");
    }
  };

  const timeframeOptions = [5, 15, 30, 60, 240, 1440];
  const chartTypes: SeriesType[] = ["Candlestick"];

  return (
    <div className="flex flex-col p-4 space-y-6 dark:text-white">
      {/* Timeframe Section */}
      <Card>
        <div className="flex items-center mb-4">
          <HiClock className="mr-2 text-xl text-gray-700 dark:text-white" />
          <h3 className="text-lg font-semibold">Timeframe</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {timeframeOptions.map((tf) => (
            <Button key={tf} size="sm" color={timeframe === tf ? "primary" : "light"} onClick={() => onTfChange(tf)} aria-pressed={timeframe === tf}>
              {tf}m
            </Button>
          ))}
        </div>
        <Button size="sm" className="mt-2" onClick={() => setIsCustomTfModalOpen(true)}>
          Custom
        </Button>
      </Card>

      {/* Chart Type Section */}
      <Card>
        <div className="flex items-center mb-4">
          <HiChartBar className="mr-2 text-xl text-gray-700 dark:text-white" />
          <h3 className="text-lg font-semibold">Chart Type</h3>
        </div>
        <div className="flex space-x-2">
          {chartTypes.map((type) => (
            <Button key={type} size="sm" color={chartType === type ? "primary" : "light"} onClick={() => onChartTypeChange(type)} aria-pressed={chartType === type}>
              {type}
            </Button>
          ))}
        </div>
      </Card>

      {/* Indicators Section */}
      <Card>
        <div className="flex items-center mb-4">
          <HiAdjustments className="mr-2 text-xl text-gray-700 dark:text-white" />
          <h3 className="text-lg font-semibold">Indicators</h3>
        </div>
        <div className="space-y-2">
          {indicators.map((indicator) => (
            <div key={indicator.name} className="flex items-center justify-between">
              <Label htmlFor={`indicator-${indicator.name}`} className="flex items-center space-x-2">
                <span>{indicator.name}</span>
              </Label>
              <ToggleSwitch id={`indicator-${indicator.name}`} checked={indicator.active} onChange={() => onToggleIndicator(indicator.name)} />
            </div>
          ))}
        </div>
      </Card>

      {/* Display Options Section */}
      <Card>
        <div className="flex items-center mb-4">
          <span className="text-lg font-semibold">Display Options</span>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="show-volume" className="flex items-center space-x-2">
            <span>Show Volume</span>
          </Label>
          <ToggleSwitch id="show-volume" checked={showVolume} onChange={onShowVolumeChange} />
        </div>
      </Card>

      {/* Auto-Refresh Section */}
      <Card>
        <div className="flex items-center mb-4">
          <HiRefresh className="mr-2 text-xl text-gray-700 dark:text-white" />
          <h3 className="text-lg font-semibold">Auto-Refresh</h3>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-refresh" className="flex items-center space-x-2">
            <span>Enable</span>
          </Label>
          <ToggleSwitch id="auto-refresh" checked={autoRefresh} onChange={onAutoRefreshChange} />
        </div>
      </Card>

      {/* Custom Timeframe Modal */}
      <Modal show={isCustomTfModalOpen} onClose={() => setIsCustomTfModalOpen(false)}>
        <Modal.Header>Custom Timeframe</Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCustomTimeframeSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="custom-timeframe">Enter custom timeframe (minutes):</Label>
              <TextInput type="number" id="custom-timeframe" value={customTimeframeInput} onChange={(e) => setCustomTimeframeInput(e.target.value)} required min="1" className="mt-1" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit">Apply</Button>
              <Button type="button" color="gray" onClick={() => setIsCustomTfModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
