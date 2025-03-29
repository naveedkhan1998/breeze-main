// components/chart/ChartToolbar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Expand,
  Minimize2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCw,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from "lucide-react";
import { useChart } from "./ChartContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChartSettings } from "./ChartSettings";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className="w-8 h-8"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs">{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const ChartToolbar: React.FC = () => {
  const { 
    isFullscreen, 
    toggleFullscreen, 
    autoRefresh, 
    toggleAutoRefresh,
    isSidebarOpen,
    toggleSidebar
  } = useChart();
  
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleDownload = () => {
    // Implement CSV download logic
    alert("Downloading chart data...");
  };

  const handleZoomIn = () => {
    // This would typically interface with the chart API
    alert("Zoom in");
  };

  const handleZoomOut = () => {
    // This would typically interface with the chart API
    alert("Zoom out");
  };

  const handleReset = () => {
    // Reset chart view to default
    alert("Reset view");
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center space-x-1">
        <ToolbarButton
          icon={
            isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )
          }
          label={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          onClick={toggleSidebar}
        />
        <div className="h-4 mx-2 border-l border-border" />
        <ToolbarButton
          icon={<ZoomIn className="w-4 h-4" />}
          label="Zoom In"
          onClick={handleZoomIn}
        />
        <ToolbarButton
          icon={<ZoomOut className="w-4 h-4" />}
          label="Zoom Out"
          onClick={handleZoomOut}
        />
        <ToolbarButton
          icon={<RotateCw className="w-4 h-4" />}
          label="Reset View"
          onClick={handleReset}
        />
      </div>

      <div className="flex items-center space-x-1">
        <ToolbarButton
          icon={<RefreshCw className={`w-4 h-4 ${autoRefresh ? "text-primary" : ""}`} />}
          label={autoRefresh ? "Disable Auto-Refresh" : "Enable Auto-Refresh"}
          onClick={toggleAutoRefresh}
        />
        <ToolbarButton
          icon={<Download className="w-4 h-4" />}
          label="Download CSV"
          onClick={handleDownload}
        />
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Settings2 className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <ChartSettings onClose={() => setSettingsOpen(false)} />
          </SheetContent>
        </Sheet>
        <ToolbarButton
          icon={
            isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Expand className="w-4 h-4" />
            )
          }
          label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          onClick={toggleFullscreen}
        />
      </div>
    </div>
  );
};
