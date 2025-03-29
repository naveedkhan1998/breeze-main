// components/chart/ChartSidebar.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChart } from "./ChartContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const ChartSidebar: React.FC = () => {
  const {
    instrument,
    timeframe,
    setTimeframe,
    chartType,
    setChartType,
    indicators,
    toggleIndicator,
    showVolume,
    toggleVolume,
    isSidebarOpen,
    toggleSidebar,
  } = useChart();

  if (!isSidebarOpen) {
    return (
      <div className="relative hidden w-10 border-r lg:block dark:border-zinc-800">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-1"
          onClick={toggleSidebar}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  const timeframeOptions = [
    { value: 1, label: "1m" },
    { value: 5, label: "5m" },
    { value: 15, label: "15m" },
    { value: 30, label: "30m" },
    { value: 60, label: "1h" },
    { value: 240, label: "4h" },
    { value: 1440, label: "1d" },
  ];

  const chartTypeOptions = [
    { value: "Candlestick", label: "Candles" },
    { value: "Line", label: "Line" },
    { value: "Area", label: "Area" },
    { value: "Bar", label: "Bar" },
  ];

  return (
    <Card className="relative hidden w-64 border-r lg:block dark:border-zinc-800 bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-3"
        onClick={toggleSidebar}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Tabs defaultValue="chart" className="h-full">
        <TabsList className="grid w-full grid-cols-3 border-b rounded-none h-14">
          <TabsTrigger
            value="chart"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Chart
          </TabsTrigger>
          <TabsTrigger
            value="indicators"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Indicators
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            Info
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          <TabsContent value="chart" className="m-0">
            <div className="p-4 space-y-6">
              {/* Instrument Badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm font-medium"
                >
                  {instrument.exchange_code}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  {instrument.series}
                </Badge>
              </div>

              {/* Timeframe Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Timeframe</h3>
                <div className="grid grid-cols-4 gap-2">
                  {timeframeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        timeframe === option.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setTimeframe(
                          option.value as 1 | 5 | 15 | 30 | 60 | 240 | 1440,
                        )
                      }
                      className="h-8 text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chart Type Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Chart Type</h3>
                <RadioGroup
                  value={chartType}
                  onValueChange={(value) =>
                    setChartType(
                      value as "Candlestick" | "Line" | "Area" | "Bar",
                    )
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  {chartTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Display Settings */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Display Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-volume">Show Volume</Label>
                    <Switch
                      id="show-volume"
                      checked={showVolume}
                      onCheckedChange={toggleVolume}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="indicators" className="m-0">
            <div className="p-4 space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="trend">
                  <AccordionTrigger className="text-sm">
                    Trend Indicators
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ma-indicator">Moving Average</Label>
                      <Switch
                        id="ma-indicator"
                        checked={indicators.ma}
                        onCheckedChange={() => toggleIndicator("ma")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bollinger-indicator">
                        Bollinger Bands
                      </Label>
                      <Switch
                        id="bollinger-indicator"
                        checked={indicators.bollinger}
                        onCheckedChange={() => toggleIndicator("bollinger")}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="momentum">
                  <AccordionTrigger className="text-sm">
                    Momentum Indicators
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rsi-indicator">RSI</Label>
                      <Switch
                        id="rsi-indicator"
                        checked={indicators.rsi}
                        onCheckedChange={() => toggleIndicator("rsi")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="macd-indicator">MACD</Label>
                      <Switch
                        id="macd-indicator"
                        checked={indicators.macd}
                        onCheckedChange={() => toggleIndicator("macd")}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="volume">
                  <AccordionTrigger className="text-sm">
                    Volume Indicators
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="volume-indicator">Volume</Label>
                      <Switch
                        id="volume-indicator"
                        checked={indicators.volume}
                        onCheckedChange={() => toggleIndicator("volume")}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="info" className="m-0">
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-medium">Instrument Information</h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Exchange
                    </Label>
                    <p className="text-sm font-medium">
                      {instrument.exchange_code}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Series
                    </Label>
                    <p className="text-sm font-medium">{instrument.series}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Company
                    </Label>
                    <p className="text-sm font-medium">
                      {instrument.company_name}
                    </p>
                  </div>

                  {instrument.series === "OPTION" && (
                    <>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Strike
                        </Label>
                        <p className="text-sm font-medium">
                          {instrument.strike_price}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Type
                        </Label>
                        <p className="text-sm font-medium">
                          {instrument.option_type}
                        </p>
                      </div>
                    </>
                  )}

                  {(instrument.series === "OPTION" ||
                    instrument.series === "FUTURE") && (
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        Expiry
                      </Label>
                      <p className="text-sm font-medium">
                        {new Date(instrument.expiry || "").toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};
