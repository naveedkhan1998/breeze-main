// components/chart/ChartGrid.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatPrice, formatVolume } from "@/lib/chart-utils";

import { Trade } from "@/common-types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const ChartGrid: React.FC = () => {
  // This would typically come from a real-time API
  // For demo purposes, we're generating mock trades
  const recentTrades: Trade[] = React.useMemo(() => {
    // Generate some realistic-looking mock trades
    const basePrice = 150;
    const mockTrades: Trade[] = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      // Create time with decreasing intervals
      const tradeTime = new Date(now);
      tradeTime.setSeconds(now.getSeconds() - i * 30);

      // Random price fluctuations
      const priceChange = (Math.random() - 0.5) * 0.3;
      const price = basePrice + priceChange;

      // Random volume between 50 and 500
      const volume = Math.floor(Math.random() * 450) + 50;

      // Random side
      const side = Math.random() > 0.5 ? "buy" : "sell";

      mockTrades.push({
        time: tradeTime.toLocaleTimeString(),
        price,
        volume,
        side,
      });
    }

    return mockTrades;
  }, []);

  return (
    <Card className="absolute bottom-0 right-0 h-48 m-4 border shadow-lg w-80 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-xs font-medium">Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="px-3 h-36">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="py-1 text-left">Time</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Size</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="py-1 text-xs">{trade.time}</td>
                  <td
                    className={`py-1 text-xs text-right font-medium ${
                      trade.side === "buy" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {formatPrice(trade.price)}
                  </td>
                  <td className="py-1 text-xs text-right">
                    <Badge
                      variant="outline"
                      className={`px-1 py-0 text-[10px] ${
                        trade.side === "buy"
                          ? "border-green-500 text-green-500"
                          : "border-red-500 text-red-500"
                      }`}
                    >
                      {formatVolume(trade.volume)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
