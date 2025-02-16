// components/chart/ChartSettings.tsx
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeframeSelector } from "./sidebar/TimeframeSelector";
import { ChartTypeSelector } from "./sidebar/ChartTypeSelector";
import { IndicatorSettings } from "./sidebar/IndicatorSettings";
import { DisplaySettings } from "./sidebar/DisplaySettings";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useChart } from "./ChartContext";

interface ChartSettingsProps {
  onClose: () => void;
}

export const ChartSettings: React.FC<ChartSettingsProps> = ({ onClose }) => {
  const { instrument } = useChart();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Chart Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 px-4 py-2">
        <Tabs defaultValue="general" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-12rem)] mt-4">
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Instrument Info</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted">
                    <div>
                      <p className="text-xs text-muted-foreground">Symbol</p>
                      <p className="text-sm font-medium">
                        {instrument.exchange_code}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Exchange</p>
                      <p className="text-sm font-medium">
                        {instrument.exchange}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm font-medium">
                        {instrument.company_name}
                      </p>
                    </div>
                  </div>
                </div>

                <TimeframeSelector />
                <ChartTypeSelector />
                <DisplaySettings />
              </div>
            </TabsContent>

            <TabsContent value="indicators" className="space-y-6">
              <IndicatorSettings />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Chart Appearance</h3>
                {/* Add appearance settings here */}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Price Alerts</h3>
                {/* Add alert settings here */}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};
