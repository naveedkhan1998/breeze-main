import React, { useState } from "react";
import { Dropdown, Button, Modal, ToggleSwitch } from "flowbite-react";
import {  HiAdjustments } from "react-icons/hi";
import { toast } from "react-toastify";
import { Indicator } from "../common-types";
import { SeriesType } from "lightweight-charts";

interface ChartControlsProps {
  timeframe: number;
  chartType: string;
  showVolume: boolean;
  autoRefresh: boolean;
  indicators: Indicator[];
  onTfChange: (tf: number) => void;
  onChartTypeChange: (type: SeriesType) => void;
  onShowVolumeChange: (show: boolean) => void;
  onAutoRefreshChange: (auto: boolean) => void;
  onToggleIndicator: (name: string) => void;
}

const ChartControls: React.FC<ChartControlsProps> = ({
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
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIndicatorsModalOpen, setIsIndicatorsModalOpen] = useState(false);
  const [customTimeframeInput, setCustomTimeframeInput] = useState("");

  const openCustomTimeframeModal = () => {
    setIsModalOpen(true);
  };

  const closeCustomTimeframeModal = () => {
    setIsModalOpen(false);
    setCustomTimeframeInput("");
  };

  const handleCustomTimeframeSubmit = () => {
    const parsedTimeFrame = parseInt(customTimeframeInput, 10);
    if (!isNaN(parsedTimeFrame) && parsedTimeFrame > 0) {
      onTfChange(parsedTimeFrame);
      closeCustomTimeframeModal();
    } else {
      toast.error("Invalid input. Please enter a positive number.");
    }
  };

  const openIndicatorsModal = () => {
    setIsIndicatorsModalOpen(true);
  };

  const closeIndicatorsModal = () => {
    setIsIndicatorsModalOpen(false);
  };

  return (
    <div className="z-20 flex flex-wrap items-center justify-between p-4 mb-6 bg-white rounded-md shadow-md">
      {/* Timeframe and Chart Type Section */}
      <div className="flex items-center space-x-4">
        <Dropdown label={`Timeframe: ${timeframe}m`} size="sm">
          {[5, 10, 15, 30, 60, 240, 1440].map((tf) => (
            <Dropdown.Item key={tf} onClick={() => onTfChange(tf)}>
              {tf} minutes
            </Dropdown.Item>
          ))}
          <Dropdown.Divider />
          <Dropdown.Item onClick={openCustomTimeframeModal}>Custom...</Dropdown.Item>
        </Dropdown>

        <Dropdown label={`Chart: ${chartType}`} size="sm">
          {["Candlestick", "Line"].map((type) => (
            <Dropdown.Item key={type} onClick={() => onChartTypeChange(type as SeriesType)}>
              {type}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </div>

      {/* Indicators Section */}
      <div className="flex items-center space-x-4">
        <Button size="sm" onClick={openIndicatorsModal}>
          <HiAdjustments className="w-5 h-5 mr-2"/>
          Indicators
        </Button>
      </div>

      {/* Settings Section */}
      <div className="flex items-center space-x-4">
        <ToggleSwitch checked={showVolume} onChange={onShowVolumeChange} label="Show Volume" />
        <ToggleSwitch checked={autoRefresh} onChange={onAutoRefreshChange} label="Auto-Refresh" />
        
      </div>

      {/* Custom Timeframe Modal */}
      <Modal show={isModalOpen} onClose={closeCustomTimeframeModal}>
        <Modal.Header>Enter Custom Timeframe</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700">Timeframe (minutes):</span>
              <input
                type="number"
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                placeholder="e.g., 45"
                value={customTimeframeInput}
                onChange={(e) => setCustomTimeframeInput(e.target.value)}
                min="1"
              />
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCustomTimeframeSubmit}>Submit</Button>
          <Button color="gray" onClick={closeCustomTimeframeModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Indicators Modal */}
      <Modal show={isIndicatorsModalOpen} onClose={closeIndicatorsModal}>
        <Modal.Header>Toggle Indicators</Modal.Header>
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
          <Button color="gray" onClick={closeIndicatorsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChartControls;
