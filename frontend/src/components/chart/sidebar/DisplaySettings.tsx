// components/chart/sidebar/DisplaySettings.tsx
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useChart } from "../ChartContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const DisplaySettings: React.FC = () => {
  const { showVolume, toggleVolume, autoRefresh, toggleAutoRefresh } =
    useChart();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Display Settings</CardTitle>
        <CardDescription className="text-xs">
          Customize chart appearance and behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Show Volume</Label>
            <p className="text-xs text-muted-foreground">
              Display volume bars below the main chart
            </p>
          </div>
          <Switch checked={showVolume} onCheckedChange={toggleVolume} />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm">Auto Refresh</Label>
            <p className="text-xs text-muted-foreground">
              Automatically update chart data
            </p>
          </div>
          <Switch checked={autoRefresh} onCheckedChange={toggleAutoRefresh} />
        </div>
      </CardContent>
    </Card>
  );
};
