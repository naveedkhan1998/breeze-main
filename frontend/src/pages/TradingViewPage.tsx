import React, { useEffect } from "react";
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

  // Fallback instrument for development/testing
  const fallbackInstrument: Instrument = {
    id: 1,
    exchange_code: "SBIN",
    company_name: "State Bank of India",
    series: "EQUITY",
  };

  // Use the passed instrument or fallback for development
  const chartInstrument = instrument || fallbackInstrument;

  useEffect(() => {
    // Update page title
    document.title = `${chartInstrument.exchange_code} - Chart | Breeze`;

    // Clean up
    return () => {
      document.title = "Breeze";
    };
  }, [chartInstrument.exchange_code]);

  return (
    <ChartProvider instrument={chartInstrument}>
      {/* Fixed positioning to take full viewport height minus navbar */}
      <div className="fixed inset-0 z-10 top-16 bg-background">
        <div className="flex flex-col w-full h-full">
          <ChartHeader />
          <div className="flex flex-1 w-full h-full overflow-hidden">
            <ChartSidebar />
            <div className="relative flex-1 w-full h-full">
              <ChartContainer />
            </div>
          </div>
        </div>
      </div>
    </ChartProvider>
  );
};

export default TradingViewPage;
