import { useState } from "react";
import { Button, Dropdown, Modal, ToggleSwitch } from "flowbite-react";
import { HiAdjustments } from "react-icons/hi";
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
  const [isIndicatorsModalOpen, setIsIndicatorsModalOpen] = useState(false);
  const [customTimeframeInput, setCustomTimeframeInput] = useState("");

  const handleCustomTimeframeSubmit = () => {
    const parsedTimeframe = parseInt(customTimeframeInput, 10);
    if (!isNaN(parsedTimeframe) && parsedTimeframe > 0) {
      onTfChange(parsedTimeframe);
      setIsCustomTfModalOpen(false);
      setCustomTimeframeInput("");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Dropdown label={`Timeframe: ${timeframe}m`}>
        {[5, 15, 30, 60, 240, 1440].map((tf) => (
          <Dropdown.Item key={tf} onClick={() => onTfChange(tf)}>
            {tf} minutes
          </Dropdown.Item>
        ))}
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => setIsCustomTfModalOpen(true)}>Custom...</Dropdown.Item>
      </Dropdown>

      <Dropdown label={`Chart: ${chartType}`}>
        {["Candlestick", "Line"].map((type) => (
          <Dropdown.Item key={type} onClick={() => onChartTypeChange(type as SeriesType)}>
            {type}
          </Dropdown.Item>
        ))}
      </Dropdown>

      <Button onClick={() => setIsIndicatorsModalOpen(true)}>
        <HiAdjustments className="w-5 h-5 mr-2" />
        Indicators
      </Button>

      <ToggleSwitch checked={showVolume} onChange={onShowVolumeChange} label="Show Volume" />
      <ToggleSwitch checked={autoRefresh} onChange={onAutoRefreshChange} label="Auto-Refresh" />

      <Modal show={isCustomTfModalOpen} onClose={() => setIsCustomTfModalOpen(false)}>
        <Modal.Header>Custom Timeframe</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <label htmlFor="custom-timeframe" className="block text-sm font-medium text-gray-700">
              Enter custom timeframe (minutes):
            </label>
            <input
              type="number"
              id="custom-timeframe"
              value={customTimeframeInput}
              onChange={(e) => setCustomTimeframeInput(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="1"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCustomTimeframeSubmit}>Apply</Button>
          <Button color="gray" onClick={() => setIsCustomTfModalOpen(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isIndicatorsModalOpen} onClose={() => setIsIndicatorsModalOpen(false)}>
        <Modal.Header>Indicators</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {indicators.map((indicator) => (
              <div key={indicator.name} className="flex items-center justify-between">
                <span>{indicator.name}</span>
                <ToggleSwitch checked={indicator.active} onChange={() => onToggleIndicator(indicator.name)} />
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setIsIndicatorsModalOpen(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
