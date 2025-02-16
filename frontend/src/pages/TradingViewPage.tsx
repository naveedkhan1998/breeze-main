import React from "react";
import { useLocation } from "react-router-dom";

import { ChartContainer } from "@/components/chart/ChartContainer";
import { ChartHeader } from "@/components/chart/ChartHeader";
import { ChartSidebar } from "@/components/chart/ChartSidebar";
import { ChartProvider } from "@/components/chart/ChartContext";
import { Instrument } from "@/common-types";

interface LocationState {
  instrument: Instrument;
}

export const TradingViewPage: React.FC = () => {
  const location = useLocation();
  const { instrument } = (location.state as LocationState) || {};
  console.log("instrument", instrument);

  if (!instrument) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            No Instrument Selected
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Please select an instrument to view its chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChartProvider instrument={instrument}>
      <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
        <ChartHeader />
        <div className="flex flex-1 overflow-hidden">
          <ChartSidebar />
          <ChartContainer />
        </div>
      </div>
    </ChartProvider>
  );
};

export default TradingViewPage;
