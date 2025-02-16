// components/chart/ChartHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DownloadCloud,
  Expand,
  Minimize2,
  ArrowLeft,
  RotateCw,
  Menu,
} from "lucide-react";
import { useChart } from "./ChartContext";
import { formatPrice } from "@/lib/chart-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChartSettings } from "./ChartSettings";

export const ChartHeader: React.FC = () => {
  const navigate = useNavigate();
  const { instrument, isFullscreen, toggleFullscreen, timeframe } = useChart();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // You would typically get this from your real-time data
  const currentPrice = 150.25;
  const priceChange = 2.5;
  const percentChange = 1.67;
  const isPositive = priceChange >= 0;

  const handleDownload = () => {
    // Implement your CSV download logic here
  };

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="lg:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            {instrument.company_name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
              {instrument.exchange_code}
            </span>
            <span className="px-2 py-1 text-xs rounded-md bg-secondary/10 text-secondary">
              {timeframe}m
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="items-baseline hidden gap-3 mr-6 md:flex">
          <span className="text-lg font-semibold">
            {formatPrice(currentPrice)}
          </span>
          <span
            className={`text-sm ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {priceChange} ({percentChange}%)
          </span>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location.reload()}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <DownloadCloud className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download Data</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Expand className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <ChartSettings onClose={() => setSettingsOpen(false)} />
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownload}>
              Download Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleFullscreen}>
              {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
