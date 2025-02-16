// components/chart/sidebar/IndicatorSettings.tsx
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useChart } from "../ChartContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDICATORS = [
  {
    id: "ma",
    name: "Moving Average",
    description: "Simple moving average indicator",
    settings: [
      { name: "Period", type: "number", default: 20 },
      {
        name: "Source",
        type: "select",
        options: ["close", "open", "high", "low"],
      },
    ],
  },
  {
    id: "bollinger",
    name: "Bollinger Bands",
    description: "Volatility bands based on standard deviation",
    settings: [
      { name: "Period", type: "number", default: 20 },
      { name: "StdDev", type: "number", default: 2 },
    ],
  },
  {
    id: "rsi",
    name: "RSI",
    description: "Relative Strength Index",
    settings: [
      { name: "Period", type: "number", default: 14 },
      { name: "Overbought", type: "number", default: 70 },
      { name: "Oversold", type: "number", default: 30 },
    ],
  },
  {
    id: "macd",
    name: "MACD",
    description: "Moving Average Convergence Divergence",
    settings: [
      { name: "Fast Period", type: "number", default: 12 },
      { name: "Slow Period", type: "number", default: 26 },
      { name: "Signal Period", type: "number", default: 9 },
    ],
  },
];

export const IndicatorSettings: React.FC = () => {
  const { indicators, toggleIndicator } = useChart();
  const [settings, setSettings] = useState<
    Record<string, Record<string, string | number>>
  >({});

  const handleSettingChange = (
    indicatorId: string,
    settingName: string,
    value: string | number,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [indicatorId]: {
        ...(prev[indicatorId] || {}),
        [settingName]: value,
      },
    }));
  };

  const handleApplySettings = (indicatorId: string) => {
    // Here you would typically dispatch these settings to your chart context
    console.log(`Applying settings for ${indicatorId}:`, settings[indicatorId]);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Indicators</Label>
      <Accordion type="single" collapsible className="w-full">
        {INDICATORS.map((indicator) => (
          <AccordionItem key={indicator.id} value={indicator.id}>
            <div className="flex items-center justify-between py-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{indicator.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {indicator.description}
                  </span>
                </div>
              </AccordionTrigger>
              <Switch
                checked={indicators[indicator.id as keyof typeof indicators]}
                onCheckedChange={() =>
                  toggleIndicator(indicator.id as keyof typeof indicators)
                }
                className="mr-4"
              />
            </div>
            <AccordionContent>
              <div className="p-4 space-y-4">
                {indicator.settings.map((setting) => (
                  <div key={setting.name} className="space-y-2">
                    <Label className="text-xs">{setting.name}</Label>
                    {setting.type === "select" ? (
                      <Select
                        value={String(
                          settings[indicator.id]?.[setting.name] ||
                            setting.default,
                        )}
                        onValueChange={(value) =>
                          handleSettingChange(indicator.id, setting.name, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={setting.type}
                        value={
                          settings[indicator.id]?.[setting.name] ||
                          setting.default
                        }
                        onChange={(e) =>
                          handleSettingChange(
                            indicator.id,
                            setting.name,
                            e.target.value,
                          )
                        }
                        className="h-8"
                      />
                    )}
                  </div>
                ))}
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleApplySettings(indicator.id)}
                >
                  Apply Settings
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
