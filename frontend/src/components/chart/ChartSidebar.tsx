// components/chart/ChartSidebar.tsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeframeSelector } from "./sidebar/TimeframeSelector";
import { ChartTypeSelector } from "./sidebar/ChartTypeSelector";
import { IndicatorSettings } from "./sidebar/IndicatorSettings";
import { DisplaySettings } from "./sidebar/DisplaySettings";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChart } from "./ChartContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ChartSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { instrument } = useChart();

  if (isCollapsed) {
    return (
      <div className="relative hidden w-12 border-r lg:block animate-in slide-in-from-left">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="relative hidden border-r lg:block w-80 animate-in slide-in-from-left">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => setIsCollapsed(true)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Tabs defaultValue="chart" className="h-full">
        <TabsList className="grid w-full h-12 grid-cols-3 p-0">
          <TabsTrigger value="chart" className="rounded-none">
            Chart
          </TabsTrigger>
          <TabsTrigger value="studies" className="rounded-none">
            Studies
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-none">
            Alerts
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-3rem)]">
          <TabsContent value="chart" className="p-4 m-0 space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Instrument Info</h3>
              <div className="grid gap-2 p-3 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Exchange
                  </Label>
                  <p className="text-sm font-medium">{instrument.exchange}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Symbol
                  </Label>
                  <p className="text-sm font-medium">
                    {instrument.exchange_code}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Company
                  </Label>
                  <p className="text-sm font-medium">
                    {instrument.company_name}
                  </p>
                </div>
              </div>
            </div>

            <TimeframeSelector />
            <ChartTypeSelector />
            <DisplaySettings />
          </TabsContent>

          <TabsContent value="studies" className="m-0">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="Search indicators..." className="h-8" />
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="trend">
                  <AccordionTrigger className="text-sm">
                    Trend Indicators
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <IndicatorSettings />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="momentum">
                  <AccordionTrigger className="text-sm">
                    Momentum Indicators
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    {/* Add momentum indicators */}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="volatility">
                  <AccordionTrigger className="text-sm">
                    Volatility Indicators
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    {/* Add volatility indicators */}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="m-0">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Price Alerts</h3>
                <Button size="sm" variant="outline">
                  Add Alert
                </Button>
              </div>

              <Card className="p-3">
                <p className="text-sm text-muted-foreground">
                  No alerts set. Click "Add Alert" to create one.
                </p>
              </Card>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};
