// components/chart/ChartGrid.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

import { formatPrice, formatVolume } from "@/lib/chart-utils";

interface Trade {
  time: string;
  price: number;
  volume: number;
  side: "buy" | "sell";
}

export const ChartGrid: React.FC = () => {
  // This would typically come from your API
  const recentTrades: Trade[] = [
    {
      time: new Date().toLocaleTimeString(),
      price: 150.25,
      volume: 100,
      side: "buy",
    },
    {
      time: new Date().toLocaleTimeString(),
      price: 150.2,
      volume: 200,
      side: "sell",
    },
    // ... more trades
  ];

  return (
    <Card className="absolute bottom-0 right-0 h-48 m-4 border shadow-lg w-80 bg-card/80 backdrop-blur-sm">
      <div className="p-2 border-b bg-muted/50">
        <h3 className="text-sm font-medium">Recent Trades</h3>
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Time</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTrades.map((trade, index) => (
              <TableRow key={index}>
                <TableCell className="py-1 text-xs">{trade.time}</TableCell>
                <TableCell
                  className={`text-xs py-1 font-medium ${
                    trade.side === "buy"
                      ? "text-green-500 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {formatPrice(trade.price)}
                </TableCell>
                <TableCell className="py-1 text-xs text-right">
                  {formatVolume(trade.volume)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
};
