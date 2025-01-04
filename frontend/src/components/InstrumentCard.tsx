import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiChartBar, HiTrash, HiClock, HiCurrencyDollar, HiOfficeBuilding } from "react-icons/hi";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Instrument } from "../common-types";

interface InstrumentCardProps {
  instrument: Instrument;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export const InstrumentCard: React.FC<InstrumentCardProps> = ({ instrument, onDelete, isDeleting }) => {
  const isLoading = !instrument.percentage?.is_loading;

  const getSeriesColor = (series: string) => {
    switch (series) {
      case "OPTION":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "FUTURE":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const renderInstrumentDetails = () => {
    const commonDetails = (
      <div className="space-y-3">
        <div className="flex items-center">
          <HiOfficeBuilding className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{instrument.company_name}</span>
        </div>
        <div className="flex items-center">
          <HiCurrencyDollar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{instrument.exchange_code}</span>
        </div>
      </div>
    );

    const getExpiryDate = () => {
      const date = instrument.expiry ? new Date(instrument.expiry) : new Date();
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    switch (true) {
      case instrument.series === "OPTION":
        return (
          <div className="space-y-4">
            {commonDetails}
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className={getSeriesColor(instrument.series)}>
                {instrument.option_type} Option
              </Badge>
              <div className="flex items-center">
                <HiClock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Strike: {instrument.strike_price} • Expires: {getExpiryDate()}
                </span>
              </div>
            </div>
          </div>
        );
      case instrument.series === "FUTURE":
        return (
          <div className="space-y-4">
            {commonDetails}
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className={getSeriesColor(instrument.series)}>
                Future
              </Badge>
              <div className="flex items-center">
                <HiClock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Expires: {getExpiryDate()}</span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {commonDetails}
            <Badge variant="secondary" className={getSeriesColor("EQUITY")}>
              Equity
            </Badge>
          </div>
        );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 bg-white dark:bg-gray-900 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{instrument.exchange_code}</h3>
          </div>

          <div className="mb-6">{renderInstrumentDetails()}</div>

          {instrument.percentage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{instrument.percentage.percentage.toFixed(2)}%</span>
              </div>
              <Progress value={instrument.percentage.percentage} className="h-2 bg-gray-100 dark:bg-gray-800" />
              {!instrument.percentage.percentage && (
                <div className="flex justify-center">
                  <div className="w-4 h-4 border-2 border-blue-600 rounded-full animate-spin border-t-transparent" />
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-3 p-6 border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
          <Link to={`/graphs/${instrument.id}`} state={{ obj: instrument }} className="w-full">
            <Button disabled={isLoading} variant="default" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
              <HiChartBar className="w-4 h-4 mr-2" />
              View Graph
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => onDelete(instrument.id)} className="w-full" disabled={isDeleting}>
            <HiTrash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default InstrumentCard;
