import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiChartBar, HiTrash, HiClock, HiCurrencyDollar, HiOfficeBuilding } from "react-icons/hi";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Instrument } from "../common-types";

interface InstrumentCardProps {
  instrument: Instrument;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export const InstrumentCard: React.FC<InstrumentCardProps> = ({ instrument, onDelete, isDeleting }) => {
  const isLoading = !instrument.percentage.is_loading;

  const renderInstrumentDetails = () => {
    const commonDetails = (
      <>
        <div className="flex items-center mb-2">
          <HiOfficeBuilding className="w-5 h-5 mr-2 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{instrument.company_name}</span>
        </div>
        <div className="flex items-center mb-2">
          <HiCurrencyDollar className="w-5 h-5 mr-2 text-green-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{instrument.exchange_code}</span>
        </div>
      </>
    );

    switch (true) {
      case instrument.series === "OPTION":
        return (
          <div>
            {commonDetails}
            <div className="flex items-center mb-2">
              <HiClock className="w-5 h-5 mr-2 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {instrument.strike_price} {instrument.option_type} (Expires: {instrument.expiry})
              </span>
            </div>
          </div>
        );
      case instrument.series === "FUTURE":
        return (
          <div>
            {commonDetails}
            <div className="flex items-center mb-2">
              <HiClock className="w-5 h-5 mr-2 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Future (Expires: {instrument.expiry})</span>
            </div>
          </div>
        );
      default:
        return (
          <div>
            {commonDetails}
            <div className="flex items-center mb-2">
              <HiCurrencyDollar className="w-5 h-5 mr-2 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Equity</span>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
        <CardContent className="p-5">
          <h3 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white">{instrument.exchange_code}</h3>
          <div className="mb-4">{renderInstrumentDetails()}</div>
          <div className="mb-4">
            {instrument.percentage ? (
              <div key={instrument.id} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{instrument.percentage.percentage.toFixed(2)}%</span>
                </div>
                <Progress value={instrument.percentage.percentage} className="w-full h-2" />
                {!instrument.percentage.percentage && <div className="w-4 h-4 mt-1 text-blue-600 border-2 border-current rounded-full animate-spin border-t-transparent" />}
              </div>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">No data available</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 p-4 bg-gray-50 dark:bg-gray-800">
          <Link to={`/graphs/${instrument.id}`} state={{ obj: instrument }} className="w-full">
            <Button disabled={isLoading} size="sm" variant="default" className="w-full transition-all duration-300 hover:shadow-lg">
              <HiChartBar className="w-4 h-4 mr-2" />
              View Graph
            </Button>
          </Link>
          <Button size="sm" variant="destructive" onClick={() => onDelete(instrument.id)} className="w-full transition-all duration-300 hover:shadow-lg" disabled={isDeleting}>
            <HiTrash className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
