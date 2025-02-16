// components/chart/sidebar/TimeframeSelector.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useChart } from "../ChartContext";

const TIMEFRAMES = [
  { label: "5m", value: 5 },
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "4h", value: 240 },
  { label: "1d", value: 1440 },
];

export const TimeframeSelector: React.FC = () => {
  const { timeframe, setTimeframe } = useChart();
  const [customTf, setCustomTf] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCustomTfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tf = parseInt(customTf, 10);
    if (!isNaN(tf) && tf > 0) {
      setTimeframe(tf);
      setIsDialogOpen(false);
      setCustomTf("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Timeframe</Label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {TIMEFRAMES.map(({ label, value }) => (
          <Button
            key={value}
            variant={timeframe === value ? "default" : "outline"}
            className="w-full"
            onClick={() => setTimeframe(value)}
          >
            {label}
          </Button>
        ))}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Custom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Custom Timeframe</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCustomTfSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-tf">Minutes</Label>
                <Input
                  id="custom-tf"
                  type="number"
                  min="1"
                  value={customTf}
                  onChange={(e) => setCustomTf(e.target.value)}
                  placeholder="Enter timeframe in minutes"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Apply</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
