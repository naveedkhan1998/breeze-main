import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  TrashIcon,
  CalendarIcon,
  BuildingIcon,
  CurrencyIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Instrument } from "@/types/common-types";

interface InstrumentCardProps {
  instrument: Instrument;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export const InstrumentCard: React.FC<InstrumentCardProps> = ({
  instrument,
  onDelete,
  isDeleting,
}) => {
  const isLoading = !instrument.percentage?.is_loading;

  const getTypeConfig = (series: string) => {
    const configs = {
      OPTION: {
        colors:
          "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 border-violet-200 dark:border-violet-800",
        gradient: "from-violet-500 to-fuchsia-500",
        icon: TrendingUpIcon,
      },
      FUTURE: {
        colors:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        gradient: "from-amber-500 to-orange-500",
        icon: CalendarIcon,
      },
      EQUITY: {
        colors:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        gradient: "from-emerald-500 to-teal-500",
        icon: CurrencyIcon,
      },
    };
    return configs[series as keyof typeof configs] || configs.EQUITY;
  };

  const config = getTypeConfig(instrument.series || "EQUITY");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden group">
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5`}
          />
        </div>

        <CardContent className="flex flex-col h-full p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge variant="secondary" className={`mb-2 ${config.colors}`}>
                {instrument.series === "OPTION"
                  ? `${instrument.option_type} Option`
                  : instrument.series === "FUTURE"
                    ? "Future"
                    : "Equity"}
              </Badge>
              <h3 className="text-2xl font-bold text-foreground">
                {instrument.exchange_code}
              </h3>
            </div>
            <config.icon className="w-6 h-6 opacity-50 text-muted-foreground" />
          </div>

          <div className="flex-grow mb-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BuildingIcon className="w-4 h-4" />
              <span>{instrument.company_name}</span>
            </div>

            {(instrument.series === "OPTION" ||
              instrument.series === "FUTURE") && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {instrument.series === "OPTION"
                    ? `Strike: ${instrument.strike_price} • Expires: ${formatDate(instrument.expiry ?? undefined)}`
                    : `Expires: ${formatDate(instrument.expiry ?? undefined)}`}
                </span>
              </div>
            )}

            {instrument.percentage && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {instrument.percentage.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={instrument.percentage.percentage}
                  className={`h-1.5 bg-muted`}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 mt-auto border-t border-border">
            <Button
              asChild
              disabled={isLoading}
              variant="default"
              className="flex-1 gap-2"
            >
              <Link to={`/graphs/${instrument.id}`} state={{ obj: instrument }}>
                <ChartBarIcon className="w-4 h-4" />
                View Graph
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(instrument.id)}
              className="gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
              disabled={isDeleting}
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InstrumentCard;
